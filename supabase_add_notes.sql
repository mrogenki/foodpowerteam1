-- 新增活動報名備註欄位
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.member_registrations ADD COLUMN IF NOT EXISTS notes TEXT;
