
-- 1. Surgical update function
create or replace function update_specific_agent_velocity(target_repo text)
returns void as $$
begin
  update agents 
  set velocity = (
    select count(*)
    from agent_votes
    where agent_repo = target_repo
    and created_at > now() - interval '24 hours'
  ) / 24.0
  where repo = target_repo;
end;
$$ language plpgsql security definer;

-- 2. Update the trigger to only update the affected agent
create or replace function trigger_update_velocity_row()
returns trigger as $$
begin
  -- Use NEW.agent_repo for the row being inserted
  perform update_specific_agent_velocity(NEW.agent_repo);
  return NEW;
end;
$$ language plpgsql;

-- 3. Apply the per-row trigger (much more efficient and avoids WHERE clause safety issues)
drop trigger if exists on_vote_update_velocity on agent_votes;

create trigger on_vote_update_velocity
after insert on agent_votes
for each row execute procedure trigger_update_velocity_row();
