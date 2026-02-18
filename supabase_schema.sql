
-- =========================================================
-- 0. 初始化資料表 (確保資料表存在)
-- =========================================================

-- 會員申請表
CREATE TABLE IF NOT EXISTS public.member_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    id_number TEXT,
    birthday TEXT,
    referrer TEXT,
    phone TEXT,
    email TEXT,
    home_phone TEXT,
    address TEXT,
    industry_category TEXT,
    brand_name TEXT,
    company_title TEXT,
    tax_id TEXT,
    job_title TEXT,
    website TEXT,
    main_service TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 折扣券表
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    activity_id TEXT, -- 關聯到 activity ID
    member_id TEXT,   -- 關聯到 member ID (Optional)
    discount_amount NUMERIC DEFAULT 0,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 簽到記錄表
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    status TEXT DEFAULT 'present',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 確保 admins 表有 email 欄位
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS email TEXT;
-- 建立 email 索引以加速查詢
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins (email);


-- =========================================================
-- 10. 安全性設定：啟用 RLS 與 Supabase Auth 整合 (強化版)
-- =========================================================

-- 1. 確保所有資料表啟用 RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_applications ENABLE ROW LEVEL SECURITY;

-- 2. 建立安全檢查函數 (Security Definer)
-- 這個函數會檢查當前登入使用者的 Email 是否存在於 admins 資料表中
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- 檢查目前的 User Email 是否在 admins 表中
  RETURN EXISTS (
    SELECT 1
    FROM public.admins
    WHERE email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 清除舊的策略 (確保更新時不會衝突)
DROP POLICY IF EXISTS "Enable access for all users" ON public.activities;
DROP POLICY IF EXISTS "Public Read Activities" ON public.activities;
DROP POLICY IF EXISTS "Admin Manage Activities" ON public.activities;

DROP POLICY IF EXISTS "Enable access for all users" ON public.registrations;
DROP POLICY IF EXISTS "Public Insert Registrations" ON public.registrations;
DROP POLICY IF EXISTS "Admin Manage Registrations" ON public.registrations;

DROP POLICY IF EXISTS "Enable access for all users" ON public.member_activities;
DROP POLICY IF EXISTS "Public Read Member Activities" ON public.member_activities;
DROP POLICY IF EXISTS "Admin Manage Member Activities" ON public.member_activities;

DROP POLICY IF EXISTS "Enable access for all users" ON public.member_registrations;
DROP POLICY IF EXISTS "Public Insert Member Registrations" ON public.member_registrations;
DROP POLICY IF EXISTS "Admin Manage Member Registrations" ON public.member_registrations;

DROP POLICY IF EXISTS "Enable access for all users" ON public.admins;
DROP POLICY IF EXISTS "Admin Manage Admins Table" ON public.admins;

DROP POLICY IF EXISTS "Enable access for all users" ON public.members;
DROP POLICY IF EXISTS "Public Read Members" ON public.members;
DROP POLICY IF EXISTS "Admin Manage Members" ON public.members;

DROP POLICY IF EXISTS "Enable access for all users" ON public.attendance;
DROP POLICY IF EXISTS "Admin Manage Attendance" ON public.attendance;

DROP POLICY IF EXISTS "Enable access for all users" ON public.coupons;
DROP POLICY IF EXISTS "Public Read Coupons" ON public.coupons;
DROP POLICY IF EXISTS "Public Update Coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admin Manage Coupons" ON public.coupons;

DROP POLICY IF EXISTS "Enable access for all users" ON public.member_applications;
DROP POLICY IF EXISTS "Public Insert Applications" ON public.member_applications;
DROP POLICY IF EXISTS "Admin Manage Applications" ON public.member_applications;


-- 4. 建立嚴格的新策略 (Policies) using is_admin()

-- 【Activities / Member Activities】
-- 公開: 可讀取 (SELECT)
-- 管理員: 可完全控制 (ALL) - 需通過 is_admin() 檢查
CREATE POLICY "Public Read Activities" ON public.activities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin Manage Activities" ON public.activities FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Public Read Member Activities" ON public.member_activities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin Manage Member Activities" ON public.member_activities FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 【Members】
-- 公開: 可讀取 (SELECT) - 為了安全，公開只允許讀取 'active' 的會員
-- 管理員: 可完全控制 (ALL)
CREATE POLICY "Public Read Members" ON public.members FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "Admin Manage Members" ON public.members FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 【Registrations / Member Registrations】
-- 公開: 只能新增 (INSERT) - 用於報名
-- 管理員: 可完全控制 (ALL)
CREATE POLICY "Public Insert Registrations" ON public.registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin Manage Registrations" ON public.registrations FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Public Insert Member Registrations" ON public.member_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin Manage Member Registrations" ON public.member_registrations FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 【Coupons】
-- 公開: 可讀取 (驗證折扣碼)
-- 公開: 可更新 (標記為已使用)
-- 管理員: 可完全控制
CREATE POLICY "Public Read Coupons" ON public.coupons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Update Coupons" ON public.coupons FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Manage Coupons" ON public.coupons FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 【Member Applications】
-- 公開: 只能新增
-- 管理員: 可完全控制
CREATE POLICY "Public Insert Applications" ON public.member_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin Manage Applications" ON public.member_applications FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 【Admins】
-- 用於權限管理
-- 限制僅管理員可讀寫
-- 這裡使用 is_admin() 確保只有真正的管理員可以修改管理員名單
CREATE POLICY "Admin Manage Admins Table" ON public.admins FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 【Attendance】
-- 僅管理員可操作
CREATE POLICY "Admin Manage Attendance" ON public.attendance FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
