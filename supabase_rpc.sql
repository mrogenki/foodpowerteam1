-- =========================================================
-- 安全的讀取付款資訊函數 (避免開放全表讀取權限)
-- =========================================================

CREATE OR REPLACE FUNCTION get_payment_info(application_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  paid_amount int,
  merchant_order_no text,
  payment_status text
)
LANGUAGE plpgsql
SECURITY DEFINER -- 使用定義者的權限執行 (繞過 RLS)
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ma.id,
    ma.name,
    ma.email,
    ma.paid_amount,
    ma.merchant_order_no,
    ma.payment_status
  FROM member_applications ma
  WHERE ma.id = application_id;
END;
$$;

-- 開放執行權限給所有使用者 (包含未登入者)
GRANT EXECUTE ON FUNCTION get_payment_info(uuid) TO anon;
GRANT EXECUTE ON FUNCTION get_payment_info(uuid) TO authenticated;
