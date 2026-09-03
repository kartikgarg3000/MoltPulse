-- ============================================================
-- MoltPulse: Watchlist Alerts Migration
-- Run this in Supabase SQL Editor BEFORE deploying the
-- watchlist feature code.
-- ============================================================

-- 1. Add alert preference columns to existing watchlist table
ALTER TABLE watchlist
  ADD COLUMN IF NOT EXISTS alert_on_surge BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS surge_threshold INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS last_pulse INTEGER;

-- 2. Create the in-app notification log table
CREATE TABLE IF NOT EXISTS watchlist_alerts (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at   TIMESTAMPTZ DEFAULT now(),
  user_id      UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_repo   TEXT        NOT NULL,
  alert_type   TEXT        NOT NULL DEFAULT 'surge',
  message      TEXT        NOT NULL,
  old_pulse    INTEGER,
  new_pulse    INTEGER,
  read_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS watchlist_alerts_user_unread_idx
  ON watchlist_alerts (user_id, read_at)
  WHERE read_at IS NULL;

ALTER TABLE watchlist_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY ""Users see own alerts"" ON watchlist_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY ""Users mark own alerts read"" ON watchlist_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY ""Service can insert alerts"" ON watchlist_alerts FOR INSERT WITH CHECK (true);
