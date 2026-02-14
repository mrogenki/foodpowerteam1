
import CryptoJS from 'crypto-js';

// ==========================================
// 統一金流 (PayUni) 設定
// 文件參考: https://docs.payuni.com.tw/web/#/7/24
// 請在 .env 設定 VITE_PAYUNI_MERCHANT_ID, VITE_PAYUNI_HASH_KEY, VITE_PAYUNI_HASH_IV
// ==========================================

const getConfig = (key: string, defaultValue: string = ''): string => {
  return (import.meta as any).env?.[key] || defaultValue;
};

const PAYUNI_CONFIG = {
  MerchantID: getConfig('VITE_PAYUNI_MERCHANT_ID', '50162540'), // 預設沙盒商店代號
  HashKey: getConfig('VITE_PAYUNI_HASH_KEY', '13524685125334526842681531215412'), // 預設沙盒 Key
  HashIV: getConfig('VITE_PAYUNI_HASH_IV', '1524151241535412'),   // 預設沙盒 IV
  Version: '1.0',
  // 沙盒環境: https://sandbox-api.payuni.com.tw/api/upp
  // 正式環境: https://api.payuni.com.tw/api/upp
  URL: getConfig('VITE_PAYUNI_API_URL', 'https://sandbox-api.payuni.com.tw/api/upp'), 
};

export interface PayUniData {
  MerchantTradeNo: string;
  TradeAmt: number;
  ProdName: string;
  TradeDesc: string;
  Email: string;
}

// AES-256-CBC 加密
const encryptAES = (data: string): string => {
  const key = CryptoJS.enc.Utf8.parse(PAYUNI_CONFIG.HashKey);
  const iv = CryptoJS.enc.Utf8.parse(PAYUNI_CONFIG.HashIV);
  
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  // PayUni 要求輸出為 Hex String 並轉大寫 (通常)
  return encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
};

// SHA-256 雜湊
const encryptSHA256 = (encryptInfo: string): string => {
  // 格式: HashKey={HashKey}&{EncryptInfo}&HashIV={HashIV}
  const str = `HashKey=${PAYUNI_CONFIG.HashKey}&${encryptInfo}&HashIV=${PAYUNI_CONFIG.HashIV}`;
  return CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex).toUpperCase();
};

export const generatePayUniForm = (data: PayUniData) => {
  if (!PAYUNI_CONFIG.HashKey || !PAYUNI_CONFIG.HashIV) {
    console.error("統一金流 (PayUni) HashKey 或 HashIV 未設定");
    alert("系統設定錯誤：金流參數缺失");
    return { action: '', fields: {} };
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const baseUrl = window.location.origin;
  
  // 設定回傳頁面 (HashRouter 模式下請注意路徑)
  const returnUrl = `${baseUrl}/#/payment-result`;

  // 1. 準備加密內容 (EncryptInfo 的原始資料)
  // PayUni 要求將參數組合成 Query String 格式
  const tradeParams = new URLSearchParams();
  tradeParams.append('MerID', PAYUNI_CONFIG.MerchantID);
  tradeParams.append('MerTradeNo', data.MerchantTradeNo);
  tradeParams.append('TradeAmt', Math.floor(data.TradeAmt).toString()); // 必須是整數
  tradeParams.append('ProdName', data.ProdName);
  
  // ReturnURL: 交易完成後，PayUni Server 會 POST 結果到此網址 (若純靜態前端可能會擋 POST，故需依賴 ClientBackURL)
  tradeParams.append('ReturnURL', returnUrl); 
  
  // UsrMail: 消費者信箱
  tradeParams.append('UsrMail', data.Email);
  tradeParams.append('Timestamp', timestamp);
  
  // ClientBackURL: 消費者點擊「返回商店」按鈕的網址 (通常是 GET)
  // 我們將其設為與 ReturnURL 相同，確保使用者能回到結果頁
  // 注意：PayUni 文件中此欄位名稱可能為 ClientBackURL 或 BackURL，請依最新文件為準，此處使用通用參數
  
  // 2. 進行 AES 加密
  const encryptInfo = encryptAES(tradeParams.toString());

  // 3. 進行 SHA256 簽章
  const hashInfo = encryptSHA256(encryptInfo);

  // 4. 準備表單欄位
  const fields = {
    MerID: PAYUNI_CONFIG.MerchantID,
    Version: PAYUNI_CONFIG.Version,
    Timestamp: timestamp,
    EncryptInfo: encryptInfo,
    HashInfo: hashInfo
  };

  return {
    action: PAYUNI_CONFIG.URL,
    fields: fields
  };
};

export const submitPayUniForm = (data: PayUniData) => {
  const formInfo = generatePayUniForm(data);
  
  if (!formInfo.action) return;

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = formInfo.action;
  form.style.display = 'none';

  Object.entries(formInfo.fields).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  
  setTimeout(() => document.body.removeChild(form), 1000);
};
