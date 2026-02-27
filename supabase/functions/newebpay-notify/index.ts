
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

// --- ezPay Invoice Helpers ---
async function issueEzPayInvoice(params: {
  merchantOrderNo: string,
  buyerName: string,
  buyerEmail: string,
  totalAmt: number,
  itemName: string,
  taxId?: string,
  companyName?: string
}) {
  const merchantId = Deno.env.get('EZPAY_MERCHANT_ID');
  const hashKey = Deno.env.get('EZPAY_HASH_KEY');
  const hashIV = Deno.env.get('EZPAY_HASH_IV');

  if (!merchantId || !hashKey || !hashIV) {
    console.warn('[Notify] ezPay credentials missing, skipping invoice');
    return { success: false, message: 'Missing credentials' };
  }

  // Calculate Tax (B2C/B2B Taxable 5%)
  const totalAmt = params.totalAmt;
  const amt = Math.round(totalAmt / 1.05);
  const taxAmt = totalAmt - amt;

  const postData: any = {
    RespondType: 'JSON',
    Version: '1.5',
    TimeStamp: Math.floor(Date.now() / 1000).toString(),
    MerchantOrderNo: params.merchantOrderNo,
    Status: '1', // 1=立即開立
    Category: params.taxId ? 'B2B' : 'B2C',
    BuyerName: params.buyerName,
    BuyerEmail: params.buyerEmail,
    PrintFlag: 'Y',
    TaxType: '1',
    TaxRate: 5,
    Amt: amt,
    TaxAmt: taxAmt,
    TotalAmt: totalAmt,
    ItemName: params.itemName,
    ItemCount: '1',
    ItemUnit: '式',
    ItemPrice: totalAmt,
    ItemAmt: totalAmt,
  };

  if (params.taxId) {
    postData.BuyerUBN = params.taxId;
    postData.BuyerName = params.companyName || params.buyerName;
  }

  // Encrypt PostData
  const postDataString = Object.keys(postData)
    .map(key => `${key}=${encodeURIComponent(postData[key])}`)
    .join('&');
  
  const key = CryptoJS.enc.Utf8.parse(hashKey);
  const iv = CryptoJS.enc.Utf8.parse(hashIV);
  const encrypted = CryptoJS.AES.encrypt(postDataString, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  const encryptedString = encrypted.toString();

  try {
    const formData = new URLSearchParams();
    formData.append('MerchantID_', merchantId);
    formData.append('PostData_', encryptedString);

    const response = await fetch('https://inv.ezpay.com.tw/Api_inv_issue/AESissue', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const result = await response.json();
    console.log('[Notify] ezPay Response:', result);

    if (result.Status === 'SUCCESS') {
      const data = JSON.parse(result.Result);
      return { success: true, invoiceNo: data.InvoiceNumber };
    } else {
      return { success: false, message: result.Message };
    }
  } catch (err) {
    console.error('[Notify] ezPay API Error:', err);
    return { success: false, message: 'API connection failed' };
  }
}

// --- Main Handler ---
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

          // Helper: Send Email via EmailJS REST API
          const sendEmail = async (templateId: string, params: any) => {
            const serviceId = Deno.env.get('EMAILJS_SERVICE_ID');
            const publicKey = Deno.env.get('EMAILJS_PUBLIC_KEY');
            
            if (!serviceId || !publicKey) {
              console.warn('[Notify] EmailJS env variables missing, skipping email');
              return;
            }

            try {
              const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  service_id: serviceId,
                  template_id: templateId,
                  user_id: publicKey,
                  template_params: params
                })
              });
              
              if (response.ok) {
                console.log(`[Notify] Email sent successfully to ${params.email || params.to_email}`);
              } else {
                const errText = await response.text();
                console.error('[Notify] Email sending failed:', errText);
              }
            } catch (e) {
              console.error('[Notify] Email sending error:', e);
            }
          };

          // 6.1 Update 'registrations' (一般活動)
          console.log(`[Notify] Attempting to update registrations for ${merchantOrderNo}`);
          const { data: regData, error: regError } = await supabase
            .from('registrations')
            .update(updatePayload)
            .eq('merchant_order_no', merchantOrderNo)
            .select('*, activities(*)')
            .single()

          if (regError && regError.code !== 'PGRST116') {
            console.error(`[Notify] registrations update error:`, regError);
          }
          
          if (regData) {
            console.log(`[Notify] Success! Updated Registration: ${merchantOrderNo}`)
            
            // --- NEW: Issue ezPay Invoice ---
            const invResult = await issueEzPayInvoice({
              merchantOrderNo: merchantOrderNo,
              buyerName: regData.name,
              buyerEmail: regData.email,
              totalAmt: regData.paid_amount,
              itemName: regData.activities?.title || '活動報名費'
            });

            if (invResult.success) {
              await supabase.from('registrations').update({
                invoice_no: invResult.invoiceNo,
                invoice_status: 'issued'
              }).eq('merchant_order_no', merchantOrderNo);
            } else {
              await supabase.from('registrations').update({
                invoice_status: 'failed'
              }).eq('merchant_order_no', merchantOrderNo);
            }

            // Send Email
            const activity = regData.activities;
            await sendEmail(Deno.env.get('EMAILJS_TEMPLATE_ID') || 'template_ih0plai', {
              to_name: regData.name,
              email: regData.email,
              activity_title: activity?.title,
              activity_date: activity?.date,
              activity_time: activity?.time,
              activity_location: activity?.location,
              activity_price: regData.paid_amount
            });
          }

          if (!regData) {
            // 6.2 If not found, Update 'member_registrations' (會員活動)
            console.log(`[Notify] Attempting to update member_registrations for ${merchantOrderNo}`);
            const { data: memData, error: memError } = await supabase
              .from('member_registrations')
              .update(updatePayload)
              .eq('merchant_order_no', merchantOrderNo)
              .select('*, activities(*), member:members(email)')
              .single()

            if (memError && memError.code !== 'PGRST116') {
              console.error(`[Notify] member_registrations update error:`, memError);
            }
            
            if (memData) {
              console.log(`[Notify] Success! Updated Member Registration: ${merchantOrderNo}`)
              
              // --- NEW: Issue ezPay Invoice ---
              const invResult = await issueEzPayInvoice({
                merchantOrderNo: merchantOrderNo,
                buyerName: memData.member_name,
                buyerEmail: memData.member?.email || '',
                totalAmt: memData.paid_amount,
                itemName: memData.activities?.title || '會員活動報名費'
              });

              if (invResult.success) {
                await supabase.from('member_registrations').update({
                  invoice_no: invResult.invoiceNo,
                  invoice_status: 'issued'
                }).eq('merchant_order_no', merchantOrderNo);
              } else {
                await supabase.from('member_registrations').update({
                  invoice_status: 'failed'
                }).eq('merchant_order_no', merchantOrderNo);
              }

              // Send Email
              const activity = memData.activities;
              const memberEmail = memData.member?.email;
              await sendEmail(Deno.env.get('EMAILJS_TEMPLATE_ID') || 'template_ih0plai', {
                to_name: memData.member_name,
                email: memberEmail || '', 
                activity_title: activity?.title,
                activity_date: activity?.date,
                activity_time: activity?.time,
                activity_location: activity?.location,
                activity_price: memData.paid_amount
              });
            }

            if (!memData) {
              // 6.3 If not found, Update 'member_applications' (新會員入會)
              console.log(`[Notify] Attempting to update member_applications for ${merchantOrderNo}`);
              const { data: appData, error: appError } = await supabase
                .from('member_applications')
                .update(updatePayload)
                .eq('merchant_order_no', merchantOrderNo)
                .select()
                .single()

              if (appError && appError.code !== 'PGRST116') {
                console.error(`[Notify] member_applications update error:`, appError);
              }
              
              if (appData) {
                console.log(`[Notify] Success! Updated Member Application: ${merchantOrderNo}`)
                
                // --- NEW: Issue ezPay Invoice ---
                const invResult = await issueEzPayInvoice({
                  merchantOrderNo: merchantOrderNo,
                  buyerName: appData.name,
                  buyerEmail: appData.email,
                  totalAmt: appData.paid_amount,
                  itemName: '食在力量會員入會費',
                  taxId: appData.tax_id,
                  companyName: appData.company_name
                });

                if (invResult.success) {
                  await supabase.from('member_applications').update({
                    invoice_no: invResult.invoiceNo,
                    invoice_status: 'issued'
                  }).eq('merchant_order_no', merchantOrderNo);
                } else {
                  await supabase.from('member_applications').update({
                    invoice_status: 'failed'
                  }).eq('merchant_order_no', merchantOrderNo);
                }

                // Send Email
                await sendEmail(Deno.env.get('EMAILJS_MEMBER_JOIN_TEMPLATE_ID') || 'template_gu7mwvm', {
                  to_name: appData.name,
                  email: appData.email,
                  activity_title: '【食在力量】會員入會申請',
                  activity_date: new Date().toISOString().slice(0, 10),
                  activity_time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
                  activity_location: '線上申請 (已完成繳費)',
                  activity_price: `NT$ ${appData.paid_amount?.toLocaleString()}`,
                  message: `您的入會申請已收到並完成繳費，管理員將於 3-5 個工作天內完成審核。`
                });
              }

              if (!appData) {
                // 6.4 If not found, Update 'member_renewals' (會員續約)
                console.log(`[Notify] Attempting to update member_renewals for ${merchantOrderNo}`);
                const { data: renewData, error: renewError } = await supabase
                  .from('member_renewals')
                  .update({
                    payment_status: 'paid',
                    paid_at: paidAtISO,
                    payment_method: paymentMethod
                  })
                  .eq('merchant_order_no', merchantOrderNo)
                  .select('*, member:members(name, email)')
                  .single()

                if (renewError && renewError.code !== 'PGRST116') {
                  console.error(`[Notify] member_renewals update error:`, renewError);
                }
                
                if (renewData) {
                  console.log(`[Notify] Success! Updated Member Renewal: ${merchantOrderNo}`)
                  
                  // --- NEW: Issue ezPay Invoice ---
                  const invResult = await issueEzPayInvoice({
                    merchantOrderNo: merchantOrderNo,
                    buyerName: renewData.member?.name || '',
                    buyerEmail: renewData.member?.email || '',
                    totalAmt: renewData.amount,
                    itemName: '食在力量會員續約費'
                  });

                  if (invResult.success) {
                    await supabase.from('member_renewals').update({
                      invoice_no: invResult.invoiceNo,
                      invoice_status: 'issued'
                    }).eq('merchant_order_no', merchantOrderNo);
                  } else {
                    await supabase.from('member_renewals').update({
                      invoice_status: 'failed'
                    }).eq('merchant_order_no', merchantOrderNo);
                  }

                  // --- NEW: Automatically extend membership expiry date ---
                  try {
                    const memberId = renewData.member_id;
                    const { data: memberData, error: memberError } = await supabase
                      .from('members')
                      .select('membership_expiry_date')
                      .eq('id', memberId)
                      .single();
                    
                    if (!memberError && memberData) {
                      let newExpiryDate;
                      const currentExpiry = memberData.membership_expiry_date ? new Date(memberData.membership_expiry_date) : null;
                      const today = new Date();
                      
                      if (currentExpiry && currentExpiry > today) {
                        // If not expired, add 1 year to current expiry
                        newExpiryDate = new Date(currentExpiry);
                        newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
                      } else {
                        // If expired or no date, add 1 year to today
                        newExpiryDate = new Date(today);
                        newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
                      }

                      const { error: extendError } = await supabase
                        .from('members')
                        .update({
                          membership_expiry_date: newExpiryDate.toISOString().split('T')[0],
                          status: 'active'
                        })
                        .eq('id', memberId);
                      
                      if (extendError) {
                        console.error('[Notify] Auto-extend membership error:', extendError);
                      } else {
                        console.log(`[Notify] Successfully extended membership for member ${memberId} to ${newExpiryDate.toISOString().split('T')[0]}`);
                      }
                    }
                  } catch (extendCatch) {
                    console.error('[Notify] Exception during auto-extend:', extendCatch);
                  }
                  // --- End of Auto-extend ---

                  // Send Email
                  await sendEmail(Deno.env.get('EMAILJS_MEMBER_JOIN_TEMPLATE_ID') || 'template_gu7mwvm', {
                    to_name: renewData.member?.name,
                    email: renewData.member?.email,
                    activity_title: '【食在力量】會員續約申請',
                    activity_date: new Date().toISOString().slice(0, 10),
                    activity_time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
                    activity_location: '線上續約 (已完成繳費)',
                    activity_price: `NT$ ${renewData.amount?.toLocaleString()}`,
                    message: `您的會員續約已完成繳費，會籍已自動延長。`
                  });
                } else {
                  console.warn(`[Notify] Warning: Order not found in any table: ${merchantOrderNo}`)
                }
              }
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
