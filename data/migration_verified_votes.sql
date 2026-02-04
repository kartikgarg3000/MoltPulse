
-- Migration: Verified Pulse Votes (Solana)

-- Add solana_wallet and signature columns to agent_votes
alter table agent_votes 
add column if not exists solana_wallet text,
add column if not exists signature text,
add column if not exists is_verified boolean default false;

-- Create an index for wallet-based lookups
create index if not exists idx_agent_votes_solana_wallet on agent_votes(solana_wallet);

-- Update the increment function to handle verification (optional, can just use raw count for now)
-- We will track "Pulse Score" separately.
