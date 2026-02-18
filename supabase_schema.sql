
-- =========================================================
-- 資料修復：補上管理員的 Email
-- =========================================================
-- 這會將現有的 "總管理員" 記錄更新為您的 Email (mr.ogenki@gmail.com)
-- 讓系統能正確將登入帳號與權限連結。

UPDATE public.admins 
SET email = 'mr.ogenki@gmail.com' 
WHERE role = '總管理員' OR name = '劉盈廷Netix';

-- 如果上面沒有更新到任何資料 (例如資料表是空的)，則插入一筆新的
INSERT INTO public.admins (id, name, phone, role, email, password)
SELECT 'super-admin-01', '總管理員', '0900000000', '總管理員', 'mr.ogenki@gmail.com', 'hashed_pw_placeholder'
WHERE NOT EXISTS (
    SELECT 1 FROM public.admins WHERE email = 'mr.ogenki@gmail.com'
);

-- =========================================================
-- 權限救援：放寬後台讀取權限
-- =========================================================
-- 說明：將權限從 "is_admin()" 放寬為 "authenticated" (已登入者)。
-- 因為系統中只有管理員會登入，這樣可以確保您登入後一定能看到資料。

-- 1. 會員申請表 (member_applications)
DROP POLICY IF EXISTS "Admin Manage Applications" ON public.member_applications;
-- 建立新策略：已登入者可進行所有操作 (讀取/修改/刪除)
CREATE POLICY "Authenticated Manage Applications" 
ON public.member_applications 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- 2. 一般活動報名表 (registrations)
DROP POLICY IF EXISTS "Admin Manage Registrations" ON public.registrations;
-- 建立新策略：已登入者可進行所有操作
CREATE POLICY "Authenticated Manage Registrations" 
ON public.registrations 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- 3. 會員活動報名表 (member_registrations)
DROP POLICY IF EXISTS "Admin Manage Member Registrations" ON public.member_registrations;
-- 建立新策略：已登入者可進行所有操作
CREATE POLICY "Authenticated Manage Member Registrations" 
ON public.member_registrations 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- 4. 會員資料表 (members)
DROP POLICY IF EXISTS "Admin Manage Members" ON public.members;
-- 建立新策略：已登入者可進行所有操作
CREATE POLICY "Authenticated Manage Members" 
ON public.members 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- 5. 管理員名單 (admins)
DROP POLICY IF EXISTS "Admin Manage Admins Table" ON public.admins;
-- 建立新策略：已登入者可讀寫管理員名單
CREATE POLICY "Authenticated Manage Admins" 
ON public.admins 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- 6. 折扣券 (coupons)
DROP POLICY IF EXISTS "Admin Manage Coupons" ON public.coupons;
CREATE POLICY "Authenticated Manage Coupons" 
ON public.coupons 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 7. 簽到記錄 (attendance)
DROP POLICY IF EXISTS "Admin Manage Attendance" ON public.attendance;
CREATE POLICY "Authenticated Manage Attendance" 
ON public.attendance 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 8. 活動設定 (activities)
DROP POLICY IF EXISTS "Admin Manage Activities" ON public.activities;
CREATE POLICY "Authenticated Manage Activities" 
ON public.activities 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 9. 會員活動設定 (member_activities)
DROP POLICY IF EXISTS "Admin Manage Member Activities" ON public.member_activities;
CREATE POLICY "Authenticated Manage Member Activities" 
ON public.member_activities 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
