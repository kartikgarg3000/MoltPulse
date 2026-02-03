
-- 1. Add velocity column if not exists
do $$ 
begin
  if not exists (select 1 from pf_get_columns('agents') where column_name = 'velocity') then
    alter table agents add column velocity float4 default 0;
  end if;
end $$;

-- 2. Create the velocity calculation function
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

-- 3. Create a trigger to update velocity on every vote? 
-- (Might be heavy, but for now simple is better)
create or replace function trigger_update_velocity()
returns trigger as $$
begin
  perform update_agent_velocity();
  return new;
end;
$$ language plpgsql;

create or replace trigger on_vote_update_velocity
after insert on agent_votes
for each statement execute procedure trigger_update_velocity();
