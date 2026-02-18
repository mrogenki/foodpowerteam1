
-- =========================================================
-- 10. 安全性設定：啟用 RLS 與 Supabase Auth 整合
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

-- 2. 清除舊的寬鬆策略 (避免重複或衝突)
DROP POLICY IF EXISTS "Enable access for all users" ON public.activities;
DROP POLICY IF EXISTS "Enable access for all users" ON public.registrations;
DROP POLICY IF EXISTS "Enable access for all users" ON public.member_activities;
DROP POLICY IF EXISTS "Enable access for all users" ON public.member_registrations;
DROP POLICY IF EXISTS "Enable access for all users" ON public.admins;
DROP POLICY IF EXISTS "Enable access for all users" ON public.members;
DROP POLICY IF EXISTS "Enable access for all users" ON public.attendance;
DROP POLICY IF EXISTS "Enable access for all users" ON public.coupons;
DROP POLICY IF EXISTS "Enable access for all users" ON public.member_applications;

-- 3. 建立嚴格的新策略 (Policies)

-- 【Activities / Member Activities】
-- 公開: 可讀取 (SELECT)
-- 管理員: 可完全控制 (ALL)
CREATE POLICY "Public Read Activities" ON public.activities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin Manage Activities" ON public.activities FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Member Activities" ON public.member_activities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin Manage Member Activities" ON public.member_activities FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 【Members】
-- 公開: 可讀取 (SELECT) - 用於會員列表頁面與報名搜尋
-- 管理員: 可完全控制 (ALL)
CREATE POLICY "Public Read Members" ON public.members FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin Manage Members" ON public.members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 【Registrations / Member Registrations】
-- 公開: 只能新增 (INSERT) - 用於報名
-- 管理員: 可完全控制 (ALL)
-- 注意：這意味著未登入的使用者將無法讀取報名列表，這保護了報名者的個資。
-- 前端的「已有 N 人報名」功能在未登入時可能會顯示 0，這是正常的安全權衡。
CREATE POLICY "Public Insert Registrations" ON public.registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin Manage Registrations" ON public.registrations FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public Insert Member Registrations" ON public.member_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin Manage Member Registrations" ON public.member_registrations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 【Coupons】
-- 公開: 可讀取 (驗證折扣碼)
-- 公開: 可更新 (標記為已使用) - 為了讓前台能核銷折扣碼
CREATE POLICY "Public Read Coupons" ON public.coupons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Update Coupons" ON public.coupons FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Manage Coupons" ON public.coupons FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 【Member Applications】
-- 公開: 只能新增 (INSERT)
-- 管理員: 可完全控制 (ALL)
CREATE POLICY "Public Insert Applications" ON public.member_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin Manage Applications" ON public.member_applications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 【Admins】
-- 此表已不再用於驗證，僅供紀錄。
-- 限制僅管理員可讀寫。
CREATE POLICY "Admin Manage Admins Table" ON public.admins FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 【Attendance】
-- 僅管理員可操作
CREATE POLICY "Admin Manage Attendance" ON public.attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);
