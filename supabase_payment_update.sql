-- =========================================================
-- 1. 新增金流欄位至 member_applications 表
-- =========================================================
-- 這些欄位用於儲存藍新金流的回傳資訊與付款狀態

ALTER TABLE public.member_applications 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending', -- 付款狀態 (pending, paid, failed)
ADD COLUMN IF NOT EXISTS merchant_order_no TEXT,                -- 商店訂單編號 (JOIN_...)
ADD COLUMN IF NOT EXISTS paid_amount INTEGER DEFAULT 0,         -- 實際支付金額
ADD COLUMN IF NOT EXISTS payment_method TEXT,                   -- 付款方式 (CREDIT, ATM...)
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;                   -- 付款時間

-- =========================================================
-- 2. 開放匿名寫入權限 (重要！)
-- =========================================================
-- 讓未登入的訪客也能提交入會申請表
-- 注意：我們只開放 INSERT，不開放 SELECT/UPDATE/DELETE，以保護個資

DROP POLICY IF EXISTS "Enable insert for everyone" ON public.member_applications;

CREATE POLICY "Enable insert for everyone" 
ON public.member_applications 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- 確保已登入的管理員仍然可以看到所有資料 (這部分通常已經在之前的設定中完成，這裡再次確認)
DROP POLICY IF EXISTS "Enable read for authenticated users only" ON public.member_applications;

CREATE POLICY "Enable read for authenticated users only"
ON public.member_applications
FOR SELECT
TO authenticated
USING (true);
