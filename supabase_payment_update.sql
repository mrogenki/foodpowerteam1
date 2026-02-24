-- =========================================================
-- 更新訂單編號 (用於重新發起付款時，避免訂單號重複)
-- =========================================================

CREATE OR REPLACE FUNCTION update_payment_order_no(reg_id text, new_order_no text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Try registrations
  UPDATE registrations 
  SET merchant_order_no = new_order_no 
  WHERE id::text = reg_id;
  
  IF FOUND THEN RETURN; END IF;

  -- 2. Try member_registrations
  UPDATE member_registrations 
  SET merchant_order_no = new_order_no 
  WHERE id::text = reg_id;
  
  IF FOUND THEN RETURN; END IF;
  
  -- 3. Try member_applications
  UPDATE member_applications 
  SET merchant_order_no = new_order_no 
  WHERE id::text = reg_id;
END;
$$;

GRANT EXECUTE ON FUNCTION update_payment_order_no(text, text) TO anon;
GRANT EXECUTE ON FUNCTION update_payment_order_no(text, text) TO authenticated;
