
-- =========================================================
-- 更新：收支管理 (transactions) 欄位擴充
-- =========================================================
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS invoice_number TEXT,
ADD COLUMN IF NOT EXISTS entity TEXT,
ADD COLUMN IF NOT EXISTS document_url TEXT;

-- 註解：invoice_number 用於發票號碼
-- 註解：entity 用於收支對象
-- 註解：document_url 用於單據照片連結
