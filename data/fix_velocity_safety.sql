
-- 1. Create/Update velocity logic with a safety WHERE clause
create or replace function update_agent_velocity()
returns void as $$
begin
  -- Using WHERE true to bypass "UPDATE requires a WHERE clause" safety checks
  -- if we truly want to update all rows to keep velocity fresh.
  update agents a
  set velocity = (
    select count(*)
    from agent_votes v
    where v.agent_repo = a.repo
    and v.created_at > now() - interval '24 hours'
  ) / 24.0
  where true; 
end;
$$ language plpgsql security definer;

-- 2. Optimized version for single repo (optional, but good for performance)
create or replace function update_single_agent_velocity(target_repo text)
returns void as $$
begin
  update agents a
  set velocity = (
    select count(*)
    from agent_votes v
    where v.agent_repo = a.repo
    and v.created_at > now() - interval '24 hours'
  ) / 24.0
  where a.repo = target_repo;
end;
$$ language plpgsql security definer;

-- 3. Update the trigger to be more surgical if possible, 
-- or just stay with the 'where true' one for correctness across all agents as time passes.
create or replace function trigger_update_velocity()
returns trigger as $$
begin
  -- For now, update everyone to ensure time-based decay works
  perform update_agent_velocity();
  return new;
end;
$$ language plpgsql;

-- Re-apply trigger
drop trigger if exists on_vote_update_velocity on agent_votes;
create trigger on_vote_update_velocity
after insert on agent_votes
for each statement execute procedure trigger_update_velocity();
