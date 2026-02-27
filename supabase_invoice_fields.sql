-- =========================================================
-- 新增電子發票相關欄位
-- =========================================================

-- 1. 一般活動報名表
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS invoice_no text;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS invoice_status text DEFAULT 'none'; -- none, issued, failed

-- 2. 會員活動報名表
ALTER TABLE public.member_registrations ADD COLUMN IF NOT EXISTS invoice_no text;
ALTER TABLE public.member_registrations ADD COLUMN IF NOT EXISTS invoice_status text DEFAULT 'none';

-- 3. 會員申請表
ALTER TABLE public.member_applications ADD COLUMN IF NOT EXISTS invoice_no text;
ALTER TABLE public.member_applications ADD COLUMN IF NOT EXISTS invoice_status text DEFAULT 'none';

-- 4. 會員續約表
ALTER TABLE public.member_renewals ADD COLUMN IF NOT EXISTS invoice_no text;
ALTER TABLE public.member_renewals ADD COLUMN IF NOT EXISTS invoice_status text DEFAULT 'none';
