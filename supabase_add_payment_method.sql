
-- 為所有交易相關資料表新增「付款方式」欄位
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.member_registrations ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.member_applications ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.member_renewals ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- 註解：常見的付款方式代碼 (藍新)
-- CREDIT: 信用卡
-- VACC: ATM轉帳
-- WEBATM: WebATM
-- CVS: 超商代碼
-- BARCODE: 超商條碼
-- LINEPAY: Line Pay
-- manual_admin: 管理員手動標記
