
-- Add Solana fields to agents table
alter table agents 
add column if not exists solana_address text,
add column if not exists token_mint text;

-- Index for faster lookups
create index if not exists idx_agents_solana_address on agents(solana_address);
create index if not exists idx_agents_token_mint on agents(token_mint);

-- Add a column for verified status on Solana
alter table agents add column if not exists is_solana_verified boolean default false;
