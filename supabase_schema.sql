
-- 啟用 UUID 擴充功能 (可選)
create extension if not exists "uuid-ossp";

-- 1. 建立活動資料表 (activities)
create table if not exists public.activities (
  id text primary key,
  type text not null,
  title text not null,
  date text not null,
  time text not null,
  location text not null,
  price numeric default 0,
  picture text,
  description text,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. 建立報名資料表 (registrations)
create table if not exists public.registrations (
  id text primary key,
  "activityId" text not null,
  name text not null,
  phone text not null,
  email text,
  company text,
  title text,
  referrer text,
  check_in_status boolean default false,
  paid_amount numeric default 0,
  coupon_code text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. 建立管理員資料表 (admins)
create table if not exists public.admins (
  id text primary key,
  name text not null,
  phone text not null unique,
  password text not null,
  role text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. 建立會員資料表 (members) - 注意：此處定義為完整新結構
-- 若您是更新現有資料庫，請執行下方的 ALTER TABLE 指令
create table if not exists public.members (
  id text primary key,
  member_no text,
  name text not null,
  status text default 'active',
  
  -- 新增欄位
  membership_expiry_date text,
  notes text,
  payment_records text,
  
  id_number text,
  birthday text,
  phone text,
  email text,
  address text,
  home_phone text,
  referrer text,
  
  industry_category text, -- 餐飲服務/美食產品...
  brand_name text,
  company_title text,
  tax_id text,
  job_title text,
  main_service text,
  website text,
  
  -- 舊欄位保留 (可選)
  intro text,
  company text,
  industry_chain text,
  join_date text,
  quit_date text,
  
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. 建立出席紀錄資料表 (attendance)
create table if not exists public.attendance (
  id text primary key default uuid_generate_v4()::text,
  activity_id text not null,
  member_id text not null,
  status text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(activity_id, member_id)
);

-- 6. 建立折扣券資料表 (coupons)
create table if not exists public.coupons (
  id text primary key default uuid_generate_v4()::text,
  code text not null unique,
  activity_id text not null,
  member_id text,
  discount_amount numeric not null default 0,
  is_used boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  used_at timestamp with time zone
);

-- 設定 RLS (Policies) 範例 (若有需要)
-- alter table public.members enable row level security;
-- create policy "Enable read access for all users" on public.members for select using (true);
-- create policy "Enable insert for all users" on public.members for insert with check (true);
-- create policy "Enable update for all users" on public.members for update using (true);
-- create policy "Enable delete for all users" on public.members for delete using (true);

-- ==========================================
-- ⚠️ 資料庫遷移指令 (Database Migration)
-- 若您的 members 表格已存在，請複製以下指令並在 Supabase SQL Editor 執行以新增欄位
-- ==========================================

ALTER TABLE public.members ADD COLUMN IF NOT EXISTS membership_expiry_date text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS payment_records text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS id_number text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS birthday text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS home_phone text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS referrer text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS industry_category text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS brand_name text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS company_title text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS tax_id text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS job_title text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS main_service text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS website text;
