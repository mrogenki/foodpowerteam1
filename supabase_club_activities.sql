
-- =========================================================
-- 新增：俱樂部活動表 (用於首頁輪播)
-- =========================================================

CREATE TABLE IF NOT EXISTS public.club_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    picture TEXT NOT NULL,
    link TEXT,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 開啟 RLS
ALTER TABLE public.club_activities ENABLE ROW LEVEL SECURITY;

-- 1. 所有人皆可讀取 (Anon/Authenticated)
CREATE POLICY "Public Read Club Activities" 
ON public.club_activities 
FOR SELECT 
TO public 
USING (true);

-- 2. 已登入管理員可進行所有操作
CREATE POLICY "Authenticated Manage Club Activities" 
ON public.club_activities 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
