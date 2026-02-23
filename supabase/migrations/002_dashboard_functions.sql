-- LA.IO Badge Builder v2 - Dashboard RPC Functions
-- Run this in your Supabase SQL Editor after 001_initial.sql

-- Drop existing functions first (run these separately if you get signature errors)
DROP FUNCTION IF EXISTS get_partner_stats(text, integer) CASCADE;
DROP FUNCTION IF EXISTS get_daily_stats(text, integer) CASCADE;
DROP FUNCTION IF EXISTS get_domain_breakdown(text, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS get_recent_activity(text, integer) CASCADE;

-- Function: Get partner stats for overview cards
-- Returns totals and trends for impressions, clicks, CTR, unique domains
CREATE OR REPLACE FUNCTION get_partner_stats(
  p_slug TEXT,
  p_days INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  current_start TIMESTAMPTZ;
  previous_start TIMESTAMPTZ;
  previous_end TIMESTAMPTZ;
BEGIN
  current_start := now() - (p_days || ' days')::INTERVAL;
  previous_end := current_start;
  previous_start := previous_end - (p_days || ' days')::INTERVAL;

  SELECT json_build_object(
    'current', (
      SELECT json_build_object(
        'impressions', COALESCE(COUNT(*) FILTER (WHERE event_type = 'impression'), 0),
        'clicks', COALESCE(COUNT(*) FILTER (WHERE event_type = 'click'), 0),
        'unique_domains', COALESCE(COUNT(DISTINCT domain), 0)
      )
      FROM events
      WHERE partner_slug = p_slug
        AND created_at >= current_start
    ),
    'previous', (
      SELECT json_build_object(
        'impressions', COALESCE(COUNT(*) FILTER (WHERE event_type = 'impression'), 0),
        'clicks', COALESCE(COUNT(*) FILTER (WHERE event_type = 'click'), 0),
        'unique_domains', COALESCE(COUNT(DISTINCT domain), 0)
      )
      FROM events
      WHERE partner_slug = p_slug
        AND created_at >= previous_start
        AND created_at < previous_end
    ),
    'all_time', (
      SELECT json_build_object(
        'impressions', COALESCE(COUNT(*) FILTER (WHERE event_type = 'impression'), 0),
        'clicks', COALESCE(COUNT(*) FILTER (WHERE event_type = 'click'), 0),
        'unique_domains', COALESCE(COUNT(DISTINCT domain), 0)
      )
      FROM events
      WHERE partner_slug = p_slug
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get daily stats for time series chart
-- Returns impressions and clicks per day for the specified range
CREATE OR REPLACE FUNCTION get_daily_stats(
  p_slug TEXT,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  day DATE,
  impressions BIGINT,
  clicks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      (CURRENT_DATE - (p_days - 1)),
      CURRENT_DATE,
      '1 day'::INTERVAL
    )::DATE AS day
  ),
  daily_events AS (
    SELECT
      DATE(created_at) AS day,
      COUNT(*) FILTER (WHERE event_type = 'impression') AS impressions,
      COUNT(*) FILTER (WHERE event_type = 'click') AS clicks
    FROM events
    WHERE partner_slug = p_slug
      AND created_at >= (CURRENT_DATE - (p_days - 1))
    GROUP BY DATE(created_at)
  )
  SELECT
    ds.day,
    COALESCE(de.impressions, 0) AS impressions,
    COALESCE(de.clicks, 0) AS clicks
  FROM date_series ds
  LEFT JOIN daily_events de ON ds.day = de.day
  ORDER BY ds.day ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get domain breakdown
-- Returns domains with impression/click counts and last seen date
CREATE OR REPLACE FUNCTION get_domain_breakdown(
  p_slug TEXT,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  domain TEXT,
  impressions BIGINT,
  clicks BIGINT,
  last_seen TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.domain,
    COUNT(*) FILTER (WHERE e.event_type = 'impression') AS impressions,
    COUNT(*) FILTER (WHERE e.event_type = 'click') AS clicks,
    MAX(e.created_at) AS last_seen
  FROM events e
  WHERE e.partner_slug = p_slug
    AND e.created_at >= (now() - (p_days || ' days')::INTERVAL)
    AND e.domain IS NOT NULL
    AND e.domain != ''
  GROUP BY e.domain
  ORDER BY impressions DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get recent activity feed
-- Returns recent events with details
CREATE OR REPLACE FUNCTION get_recent_activity(
  p_slug TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id BIGINT,
  event_type TEXT,
  domain TEXT,
  page_url TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.event_type,
    e.domain,
    e.page_url,
    e.created_at
  FROM events e
  WHERE e.partner_slug = p_slug
  ORDER BY e.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_partner_stats(TEXT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_daily_stats(TEXT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_domain_breakdown(TEXT, INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_recent_activity(TEXT, INTEGER) TO anon, authenticated;
