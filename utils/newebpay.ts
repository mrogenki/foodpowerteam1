
import CryptoJS from 'crypto-js';

// ==========================================
// 藍新金流設定
// 注意：為了確保測試環境 100% 可用，目前強制使用藍新公開測試帳號 (OSS000000002208)
// 若您需要切換至正式環境或自訂測試帳號，請修改下方的 NEWEB_CONFIG 設定並取消註解 getConfig 部分
// ==========================================

const getConfig = (key: string, defaultValue: string = ''): string => {
  return (import.meta as any).env?.[key] || defaultValue;
};

const NEWEB_CONFIG = {
  // 強制使用已知可用的測試帳號，忽略環境變數設定，解決「查無此商店代號」問題
  // 您的截圖顯示此商店 (OSS000000002208) 狀態為「營運中」，這是藍新的通用測試商店
  MerchantID: 'OSS000000002208', 
  HashKey: 'ZOf3JWSAzQrqVyywI91mXSi1SwB3HgVQ',     
  HashIV: 'PUmmBRggmiKNDynC',       
  
  // 若要使用環境變數 (.env)，請改用下方寫法：
  // MerchantID: getConfig('VITE_NEWEB_MERCHANT_ID', 'OSS000000002208'),
  // HashKey: getConfig('VITE_NEWEB_HASH_KEY', 'ZOf3JWSAzQrqVyywI91mXSi1SwB3HgVQ'),
  // HashIV: getConfig('VITE_NEWEB_HASH_IV', 'PUmmBRggmiKNDynC'),

  Version: '2.0',
  // 測試環境 URL
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
  
  // 回傳網址設定 (前端 Return URL)
  // 當使用者付款完成後，藍新會將使用者導回此網址
  const baseUrl = window.location.origin;
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
