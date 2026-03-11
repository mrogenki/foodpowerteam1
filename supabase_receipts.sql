CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_no TEXT UNIQUE NOT NULL,
  payer_name TEXT NOT NULL,
  tax_id TEXT,
  amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  fee_type TEXT NOT NULL,
  order_no TEXT,
  issue_date DATE NOT NULL,
  handler_name TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read receipts" ON receipts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert receipts" ON receipts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update receipts" ON receipts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete receipts" ON receipts
  FOR DELETE USING (auth.role() = 'authenticated');
