
-- 1. Create a view for Global Stats
create or replace view global_stats as
select
  count(*) as total_agents,
  sum(votes) as total_votes,
  sum(stars) as total_stars,
  count(*) filter (where created_at > now() - interval '24 hours') as new_agents_24h
from agents;

-- 2. Update Pulse Score Function
-- Normalizes score (rough weight: 40% Velocity, 30% Votes, 30% Stars)
create or replace function calculate_pulse_score(stars int, votes int, velocity float)
returns float as $$
begin
  -- This is a very basic normalization for demonstration
  return (
    (least(stars, 10000) / 10000.0 * 30) +
    (least(votes, 1000) / 1000.0 * 30) +
    (least(velocity * 100, 100) / 100.0 * 40)
  );
end;
$$ language plpgsql immutable;

-- 3. Add Pulse Score column to agents
alter table agents add column if not exists pulse_score float4 default 0;

-- 4. Trigger to update pulse_score automatically
create or replace function trigger_update_pulse_score()
returns trigger as $$
begin
  new.pulse_score = calculate_pulse_score(new.stars, new.votes, new.velocity);
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_agent_update_pulse_score on agents;
create trigger on_agent_update_pulse_score
before insert or update on agents
for each row execute procedure trigger_update_pulse_score();
