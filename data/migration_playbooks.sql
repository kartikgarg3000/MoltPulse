
-- Create playbooks table
create table if not exists playbooks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  slug text unique not null,
  description text,
  content text, -- Markdown content
  author_id uuid references auth.users on delete set null,
  category text default 'General',
  difficulty text default 'Beginner',
  thumbnail_url text,
  featured boolean default false
);

-- Enable RLS
alter table playbooks enable row level security;

-- Policies
create policy "Playbooks are viewable by everyone." on playbooks for select using (true);
create policy "Only admins or authors can modify playbooks." on playbooks for update using (auth.uid() = author_id);
