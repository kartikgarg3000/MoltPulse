-- Run this in your Supabase SQL Editor

create table if not exists agents (
  repo text primary key,           -- e.g. "facebook/react"
  name text not null,              -- e.g. "React"
  description text,
  stars int4 default 0,
  last_update timestamptz,
  trend text,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS) is good practice, 
-- but for this scraper we need to write to it.
-- If you want the public (anon) key to write, you need a policy.
-- WARNING: This allows anyone with your anon key to write/update data.
-- Since this is a demo/scraper, we will allow it for now.
alter table agents enable row level security;

create policy "Enable read access for all users"
on agents for select
using (true);

create policy "Enable insert/update for anon key"
on agents for insert
with check (true);

create policy "Enable update for anon key"
on agents for update
using (true);
