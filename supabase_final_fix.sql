-- =========================================================
-- 確保付款查詢函數權限與 RLS 政策正確
-- =========================================================

-- 1. 確保 check_payment_status 函數存在且權限開放
-- 這裡先刪除舊函數再建立，以避免回傳型別不相容的錯誤 (42P13)
DROP FUNCTION IF EXISTS check_payment_status(text);

CREATE OR REPLACE FUNCTION check_payment_status(order_no text)
RETURNS TABLE (
  status text,
  amount int,
  paid_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Check registrations
  RETURN QUERY 
  SELECT payment_status::text, paid_amount, paid_at 
  FROM registrations 
  WHERE merchant_order_no = order_no;
  
  IF FOUND THEN RETURN; END IF;

  -- 2. Check member_registrations
  RETURN QUERY 
  SELECT payment_status::text, paid_amount, paid_at 
  FROM member_registrations 
  WHERE merchant_order_no = order_no;
  
  IF FOUND THEN RETURN; END IF;

  -- 3. Check member_applications
  RETURN QUERY 
  SELECT payment_status::text, paid_amount, paid_at 
  FROM member_applications 
  WHERE merchant_order_no = order_no;
  
  IF FOUND THEN RETURN; END IF;

  -- 4. Check member_renewals
  RETURN QUERY 
  SELECT payment_status::text, amount as paid_amount, paid_at 
  FROM member_renewals 
  WHERE merchant_order_no = order_no;
  
  IF FOUND THEN RETURN; END IF;
END;
$$;

-- 授權給 anon (未登入使用者) 與 authenticated (已登入使用者)
GRANT EXECUTE ON FUNCTION check_payment_status(text) TO anon;
GRANT EXECUTE ON FUNCTION check_payment_status(text) TO authenticated;

-- 2. 確保 RLS 政策允許 Edge Function (anon) 讀取必要資訊
-- 讀取活動資訊 (發信與發票需要)
DROP POLICY IF EXISTS "Enable read for anon" ON public.activities;
CREATE POLICY "Enable read for anon" ON public.activities FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Enable read for anon" ON public.member_activities;
CREATE POLICY "Enable read for anon" ON public.member_activities FOR SELECT TO anon USING (true);

-- 讀取會員資訊 (發信與發票需要)
DROP POLICY IF EXISTS "Enable read for anon" ON public.members;
CREATE POLICY "Enable read for anon" ON public.members FOR SELECT TO anon USING (true);

-- 3. 確保 Edge Function 可以更新狀態
-- registrations
DROP POLICY IF EXISTS "Enable update for anon with order no" ON public.registrations;
CREATE POLICY "Enable update for anon with order no" ON public.registrations FOR UPDATE TO anon USING (merchant_order_no IS NOT NULL) WITH CHECK (merchant_order_no IS NOT NULL);

-- member_registrations
DROP POLICY IF EXISTS "Enable update for anon with order no" ON public.member_registrations;
CREATE POLICY "Enable update for anon with order no" ON public.member_registrations FOR UPDATE TO anon USING (merchant_order_no IS NOT NULL) WITH CHECK (merchant_order_no IS NOT NULL);

-- member_applications
DROP POLICY IF EXISTS "Enable update for anon with order no" ON public.member_applications;
CREATE POLICY "Enable update for anon with order no" ON public.member_applications FOR UPDATE TO anon USING (merchant_order_no IS NOT NULL) WITH CHECK (merchant_order_no IS NOT NULL);

-- member_renewals
DROP POLICY IF EXISTS "Enable update for anon with order no" ON public.member_renewals;
CREATE POLICY "Enable update for anon with order no" ON public.member_renewals FOR UPDATE TO anon USING (merchant_order_no IS NOT NULL) WITH CHECK (merchant_order_no IS NOT NULL);
