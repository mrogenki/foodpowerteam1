
-- 啟用 UUID 擴充功能 (可選)
create extension if not exists "uuid-ossp";

-- 1. 建立活動資料表 (activities)
create table public.activities (
  id text primary key,
  type text not null,
  title text not null,
  date text not null,
  time text not null,
  location text not null,
  price numeric default 0,
  -- 移除 member_price
  picture text,
  description text,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. 建立報名資料表 (registrations)
create table public.registrations (
  id text primary key,
  "activityId" text not null, -- 注意：程式碼中大小寫可能敏感，建議對應 types.ts
  name text not null,
  phone text not null,
  email text,
  company text,
  title text,
  referrer text,
  check_in_status boolean default false,
  paid_amount numeric default 0,
  coupon_code text, -- 新增：紀錄使用的折扣碼
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. 建立管理員資料表 (admins)
create table public.admins (
  id text primary key,
  name text not null,
  phone text not null unique,
  password text not null,
  role text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. 建立會員資料表 (members)
create table public.members (
  id text primary key, -- 這裡為了相容性使用 text，若希望自動生成可改 uuid
  member_no text,
  industry_chain text,
  industry_category text,
  name text not null,
  company text,
  website text,
  intro text,
  birthday text, -- 新增：生日欄位
  status text default 'active',
  join_date text,
  quit_date text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. 建立出席紀錄資料表 (attendance)
create table public.attendance (
  id text primary key default uuid_generate_v4()::text,
  activity_id text not null,
  member_id text not null,
  status text not null, -- 'present' or 'absent'
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(activity_id, member_id) -- 確保同一活動同一會員只有一筆紀錄
);

-- 6. 建立折扣券資料表 (coupons)
create table public.coupons (
  id text primary key default uuid_generate_v4()::text,
  code text not null unique,
  activity_id text not null,
  member_id text, -- 可選，若指定則限制該會員使用
  discount_amount numeric not null default 0,
  is_used boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  used_at timestamp with time zone
);

-- 設定 RLS (Row Level Security) 策略
-- 為了簡化新專案設定，這裡先開放公開讀寫 (Public Access)
-- 注意：正式上線建議配合 Supabase Auth 設定更嚴謹的 Policies
alter table public.activities enable row level security;
create policy "Allow public access to activities" on public.activities for all using (true) with check (true);

alter table public.registrations enable row level security;
create policy "Allow public access to registrations" on public.registrations for all using (true) with check (true);

alter table public.admins enable row level security;
create policy "Allow public access to admins" on public.admins for all using (true) with check (true);

alter table public.members enable row level security;
create policy "Allow public access to members" on public.members for all using (true) with check (true);

alter table public.attendance enable row level security;
create policy "Allow public access to attendance" on public.attendance for all using (true) with check (true);

alter table public.coupons enable row level security;
create policy "Allow public access to coupons" on public.coupons for all using (true) with check (true);

-- 建立 Storage Bucket (若需要上傳圖片)
-- 需至 Supabase Dashboard > Storage > Create new bucket 'activity-images'
-- 並設定 Policy 為 Public
