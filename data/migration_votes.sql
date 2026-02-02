-- Add votes column
alter table agents 
add column if not exists votes int4 default 0;

-- Function to increment votes atomically
-- (This prevents race conditions when multiple people vote at once)
create or replace function increment_vote(repo_id text)
returns void as $$
begin
  update agents 
  set votes = votes + 1
  where repo = repo_id;
end;
$$ language plpgsql;
