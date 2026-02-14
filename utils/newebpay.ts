
import CryptoJS from 'crypto-js';

// ==========================================
// 藍新金流設定
// 注意：目前設定為您的專屬測試帳號
// 若您要切換至正式環境，請將 URL 改為 https://core.newebpay.com/MPG/mpg_gateway
// 並更新對應的正式商店代號與金鑰
// ==========================================

const getConfig = (key: string, defaultValue: string = ''): string => {
  return (import.meta as any).env?.[key] || defaultValue;
};

export const NEWEB_CONFIG = {
  // 使用者提供的測試帳號設定
  MerchantID: 'MS158266171', 
  HashKey: 'xzJkGEmDgneYVxCkDP000SX6CT8rXY4d',     
  HashIV: 'CYVIAQAy9wJFlupP',       
  
  // 若要使用環境變數 (.env)，請改用下方寫法：
  // MerchantID: getConfig('VITE_NEWEB_MERCHANT_ID', 'MS158266171'),
  // HashKey: getConfig('VITE_NEWEB_HASH_KEY', 'xzJkGEmDgneYVxCkDP000SX6CT8rXY4d'),
  // HashIV: getConfig('VITE_NEWEB_HASH_IV', 'CYVIAQAy9wJFlupP'),

  Version: '2.0',
  // 測試環境 URL (ccore 為測試環境)
  URL: 'https://ccore.newebpay.com/MPG/mpg_gateway', 
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
  if (!NEWEB_CONFIG.MerchantID || !NEWEB_CONFIG.HashKey || !NEWEB_CONFIG.HashIV) {
    alert("金流參數設定不完整，請檢查 utils/newebpay.ts");
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

  // [重要] 靜態網站 (Static Site) 不支援 POST 請求的回調
  // 因此這裡不設定 ReturnURL，避免藍新嘗試 POST 回來導致 HTTP 405 錯誤
  // 我們依賴使用者在藍新頁面點擊「返回商店」按鈕 (ClientBackURL) 以 GET 方式返回
  params.append('ClientBackURL', `${baseUrl}/#/payment-result`); 
  
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
