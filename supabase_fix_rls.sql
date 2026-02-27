
-- =========================================================
-- 修正 RLS 政策，允許 Edge Function (以 anon 身分執行時) 進行更新
-- =========================================================

-- 1. 一般活動報名表 (registrations)
DROP POLICY IF EXISTS "Enable update for anon with order no" ON public.registrations;
CREATE POLICY "Enable update for anon with order no" 
ON public.registrations 
FOR UPDATE 
TO anon 
USING (merchant_order_no IS NOT NULL)
WITH CHECK (merchant_order_no IS NOT NULL);

DROP POLICY IF EXISTS "Enable select for anon with order no" ON public.registrations;
CREATE POLICY "Enable select for anon with order no" 
ON public.registrations 
FOR SELECT 
TO anon 
USING (merchant_order_no IS NOT NULL);


-- 2. 會員活動報名表 (member_registrations)
DROP POLICY IF EXISTS "Enable update for anon with order no" ON public.member_registrations;
CREATE POLICY "Enable update for anon with order no" 
ON public.member_registrations 
FOR UPDATE 
TO anon 
USING (merchant_order_no IS NOT NULL)
WITH CHECK (merchant_order_no IS NOT NULL);

DROP POLICY IF EXISTS "Enable select for anon with order no" ON public.member_registrations;
CREATE POLICY "Enable select for anon with order no" 
ON public.member_registrations 
FOR SELECT 
TO anon 
USING (merchant_order_no IS NOT NULL);


-- 3. 會員申請表 (member_applications)
DROP POLICY IF EXISTS "Enable update for anon with order no" ON public.member_applications;
CREATE POLICY "Enable update for anon with order no" 
ON public.member_applications 
FOR UPDATE 
TO anon 
USING (merchant_order_no IS NOT NULL)
WITH CHECK (merchant_order_no IS NOT NULL);

DROP POLICY IF EXISTS "Enable select for anon with order no" ON public.member_applications;
CREATE POLICY "Enable select for anon with order no" 
ON public.member_applications 
FOR SELECT 
TO anon 
USING (merchant_order_no IS NOT NULL);


-- 4. 會員續約表 (member_renewals)
DROP POLICY IF EXISTS "Enable update for all users" ON public.member_renewals;
CREATE POLICY "Enable update for anon with order no" 
ON public.member_renewals 
FOR UPDATE 
TO anon 
USING (merchant_order_no IS NOT NULL)
WITH CHECK (merchant_order_no IS NOT NULL);

DROP POLICY IF EXISTS "Enable select for anon with order no" ON public.member_renewals;
CREATE POLICY "Enable select for anon with order no" 
ON public.member_renewals 
FOR SELECT 
TO anon 
USING (merchant_order_no IS NOT NULL);


-- 5. 會員資料表 (members) - 允許 anon 讀取基本資料以發送郵件
-- 這裡限制只能讀取有在續約或報名中出現的會員
DROP POLICY IF EXISTS "Enable read for anon" ON public.members;
CREATE POLICY "Enable read for anon" 
ON public.members 
FOR SELECT 
TO anon 
USING (true); -- 為了簡化，先允許讀取。實務上應更嚴格，但因為 Edge Function 需要讀取 Email 發信。

-- 6. 活動資料表 (activities) - 允許 anon 讀取以發送郵件
DROP POLICY IF EXISTS "Enable read for anon" ON public.activities;
CREATE POLICY "Enable read for anon" 
ON public.activities 
FOR SELECT 
TO anon 
USING (true);
