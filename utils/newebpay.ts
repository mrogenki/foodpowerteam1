
import CryptoJS from 'crypto-js';

// ==========================================
// 藍新金流設定
// 透過環境變數讀取，避免金鑰直接暴露在程式碼庫中
// 請在 .env 檔案中設定 VITE_NEWEB_MERCHANT_ID, VITE_NEWEB_HASH_KEY, VITE_NEWEB_HASH_IV
// ==========================================

const getConfig = (key: string, defaultValue: string = ''): string => {
  return (import.meta as any).env?.[key] || defaultValue;
};

const NEWEB_CONFIG = {
  // 更新為您指定的測試帳號預設值
  MerchantID: getConfig('VITE_NEWEB_MERCHANT_ID', 'MS123456789'), 
  HashKey: getConfig('VITE_NEWEB_HASH_KEY', ''),     
  HashIV: getConfig('VITE_NEWEB_HASH_IV', ''),       
  Version: '2.0',
  URL: getConfig('VITE_NEWEB_URL', 'https://ccore.newebpay.com/MPG/mpg_gateway'), // 預設為測試環境 URL
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
  // 檢查是否已設定金鑰
  if (!NEWEB_CONFIG.HashKey || !NEWEB_CONFIG.HashIV) {
    console.error("藍新金流 HashKey 或 HashIV 未設定，請檢查 .env 檔案");
    alert("系統設定錯誤：金流參數缺失 (HashKey/HashIV)");
    return { action: '', fields: {} };
  }

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
  
  // 回傳網址設定 (前端 Return URL)
  // 當使用者付款完成後，藍新會將使用者導回此網址
  const baseUrl = window.location.origin;
  // 更新：導向到付款結果頁
  params.append('ReturnURL', `${baseUrl}/#/payment-result`); 
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
