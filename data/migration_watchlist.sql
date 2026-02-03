
-- Create watchlist table
create table if not exists watchlist (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users on delete cascade not null,
  agent_repo text references agents(repo) on delete cascade not null,
  
  unique(user_id, agent_repo) -- A user can watch an agent only once
);

-- Enable RLS
alter table watchlist enable row level security;

-- Policies
create policy "Users can view their own watchlist." on watchlist for select using (auth.uid() = user_id);
create policy "Users can add to their watchlist." on watchlist for insert with check (auth.uid() = user_id);
create policy "Users can remove from their watchlist." on watchlist for delete using (auth.uid() = user_id);
