-- =========================================================
-- 會員續約相關資料表與函數
-- =========================================================

-- 1. 建立會員續約記錄表 (Member Renewals)
CREATE TABLE IF NOT EXISTS member_renewals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id uuid REFERENCES members(id) ON DELETE CASCADE,
  renewal_date date DEFAULT CURRENT_DATE, -- 續約申請日期
  start_date date, -- 新會籍開始日
  end_date date,   -- 新會籍結束日
  amount int DEFAULT 0,
  payment_status text DEFAULT 'pending', -- pending, paid, failed
  merchant_order_no text,
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. 開放權限
ALTER TABLE member_renewals ENABLE ROW LEVEL SECURITY;

-- 允許所有使用者讀取 (為了前台查詢)
CREATE POLICY "Enable read access for all users" ON member_renewals FOR SELECT USING (true);

-- 允許所有使用者新增 (為了前台申請)
CREATE POLICY "Enable insert for all users" ON member_renewals FOR INSERT WITH CHECK (true);

-- 允許所有使用者更新 (為了金流回調)
CREATE POLICY "Enable update for all users" ON member_renewals FOR UPDATE USING (true);

-- 3. 建立取得續約付款資訊的函數 (用於 ApplicationPayment 頁面共用或獨立頁面)
CREATE OR REPLACE FUNCTION get_renewal_payment_info(renewal_id text)
RETURNS TABLE (
  id text,
  member_name text,
  member_email text,
  amount int,
  merchant_order_no text,
  payment_status text,
  type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mr.id::text,
    m.name as member_name,
    m.email as member_email,
    mr.amount,
    mr.merchant_order_no,
    mr.payment_status,
    'renewal' as type
  FROM member_renewals mr
  JOIN members m ON mr.member_id = m.id
  WHERE mr.id::text = renewal_id OR mr.merchant_order_no = renewal_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_renewal_payment_info(text) TO anon;
GRANT EXECUTE ON FUNCTION get_renewal_payment_info(text) TO authenticated;

-- 4. 更新 check_payment_status 函數以包含續約記錄
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

  -- 4. Check member_renewals (New!)
  RETURN QUERY 
  SELECT payment_status::text, amount as paid_amount, paid_at 
  FROM member_renewals 
  WHERE merchant_order_no = order_no;
  
  IF FOUND THEN RETURN; END IF;
END;
$$;

-- 5. 更新 update_payment_order_no 函數以包含續約記錄
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

  IF FOUND THEN RETURN; END IF;

  -- 4. Try member_renewals (New!)
  UPDATE member_renewals 
  SET merchant_order_no = new_order_no 
  WHERE id::text = reg_id;
END;
$$;
