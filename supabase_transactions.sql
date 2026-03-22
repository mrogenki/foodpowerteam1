
-- =========================================================
-- 新增：收支管理 (transactions)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expenditure')),
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    description TEXT,
    note TEXT,
    merchant_order_no TEXT
);

-- 權限設定
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated Manage Transactions" ON public.transactions;
CREATE POLICY "Authenticated Manage Transactions" 
ON public.transactions 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
