
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
    const formData = await req.formData()
    const TradeInfo = formData.get('TradeInfo') as string
    
    if (!TradeInfo) {
      console.error('No TradeInfo received')
      return new Response('No TradeInfo', { status: 400 })
    }

    // 1. Get Secrets
    const HashKey = Deno.env.get('NEWEB_HASH_KEY')
    const HashIV = Deno.env.get('NEWEB_HASH_IV')
    const SupabaseUrl = Deno.env.get('SUPABASE_URL')
    const SupabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!HashKey || !HashIV || !SupabaseUrl || !SupabaseServiceKey) {
      throw new Error('Missing environment variables (Keys or DB config)')
    }

    // 2. Decrypt TradeInfo
    // Fix: NewebPay returns Hex string. Convert Hex -> WordArray -> Base64 -> Decrypt
    const key = CryptoJS.enc.Utf8.parse(HashKey)
    const iv = CryptoJS.enc.Utf8.parse(HashIV)
    
    // Parse Hex string to WordArray (Critical Fix!)
    const encryptedHex = CryptoJS.enc.Hex.parse(TradeInfo)
    // Convert to Base64 (CryptoJS default expectation)
    const encryptedBase64 = CryptoJS.enc.Base64.stringify(encryptedHex)

    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)
    
    if (!decryptedText) {
      throw new Error('Decryption result is empty')
    }
    
    // Handle Padding / JSON parsing
    // Sometimes decrypted text has padding issues, use last brace as marker
    const lastBrace = decryptedText.lastIndexOf('}')
    if (lastBrace === -1) throw new Error('Invalid JSON format in decrypted text')
    
    const cleanJsonString = decryptedText.substring(0, lastBrace + 1)
    
    let paymentData
    try {
        paymentData = JSON.parse(cleanJsonString)
    } catch (e: any) {
        throw new Error(`JSON Parse failed: ${e.message}`)
    }

    console.log(`[Notify] Order: ${paymentData.Result?.MerchantOrderNo}, Status: ${paymentData.Status}`)

    // 3. Process Payment
    if (paymentData.Status === 'SUCCESS') {
      const result = paymentData.Result
      const merchantOrderNo = result.MerchantOrderNo
      const amount = result.Amt
      const payTime = result.PayTime
      const paymentMethod = result.PaymentType // CREDIT, VACC, etc.

      // Initialize Supabase Admin (Service Role)
      const supabaseAdmin = createClient(SupabaseUrl, SupabaseServiceKey)

      const updatePayload = {
        payment_status: 'paid',
        paid_amount: amount,
        paid_at: payTime ? new Date(payTime).toISOString() : new Date().toISOString(),
        merchant_order_no: merchantOrderNo,
        payment_method: paymentMethod
      }

      // 3.1 Try updating 'registrations' table
      const { data: regData, error: regError } = await supabaseAdmin
        .from('registrations')
        .update(updatePayload)
        .eq('merchant_order_no', merchantOrderNo)
        .select()

      if (regError) {
        console.error('Error updating registrations:', regError)
      } else if (regData && regData.length > 0) {
        console.log(`[Success] General Registration Updated: ${merchantOrderNo}`)
      } else {
        // 3.2 If not found, try 'member_registrations' table
        const { data: memData, error: memError } = await supabaseAdmin
          .from('member_registrations')
          .update(updatePayload)
          .eq('merchant_order_no', merchantOrderNo)
          .select()

        if (memError) {
            console.error('Error updating member_registrations:', memError)
        } else if (memData && memData.length > 0) {
            console.log(`[Success] Member Registration Updated: ${merchantOrderNo}`)
        } else {
            console.warn(`[Warning] Order not found in database: ${merchantOrderNo}`)
        }
      }
    } else {
        console.log(`[Payment Failed or Pending] Status: ${paymentData.Status}`)
    }

    // Return 200 OK to NewebPay
    return new Response('OK', { 
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      status: 200 
    })

  } catch (error: any) {
    console.error('Notify Function Error:', error.message)
    // Return 500 so NewebPay knows it failed (and sends the email user received)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
