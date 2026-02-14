
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1"
import CryptoJS from "https://esm.sh/crypto-js@4.2.0"

// Declare Deno for TypeScript
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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("[Notify] Received request");
    
    // 1. Parse Form Data
    const formData = await req.formData()
    const TradeInfo = formData.get('TradeInfo') as string
    
    if (!TradeInfo) {
      console.error('[Notify] Error: No TradeInfo received')
      return new Response('No TradeInfo', { status: 400 })
    }

    // 2. Get Secrets & Init DB
    const HashKey = Deno.env.get('NEWEB_HASH_KEY')
    const HashIV = Deno.env.get('NEWEB_HASH_IV')
    const SupabaseUrl = Deno.env.get('SUPABASE_URL')
    
    // Fallback: Try Service Key first, then Anon Key (Works if RLS is disabled)
    // 這裡做了權限救援：如果 Service Role Key 沒設定好，會嘗試用 Anon Key
    const SupabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!HashKey || !HashIV || !SupabaseUrl || !SupabaseKey) {
      console.error('[Notify] Error: Missing env variables (Check NEWEB_HASH_KEY, NEWEB_HASH_IV, SUPABASE_URL)')
      throw new Error('Missing environment variables')
    }

    // 3. Decrypt TradeInfo
    try {
        const key = CryptoJS.enc.Utf8.parse(HashKey)
        const iv = CryptoJS.enc.Utf8.parse(HashIV)
        
        // Hex -> Base64 -> Decrypt
        // 藍新回傳的是 Hex 字串，必須先轉為 Base64 才能讓 CryptoJS 解密
        const encryptedHex = CryptoJS.enc.Hex.parse(TradeInfo)
        const encryptedBase64 = CryptoJS.enc.Base64.stringify(encryptedHex)

        const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        })
        
        const rawDecryptedText = decrypted.toString(CryptoJS.enc.Utf8)
        
        if (!rawDecryptedText) {
          throw new Error('Decrypted string is empty')
        }

        // 4. Clean String (CRITICAL STEP - 重點修正)
        // 移除所有隱藏的控制字元 (0x00-0x1F)，這些字元會導致 JSON.parse 崩潰 (500 Error 的主因)
        const cleanJsonString = rawDecryptedText.replace(/[\x00-\x1F\x7F]/g, '');

        // 5. Parse JSON
        let paymentData;
        try {
            paymentData = JSON.parse(cleanJsonString)
        } catch (e) {
            console.error('[Notify] JSON Parse Failed. Raw:', rawDecryptedText);
            throw new Error('JSON Parse error: ' + e.message);
        }

        console.log(`[Notify] Decoded Order: ${paymentData.Result?.MerchantOrderNo}, Status: ${paymentData.Status}`)

        // 6. Process Payment
        if (paymentData.Status === 'SUCCESS') {
          const result = paymentData.Result
          const merchantOrderNo = result.MerchantOrderNo
          const amount = result.Amt
          const payTime = result.PayTime 
          const paymentMethod = result.PaymentType 

          // Init Supabase
          const supabase = createClient(SupabaseUrl, SupabaseKey)

          // Defensive Date Parsing (防止日期格式錯誤導致寫入失敗)
          let paidAtISO = new Date().toISOString();
          if (payTime) {
              const parsedDate = new Date(payTime);
              if (!isNaN(parsedDate.getTime())) {
                  paidAtISO = parsedDate.toISOString();
              }
          }

          const updatePayload = {
            payment_status: 'paid',
            paid_amount: amount,
            paid_at: paidAtISO,
            merchant_order_no: merchantOrderNo,
            payment_method: paymentMethod
          }

          // 6.1 Update 'registrations' (一般活動)
          const { data: regData, error: regError } = await supabase
            .from('registrations')
            .update(updatePayload)
            .eq('merchant_order_no', merchantOrderNo)
            .select()

          if (regError) {
            console.error('[Notify] Update Registrations Error:', regError)
          } else if (regData && regData.length > 0) {
            console.log(`[Notify] Success! Updated Registration: ${merchantOrderNo}`)
          } else {
            // 6.2 If not found, Update 'member_registrations' (會員活動)
            const { data: memData, error: memError } = await supabase
              .from('member_registrations')
              .update(updatePayload)
              .eq('merchant_order_no', merchantOrderNo)
              .select()

            if (memError) {
                console.error('[Notify] Update Member Registrations Error:', memError)
            } else if (memData && memData.length > 0) {
                console.log(`[Notify] Success! Updated Member Registration: ${merchantOrderNo}`)
            } else {
                console.warn(`[Notify] Warning: Order not found in any table: ${merchantOrderNo}`)
            }
          }
        } else {
            console.log(`[Notify] Payment Status is not SUCCESS: ${paymentData.Status}`)
        }

        return new Response('OK', { 
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
          status: 200 
        })

    } catch (innerError: any) {
        console.error('[Notify] Logic Error:', innerError.message)
        throw innerError // Re-throw to be caught by outer block
    }

  } catch (error: any) {
    console.error('[Notify] Critical Error:', error.message)
    // 回傳 500 給藍新，這樣您才會收到那封「觸發失敗通知信」，方便我們除錯
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
