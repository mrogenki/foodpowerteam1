
-- 啟用 UUID 擴充功能 (可選)
create extension if not exists "uuid-ossp";

-- 1. 一般活動資料表 (activities)
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

-- 2. 一般報名資料表 (registrations)
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

-- 3. 會員活動資料表 (member_activities) - NEW
create table if not exists public.member_activities (
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

-- 4. 會員報名資料表 (member_registrations) - NEW
create table if not exists public.member_registrations (
  id text primary key,
  "activityId" text not null, -- 對應 member_activities
  "memberId" text not null,   -- 對應 members
  member_name text,           -- 冗餘欄位方便查詢
  member_no text,             -- 冗餘欄位方便查詢
  check_in_status boolean default false,
  paid_amount numeric default 0,
  coupon_code text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. 建立管理員資料表 (admins)
create table if not exists public.admins (
  id text primary key,
  name text not null,
  phone text not null unique,
  password text not null,
  role text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. 建立會員資料表 (members)
create table if not exists public.members (
  id text primary key,
  member_no text,
  name text not null,
  status text default 'active',
  
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
  
  industry_category text,
  brand_name text,
  company_title text,
  tax_id text,
  job_title text,
  main_service text,
  website text,
  
  intro text,
  company text,
  industry_chain text,
  join_date text,
  quit_date text,
  
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 7. 建立出席紀錄資料表 (attendance) - 可保留用於更細緻的點名，或直接使用 member_registrations 的 check_in_status
create table if not exists public.attendance (
  id text primary key default uuid_generate_v4()::text,
  activity_id text not null,
  member_id text not null,
  status text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(activity_id, member_id)
);

-- 8. 建立折扣券資料表 (coupons)
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
