-- Run this in your Supabase SQL Editor

create table if not exists agents (
  repo text primary key,           -- e.g. "facebook/react"
  name text not null,              -- e.g. "React"
  description text,
  stars int4 default 0,
  last_update timestamptz,
  trend text,
  created_at timestamptz default now(),
  velocity float4 default 0        -- Votes per hour or growth metric
);

-- Function to calculate and update velocity for all agents
-- This can be called via a trigger or a cron job
create or replace function update_agent_velocity()
returns void as $$
begin
  update agents a
  set velocity = (
    select count(*)
    from agent_votes v
    where v.agent_repo = a.repo
    and v.created_at > now() - interval '24 hours'
  ) / 24.0;
end;
$$ language plpgsql security definer;


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
