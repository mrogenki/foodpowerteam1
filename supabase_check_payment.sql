-- =========================================================
-- 檢查付款狀態函數 (跨多個表查詢)
-- =========================================================

CREATE OR REPLACE FUNCTION check_payment_status(order_no text)
RETURNS TABLE (
  status text,
  amount int,
  paid_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER -- 使用定義者的權限執行 (繞過 RLS)
SET search_path = public
AS $$
BEGIN
  -- 1. Check registrations (一般活動報名)
  RETURN QUERY 
  SELECT payment_status::text, paid_amount, paid_at 
  FROM registrations 
  WHERE merchant_order_no = order_no;
  
  IF FOUND THEN RETURN; END IF;

  -- 2. Check member_registrations (會員活動報名)
  RETURN QUERY 
  SELECT payment_status::text, paid_amount, paid_at 
  FROM member_registrations 
  WHERE merchant_order_no = order_no;
  
  IF FOUND THEN RETURN; END IF;

  -- 3. Check member_applications (新會員入會申請)
  RETURN QUERY 
  SELECT payment_status::text, paid_amount, paid_at 
  FROM member_applications 
  WHERE merchant_order_no = order_no;
  
  IF FOUND THEN RETURN; END IF;
END;
$$;

-- 開放執行權限給所有使用者 (包含未登入者)
GRANT EXECUTE ON FUNCTION check_payment_status(text) TO anon;
GRANT EXECUTE ON FUNCTION check_payment_status(text) TO authenticated;
