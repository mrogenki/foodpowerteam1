-- =========================================================
-- 修正：開放已登入管理員修改會員申請資料的權限
-- =========================================================

-- 1. 允許已登入使用者 (管理員) 修改 member_applications 表
-- 這對於「手動標記已付款」或「審核/修改」功能是必須的

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.member_applications;

CREATE POLICY "Enable update for authenticated users only"
ON public.member_applications
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. 允許已登入使用者 (管理員) 刪除 member_applications 表
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.member_applications;

CREATE POLICY "Enable delete for authenticated users only"
ON public.member_applications
FOR DELETE
TO authenticated
USING (true);
