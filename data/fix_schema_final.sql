
-- 1. Add velocity column
do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_name = 'agents' and column_name = 'velocity') then
    alter table agents add column velocity float4 default 0;
  end if;
end $$;

-- 2. Add ai_summary column
do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_name = 'agents' and column_name = 'ai_summary') then
    alter table agents add column ai_summary text;
  end if;
end $$;

-- 3. Create/Update velocity logic
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

-- 4. Create trigger logic
create or replace function trigger_update_velocity()
returns trigger as $$
begin
  perform update_agent_velocity();
  return new;
end;
$$ language plpgsql;

-- Drop trigger if exists to avoid conflicts
drop trigger if exists on_vote_update_velocity on agent_votes;

create trigger on_vote_update_velocity
after insert on agent_votes
for each statement execute procedure trigger_update_velocity();
