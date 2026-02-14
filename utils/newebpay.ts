
import CryptoJS from 'crypto-js';

// ==========================================
// 藍新金流設定 (正式環境 Production)
// ==========================================

const getConfig = (key: string, defaultValue: string = ''): string => {
  return (import.meta as any).env?.[key] || defaultValue;
};

export const NEWEB_CONFIG = {
  // 【請填入您的正式商店資料】
  // 建議：正式上線時，將這些金鑰移至 .env 檔案中透過 import.meta.env 讀取，避免寫死在程式碼中
  MerchantID: 'OSS000000002208', // 例如：3123456...
  HashKey: 'ZOf3JWSAzQrqVyywI91mXSi1SwB3HgVQ',     // 例如：ab3...
  HashIV: 'PUmmBRggmiKNDynC',       // 例如：123...
  
  // 若您已設定 .env，可改用以下方式：
  // MerchantID: getConfig('VITE_NEWEB_MERCHANT_ID', ''),
  // HashKey: getConfig('VITE_NEWEB_HASH_KEY', ''),
  // HashIV: getConfig('VITE_NEWEB_HASH_IV', ''),

  Version: '2.0',
  
  // 【正式環境 URL】 (注意：測試環境是 ccore，正式環境是 core)
  URL: 'https://core.newebpay.com/MPG/mpg_gateway', 
};

// 產生 AES 加密字串
const encrypt = (data: string): string => {
  const key = CryptoJS.enc.Utf8.parse(NEWEB_CONFIG.HashKey);
  const iv = CryptoJS.enc.Utf8.parse(NEWEB_CONFIG.HashIV);
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
};

// 產生 SHA256 雜湊
const hash = (aes: string): string => {
  const str = `HashKey=${NEWEB_CONFIG.HashKey}&${aes}&HashIV=${NEWEB_CONFIG.HashIV}`;
  return CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex).toUpperCase();
};

export interface NewebPayData {
  MerchantOrderNo: string;
  Amt: number;
  ItemDesc: string;
  Email: string;
}

// 產生提交給藍新的表單資料
export const generateNewebPayForm = (data: NewebPayData) => {
  // Double check
  if (!NEWEB_CONFIG.MerchantID || NEWEB_CONFIG.MerchantID.includes('請填入') || !NEWEB_CONFIG.HashKey || !NEWEB_CONFIG.HashIV) {
    alert("請先至 utils/newebpay.ts 填入正式環境的 MerchantID, HashKey 與 HashIV");
    return { action: '', fields: {} };
  }

  console.log("Preparing NewebPay Form for MerchantID:", NEWEB_CONFIG.MerchantID);

  // 1. 準備交易參數 (URL Encoded String)
  const params = new URLSearchParams();
  params.append('MerchantID', NEWEB_CONFIG.MerchantID);
  params.append('RespondType', 'JSON');
  params.append('TimeStamp', Math.floor(Date.now() / 1000).toString());
  params.append('Version', NEWEB_CONFIG.Version);
  params.append('MerchantOrderNo', data.MerchantOrderNo);
  params.append('Amt', data.Amt.toString());
  params.append('ItemDesc', data.ItemDesc); // 商品描述
  params.append('Email', data.Email);
  params.append('LoginType', '0'); // 0: 不須登入藍新會員
  params.append('CREDIT', '1'); // 啟用信用卡
  params.append('VACC', '1');   // 啟用 ATM 轉帳 (即時對帳)
  
  // 回傳網址設定
  const baseUrl = window.location.origin;

  // [前端返回] 讓使用者付款後點擊按鈕返回網站 (GET)
  params.append('ClientBackURL', `${baseUrl}/#/payment-result`); 
  
  // [後端通知] 讓藍新在背景通知 Supabase Edge Function (POST)
  const SUPABASE_PROJECT_ID = 'kpltydyspvzozgxfiwra';
  const DEFAULT_FUNCTION_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/newebpay-notify`;
  
  const notifyUrl = getConfig('VITE_SUPABASE_FUNCTION_URL', DEFAULT_FUNCTION_URL);
  
  console.log('Setting NotifyURL to:', notifyUrl);
  params.append('NotifyURL', notifyUrl);
  
  // 2. 加密 TradeInfo
  const tradeInfo = encrypt(params.toString());
  
  // 3. 產生 TradeSha
  const tradeSha = hash(tradeInfo);

  return {
    action: NEWEB_CONFIG.URL,
    fields: {
      MerchantID: NEWEB_CONFIG.MerchantID,
      TradeInfo: tradeInfo,
      TradeSha: tradeSha,
      Version: NEWEB_CONFIG.Version
    }
  };
};

export const submitNewebPayForm = (data: NewebPayData) => {
  const formInfo = generateNewebPayForm(data);
  
  if (!formInfo.action) return;

  // 建立隱藏表單
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = formInfo.action;
  form.style.display = 'none';

  // 加入欄位
  Object.entries(formInfo.fields).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value as string;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  
  // 清除表單
  setTimeout(() => document.body.removeChild(form), 1000);
};
