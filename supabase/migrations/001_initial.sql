-- LA.IO Badge Builder v2 - Initial Schema
-- Run this in your Supabase SQL Editor

-- Partners table: lightweight registry created when a badge is built
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  badge_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_partners_slug ON partners(slug);

-- Events table: high-write table for impression/click tracking
CREATE TABLE IF NOT EXISTS events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type TEXT NOT NULL,           -- 'impression' | 'click'
  partner_slug TEXT NOT NULL,
  domain TEXT,                        -- host site domain
  page_url TEXT,                      -- full page URL
  badge_layout TEXT DEFAULT 'standard', -- 'standard' | 'compact' | 'wordmark'
  badge_color TEXT,
  badge_size TEXT,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,                       -- from edge function geo headers
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast dashboard queries
CREATE INDEX IF NOT EXISTS idx_events_slug_date ON events(partner_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_domain ON events(partner_slug, domain);

-- Row Level Security (RLS)
-- Partners: allow public read, authenticated insert/update
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners are viewable by everyone"
  ON partners FOR SELECT
  USING (true);

CREATE POLICY "Partners can be created by anyone"
  ON partners FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Partners can be updated by anyone"
  ON partners FOR UPDATE
  USING (true);

-- Events: allow public insert (for tracking), authenticated read
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events can be inserted by anyone"
  ON events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on partners
DROP TRIGGER IF EXISTS update_partners_updated_at ON partners;
CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
