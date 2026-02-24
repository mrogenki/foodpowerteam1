-- =========================================================
-- 取得活動報名付款資訊 (用於重發付款連結)
-- =========================================================

CREATE OR REPLACE FUNCTION get_activity_payment_info(reg_id text)
RETURNS TABLE (
  id text,
  activity_title text,
  amount int,
  merchant_order_no text,
  payment_status text,
  payer_name text,
  payer_email text,
  type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Try registrations (General Activity)
  RETURN QUERY
  SELECT 
    r.id::text,
    a.title as activity_title,
    r.paid_amount as amount,
    r.merchant_order_no,
    r.payment_status::text,
    r.name as payer_name,
    r.email as payer_email,
    'general' as type
  FROM registrations r
  JOIN activities a ON r."activityId" = a.id
  WHERE r.id::text = reg_id OR r.merchant_order_no = reg_id;

  IF FOUND THEN RETURN; END IF;

  -- 2. Try member_registrations (Member Activity)
  RETURN QUERY
  SELECT 
    mr.id::text,
    ma.title as activity_title,
    mr.paid_amount as amount,
    mr.merchant_order_no,
    mr.payment_status::text,
    mr.member_name as payer_name,
    m.email as payer_email,
    'member' as type
  FROM member_registrations mr
  JOIN member_activities ma ON mr."activityId" = ma.id
  JOIN members m ON mr."memberId" = m.id
  WHERE mr.id::text = reg_id OR mr.merchant_order_no = reg_id;
  
  IF FOUND THEN RETURN; END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION get_activity_payment_info(text) TO anon;
GRANT EXECUTE ON FUNCTION get_activity_payment_info(text) TO authenticated;
