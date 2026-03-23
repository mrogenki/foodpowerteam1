-- 新增 receipt_url 欄位到 financial_records 資料表
ALTER TABLE financial_records ADD COLUMN IF NOT EXISTS receipt_url TEXT;
