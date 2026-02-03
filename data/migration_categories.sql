-- Add category column
alter table agents 
add column if not exists category text default 'Uncategorized';

-- Create an index for faster filtering later
create index if not exists idx_agents_category on agents(category);
