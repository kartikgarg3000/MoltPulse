-- Migration: Quality Gate & Curation System
-- Adds quality scoring, verification, and visibility columns to agents table

-- Quality & visibility columns
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS quality_score float4 DEFAULT 0;

-- Extended metadata for quality computation
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS readme_length int4 DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_releases boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS license text,
ADD COLUMN IF NOT EXISTS language text,
ADD COLUMN IF NOT EXISTS topics text[] DEFAULT '{}';

-- Indexes for filtered directory queries
CREATE INDEX IF NOT EXISTS idx_agents_visible ON agents(is_visible);
CREATE INDEX IF NOT EXISTS idx_agents_quality ON agents(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_agents_verified ON agents(is_verified);
CREATE INDEX IF NOT EXISTS idx_agents_visible_pulse ON agents(is_visible, pulse_score DESC);
