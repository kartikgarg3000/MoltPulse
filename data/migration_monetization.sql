-- MoltPulse Monetization Migration
-- Adds monetization and plan tracking fields to the submissions table

alter table submissions 
add column if not exists plan text default 'free',
add column if not exists payment_status text default 'pending',
add column if not exists stripe_session_id text;

-- Index for quickly filtering priority and featured submissions in admin portal
create index if not exists idx_submissions_plan on submissions(plan);
create index if not exists idx_submissions_payment on submissions(payment_status);
