-- LA.IO Badge Builder v2 - Admin Dashboard RPC Functions
-- Run this in your Supabase SQL Editor

-- Drop existing functions first
DROP FUNCTION IF EXISTS get_admin_stats(integer) CASCADE;
DROP FUNCTION IF EXISTS get_partner_leaderboard(integer, integer) CASCADE;
DROP FUNCTION IF EXISTS get_admin_daily_stats(integer) CASCADE;
DROP FUNCTION IF EXISTS get_admin_recent_activity(integer) CASCADE;
DROP FUNCTION IF EXISTS get_partner_detail(text, integer) CASCADE;

-- Function: Get admin-level stats across all partners
CREATE OR REPLACE FUNCTION get_admin_stats(
  p_days INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  current_start TIMESTAMPTZ;
  previous_start TIMESTAMPTZ;
  previous_end TIMESTAMPTZ;
BEGIN
  -- For "all time", use a very old date
  IF p_days = 0 THEN
    current_start := '1970-01-01'::TIMESTAMPTZ;
    previous_start := '1970-01-01'::TIMESTAMPTZ;
    previous_end := '1970-01-01'::TIMESTAMPTZ;
  ELSE
    current_start := now() - (p_days || ' days')::INTERVAL;
    previous_end := current_start;
    previous_start := previous_end - (p_days || ' days')::INTERVAL;
  END IF;

  SELECT json_build_object(
    'current', (
      SELECT json_build_object(
        'impressions', COALESCE(COUNT(*) FILTER (WHERE event_type = 'impression'), 0),
        'clicks', COALESCE(COUNT(*) FILTER (WHERE event_type = 'click'), 0),
        'unique_domains', COALESCE(COUNT(DISTINCT domain), 0),
        'active_partners', COALESCE(COUNT(DISTINCT partner_slug), 0)
      )
      FROM events
      WHERE (p_days = 0 OR created_at >= current_start)
    ),
    'previous', (
      SELECT json_build_object(
        'impressions', COALESCE(COUNT(*) FILTER (WHERE event_type = 'impression'), 0),
        'clicks', COALESCE(COUNT(*) FILTER (WHERE event_type = 'click'), 0),
        'unique_domains', COALESCE(COUNT(DISTINCT domain), 0),
        'active_partners', COALESCE(COUNT(DISTINCT partner_slug), 0)
      )
      FROM events
      WHERE p_days > 0
        AND created_at >= previous_start
        AND created_at < previous_end
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get partner leaderboard sorted by impressions
CREATE OR REPLACE FUNCTION get_partner_leaderboard(
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  partner_slug TEXT,
  display_name TEXT,
  impressions BIGINT,
  clicks BIGINT,
  unique_domains BIGINT,
  last_activity TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.partner_slug,
    COALESCE(p.display_name, e.partner_slug) AS display_name,
    COUNT(*) FILTER (WHERE e.event_type = 'impression') AS impressions,
    COUNT(*) FILTER (WHERE e.event_type = 'click') AS clicks,
    COUNT(DISTINCT e.domain) AS unique_domains,
    MAX(e.created_at) AS last_activity
  FROM events e
  LEFT JOIN partners p ON e.partner_slug = p.slug
  WHERE (p_days = 0 OR e.created_at >= (now() - (p_days || ' days')::INTERVAL))
  GROUP BY e.partner_slug, p.display_name
  ORDER BY impressions DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get daily stats across all partners for chart
CREATE OR REPLACE FUNCTION get_admin_daily_stats(
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
    WHERE created_at >= (CURRENT_DATE - (p_days - 1))
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

-- Function: Get recent activity across all partners
CREATE OR REPLACE FUNCTION get_admin_recent_activity(
  p_limit INTEGER DEFAULT 30
)
RETURNS TABLE (
  id BIGINT,
  event_type TEXT,
  partner_slug TEXT,
  display_name TEXT,
  domain TEXT,
  page_url TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.event_type,
    e.partner_slug,
    COALESCE(p.display_name, e.partner_slug) AS display_name,
    e.domain,
    e.page_url,
    e.created_at
  FROM events e
  LEFT JOIN partners p ON e.partner_slug = p.slug
  ORDER BY e.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get detailed stats for a specific partner (for expandable rows)
CREATE OR REPLACE FUNCTION get_partner_detail(
  p_slug TEXT,
  p_days INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'daily_stats', (
      SELECT json_agg(row_to_json(d))
      FROM (
        SELECT
          DATE(created_at) AS day,
          COUNT(*) FILTER (WHERE event_type = 'impression') AS impressions,
          COUNT(*) FILTER (WHERE event_type = 'click') AS clicks
        FROM events
        WHERE partner_slug = p_slug
          AND (p_days = 0 OR created_at >= (now() - (p_days || ' days')::INTERVAL))
        GROUP BY DATE(created_at)
        ORDER BY day ASC
      ) d
    ),
    'domains', (
      SELECT json_agg(row_to_json(dm))
      FROM (
        SELECT
          domain,
          COUNT(*) FILTER (WHERE event_type = 'impression') AS impressions,
          COUNT(*) FILTER (WHERE event_type = 'click') AS clicks,
          MAX(created_at) AS last_seen
        FROM events
        WHERE partner_slug = p_slug
          AND (p_days = 0 OR created_at >= (now() - (p_days || ' days')::INTERVAL))
          AND domain IS NOT NULL
          AND domain != ''
        GROUP BY domain
        ORDER BY impressions DESC
        LIMIT 10
      ) dm
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_admin_stats(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_partner_leaderboard(INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_admin_daily_stats(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_admin_recent_activity(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_partner_detail(TEXT, INTEGER) TO anon, authenticated;
