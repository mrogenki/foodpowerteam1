CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  picture TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow public read access" ON milestones;
CREATE POLICY "Allow public read access" ON milestones FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated manage access" ON milestones;
CREATE POLICY "Allow authenticated manage access" ON milestones FOR ALL TO authenticated USING (true) WITH CHECK (true);
