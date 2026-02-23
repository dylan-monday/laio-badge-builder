-- LA.IO Badge Builder v2 - Add badge_version column for migration tracking
-- Run this in your Supabase SQL Editor BEFORE running the migration script

-- Add badge_version column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS badge_version TEXT DEFAULT 'v2';

-- Index for filtering by version (useful for v1 vs v2 analytics)
CREATE INDEX IF NOT EXISTS idx_events_version ON events(badge_version);
