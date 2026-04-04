
-- =========================================================
-- 處理會員續約付款成功後的資料更新 (RPC)
-- =========================================================

CREATE OR REPLACE FUNCTION handle_renewal_payment(
  p_order_no text,
  p_amount int,
  p_pay_time text,
  p_pay_method text,
  p_renewal_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- 使用定義者的權限執行 (繞過 RLS)
SET search_path = public
AS $$
DECLARE
  v_member_id uuid;
  v_renewal_id uuid;
  v_current_expiry date;
  v_current_records text;
  v_new_expiry date;
  v_new_record jsonb;
  v_records_json jsonb;
  v_today date := CURRENT_DATE;
  v_method_display text;
BEGIN
  -- 1. 尋找續約紀錄
  IF p_renewal_id IS NOT NULL THEN
    SELECT id, member_id INTO v_renewal_id, v_member_id
    FROM member_renewals
    WHERE id = p_renewal_id;
  ELSE
    SELECT id, member_id INTO v_renewal_id, v_member_id
    FROM member_renewals
    WHERE merchant_order_no = p_order_no
    LIMIT 1;
  END IF;

  IF v_renewal_id IS NULL THEN
    RETURN;
  END IF;

  -- 2. 更新續約紀錄狀態
  UPDATE member_renewals
  SET 
    payment_status = 'paid',
    paid_at = p_pay_time::timestamptz,
    payment_method = p_pay_method,
    amount = p_amount
  WHERE id = v_renewal_id;

  -- 3. 取得會員目前的會籍資訊
  SELECT membership_expiry_date, payment_records INTO v_current_expiry, v_current_records
  FROM members
  WHERE id = v_member_id;

  -- 4. 計算新的到期日
  IF v_current_expiry IS NOT NULL AND v_current_expiry > v_today THEN
    v_new_expiry := v_current_expiry + INTERVAL '1 year';
  ELSE
    v_new_expiry := v_today + INTERVAL '1 year';
  END IF;

  -- 5. 準備繳費紀錄 (JSON)
  -- 轉換支付方式顯示名稱
  v_method_display := CASE p_pay_method
    WHEN 'CREDIT' THEN '信用卡'
    WHEN 'VACC' THEN 'ATM轉帳'
    WHEN 'WEBATM' THEN 'WebATM'
    WHEN 'CVS' THEN '超商代碼'
    WHEN 'BARCODE' THEN '超商條碼'
    WHEN 'LINEPAY' THEN 'Line Pay'
    WHEN 'manual_admin' THEN '手動標記'
    ELSE p_pay_method
  END;

  v_new_record := jsonb_build_object(
    'id', extract(epoch from now()) * 1000,
    'date', p_pay_time::date,
    'amount', p_amount,
    'note', '會籍續約 (' || v_method_display || ')' || CASE WHEN p_order_no IS NOT NULL THEN ' - 訂單編號: ' || p_order_no ELSE '' END
  );

  -- 處理舊的紀錄
  IF v_current_records IS NULL OR v_current_records = '' OR v_current_records = '[]' THEN
    v_records_json := jsonb_build_array(v_new_record);
  ELSE
    BEGIN
      v_records_json := v_current_records::jsonb || v_new_record;
    EXCEPTION WHEN OTHERS THEN
      v_records_json := jsonb_build_array(v_new_record);
    END;
  END IF;

  -- 6. 更新會員資料
  UPDATE members
  SET
    membership_expiry_date = v_new_expiry,
    status = 'active',
    payment_records = v_records_json::text
  WHERE id = v_member_id;

END;
$$;

-- 開放執行權限
GRANT EXECUTE ON FUNCTION handle_renewal_payment(text, int, text, text) TO anon;
GRANT EXECUTE ON FUNCTION handle_renewal_payment(text, int, text, text) TO authenticated;
