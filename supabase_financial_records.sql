CREATE TABLE IF NOT EXISTS financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  type TEXT NOT NULL, -- 'income' or 'expense'
  category TEXT NOT NULL,
  amount INTEGER NOT NULL,
  invoice_no TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

-- Policies
-- Only authenticated users (admins) can manage financial records
DROP POLICY IF EXISTS "Allow authenticated manage financial_records" ON financial_records;
CREATE POLICY "Allow authenticated manage financial_records" 
ON public.financial_records 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
