-- Create submissions table
create table if not exists submissions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  repo text not null,
  submitter_name text,
  submitter_contact text,
  status text default 'pending', -- pending, approved, rejected
  notes text
);

-- Note: No RLS for now to allow anonymous submissions, but we'll add it later.
alter table submissions enable row level security;
create policy "Anyone can submit" on submissions for insert with check (true);
create policy "Admin can view submissions" on submissions for select using (true); -- We'll tighten this later
