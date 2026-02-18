
-- =========================================================
-- 修正：管理員權限檢查函數 (不分大小寫)
-- =========================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  current_email TEXT;
BEGIN
  -- 取得目前 JWT 中的 Email
  current_email := auth.jwt() ->> 'email';
  
  -- 如果沒有 Email (未登入)，直接回傳 false
  IF current_email IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 檢查 Email 是否存在於 admins 表 (不分大小寫)
  RETURN EXISTS (
    SELECT 1
    FROM public.admins
    WHERE LOWER(email) = LOWER(current_email)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =========================================================
-- 修正：會員申請表 (member_applications) 的權限策略
-- =========================================================

-- 1. 先移除舊策略，避免重複或衝突
DROP POLICY IF EXISTS "Enable access for all users" ON public.member_applications;
DROP POLICY IF EXISTS "Public Insert Applications" ON public.member_applications;
DROP POLICY IF EXISTS "Admin Manage Applications" ON public.member_applications;

-- 2. 確保 RLS 已啟用
ALTER TABLE public.member_applications ENABLE ROW LEVEL SECURITY;

-- 3. 重新建立策略

-- 策略 A: 允許所有人 (包含未登入) "新增" 申請單
-- 這樣前台的使用者才能送出申請
CREATE POLICY "Public Insert Applications" 
ON public.member_applications 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 策略 B: 允許管理員 "讀取"、"修改"、"刪除"
-- 使用新的不分大小寫 is_admin() 函數
CREATE POLICY "Admin Manage Applications" 
ON public.member_applications 
FOR ALL 
TO authenticated 
USING (is_admin()) 
WITH CHECK (is_admin());

-- =========================================================
-- 補充：確保 admins 表的 email 資料格式正確
-- =========================================================
-- 將現有 admins 表中的 email 全部轉為小寫，確保比對順利
UPDATE public.admins SET email = LOWER(email);
