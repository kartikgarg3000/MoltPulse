-- 1. Create profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- 2. Enable RLS on profiles
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- 3. Create votes tracking table (to prevent double voting)
create table if not exists agent_votes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users on delete cascade not null,
  agent_repo text references agents(repo) on delete cascade not null,
  
  unique(user_id, agent_repo) -- 1 vote per user per agent
);

-- 4. Enable RLS on agent_votes
alter table agent_votes enable row level security;
create policy "Votes are viewable by everyone." on agent_votes for select using (true);
create policy "Users can vote once." on agent_votes for insert with check (auth.uid() = user_id);
create policy "Users can remove their vote." on agent_votes for delete using (auth.uid() = user_id);

-- 5. Create a function to handle new user profiles automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
