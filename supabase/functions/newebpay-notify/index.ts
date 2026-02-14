import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1"
import CryptoJS from "https://esm.sh/crypto-js@4.2.0"

// Declare Deno to avoid TypeScript errors in non-Deno environments
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 處理 CORS Preflight 請求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 藍新傳送的是 application/x-www-form-urlencoded
    const formData = await req.formData()
    const TradeInfo = formData.get('TradeInfo') as string
    
    if (!TradeInfo) {
      console.error('No TradeInfo received')
      return new Response('No TradeInfo', { status: 400 })
    }

    // 1. 取得環境變數中的金鑰
    const HashKey = Deno.env.get('NEWEB_HASH_KEY')
    const HashIV = Deno.env.get('NEWEB_HASH_IV')
    
    if (!HashKey || !HashIV) {
      throw new Error('Server configuration error: Missing NEWEB_HASH_KEY or NEWEB_HASH_IV')
    }

    // 2. 解密 TradeInfo
    // AES 解密
    const key = CryptoJS.enc.Utf8.parse(HashKey)
    const iv = CryptoJS.enc.Utf8.parse(HashIV)
    const decrypted = CryptoJS.AES.decrypt(TradeInfo, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)
    
    // 清理可能的 Padding 字元，確保是合法的 JSON
    // 通常 JSON 結尾是 '}'，我們取最後一個 '}' 之前的部分
    const lastBrace = decryptedText.lastIndexOf('}')
    if (lastBrace === -1) throw new Error('Invalid decrypted JSON format')
    
    const cleanJsonString = decryptedText.substring(0, lastBrace + 1)
    
    let paymentData
    try {
        paymentData = JSON.parse(cleanJsonString)
    } catch (e) {
        console.error('JSON Parse Error:', e, 'Raw:', cleanJsonString)
        throw new Error('Failed to parse payment data')
    }

    console.log(`[Payment Notify] Order: ${paymentData.Result?.MerchantOrderNo}, Status: ${paymentData.Status}`)

    // 3. 檢查交易狀態 (SUCCESS 才處理)
    if (paymentData.Status === 'SUCCESS') {
      const result = paymentData.Result
      const merchantOrderNo = result.MerchantOrderNo
      const payTime = result.PayTime // Format: 2023-06-01 12:00:00
      const amount = result.Amt
      const tradeNo = result.TradeNo
      const paymentMethod = result.PaymentType

      // 4. 初始化 Supabase Admin Client
      // 必須使用 Service Role Key 才能繞過 RLS 更新資料
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const updatePayload = {
        payment_status: 'paid',
        paid_amount: amount,
        paid_at: payTime ? new Date(payTime).toISOString() : new Date().toISOString(),
        merchant_order_no: merchantOrderNo,
        payment_method: paymentMethod
        // 可選：將完整藍新資訊存入 extra_data 或類似欄位
      }

      // 5. 更新資料庫
      // 策略：先嘗試更新一般活動報名表 (registrations)
      const { data: regData, error: regError } = await supabaseAdmin
        .from('registrations')
        .update(updatePayload)
        .eq('merchant_order_no', merchantOrderNo)
        .select()

      if (regError) console.error('Error updating registrations:', regError)

      // 如果一般報名沒找到，嘗試更新會員活動報名表 (member_registrations)
      if (!regData || regData.length === 0) {
        const { data: memData, error: memError } = await supabaseAdmin
          .from('member_registrations')
          .update(updatePayload)
          .eq('merchant_order_no', merchantOrderNo)
          .select()
          
        if (memError) console.error('Error updating member_registrations:', memError)
        
        if (memData && memData.length > 0) {
            console.log(`[Success] Updated Member Registration: ${merchantOrderNo}`)
        } else {
            console.warn(`[Warning] Order not found in any table: ${merchantOrderNo}`)
        }
      } else {
        console.log(`[Success] Updated General Registration: ${merchantOrderNo}`)
      }
    } else {
        console.log(`[Payment Failed] Status: ${paymentData.Status}, Message: ${paymentData.Message}`)
    }

    // 6. 回傳 200 OK 給藍新 (必要)
    return new Response('OK', { 
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      status: 200 
    })

  } catch (error: any) {
    console.error('Error processing notification:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})