-- Add Pulse Score columns
alter table agents 
add column if not exists pulse_score float4 default 0,
add column if not exists growth_score float4 default 0,
add column if not exists activity_score float4 default 0,
add column if not exists popularity_score float4 default 0,
add column if not exists trust_score float4 default 0;

-- Add Raw Metrics columns
alter table agents
add column if not exists forks int4 default 0,
add column if not exists watchers int4 default 0,
add column if not exists open_issues int4 default 0,
add column if not exists contributors_count int4 default 0,
add column if not exists recent_commits int4 default 0;

-- Add index for sorting by pulse
create index if not exists idx_agents_pulse on agents(pulse_score desc);
