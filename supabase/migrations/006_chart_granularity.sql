-- LA.IO Badge Builder v2 - Chart with adaptive granularity
-- Replaces get_admin_daily_stats with granularity support

DROP FUNCTION IF EXISTS get_admin_daily_stats(integer) CASCADE;
DROP FUNCTION IF EXISTS get_admin_chart_stats(integer) CASCADE;

-- Function: Get chart stats with adaptive granularity
-- 7d, 30d = daily | 90d = weekly | 0 (all time) = monthly
CREATE OR REPLACE FUNCTION get_admin_chart_stats(
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  period TEXT,
  period_start DATE,
  impressions BIGINT,
  clicks BIGINT
) AS $$
DECLARE
  v_granularity TEXT;
  v_start_date DATE;
BEGIN
  -- Determine granularity based on days
  IF p_days = 0 THEN
    v_granularity := 'month';
    -- For all time, start from first event or 12 months ago
    SELECT COALESCE(DATE(MIN(created_at)), CURRENT_DATE - INTERVAL '12 months')
    INTO v_start_date
    FROM events;
  ELSIF p_days = 90 THEN
    v_granularity := 'week';
    v_start_date := CURRENT_DATE - (p_days - 1);
  ELSE
    v_granularity := 'day';
    v_start_date := CURRENT_DATE - (p_days - 1);
  END IF;

  IF v_granularity = 'day' THEN
    -- Daily granularity
    RETURN QUERY
    WITH date_series AS (
      SELECT generate_series(
        v_start_date,
        CURRENT_DATE,
        '1 day'::INTERVAL
      )::DATE AS period_date
    ),
    aggregated AS (
      SELECT
        DATE(created_at) AS period_date,
        COUNT(*) FILTER (WHERE event_type = 'impression') AS impressions,
        COUNT(*) FILTER (WHERE event_type = 'click') AS clicks
      FROM events
      WHERE created_at >= v_start_date
      GROUP BY DATE(created_at)
    )
    SELECT
      to_char(ds.period_date, 'Mon DD') AS period,
      ds.period_date AS period_start,
      COALESCE(a.impressions, 0) AS impressions,
      COALESCE(a.clicks, 0) AS clicks
    FROM date_series ds
    LEFT JOIN aggregated a ON ds.period_date = a.period_date
    ORDER BY ds.period_date ASC;

  ELSIF v_granularity = 'week' THEN
    -- Weekly granularity
    RETURN QUERY
    WITH week_series AS (
      SELECT generate_series(
        date_trunc('week', v_start_date::TIMESTAMP),
        date_trunc('week', CURRENT_DATE::TIMESTAMP),
        '1 week'::INTERVAL
      )::DATE AS week_start
    ),
    aggregated AS (
      SELECT
        date_trunc('week', created_at)::DATE AS week_start,
        COUNT(*) FILTER (WHERE event_type = 'impression') AS impressions,
        COUNT(*) FILTER (WHERE event_type = 'click') AS clicks
      FROM events
      WHERE created_at >= v_start_date
      GROUP BY date_trunc('week', created_at)
    )
    SELECT
      'W' || to_char(ws.week_start, 'IW') AS period,
      ws.week_start AS period_start,
      COALESCE(a.impressions, 0) AS impressions,
      COALESCE(a.clicks, 0) AS clicks
    FROM week_series ws
    LEFT JOIN aggregated a ON ws.week_start = a.week_start
    ORDER BY ws.week_start ASC;

  ELSE
    -- Monthly granularity (all time)
    RETURN QUERY
    WITH month_series AS (
      SELECT generate_series(
        date_trunc('month', v_start_date::TIMESTAMP),
        date_trunc('month', CURRENT_DATE::TIMESTAMP),
        '1 month'::INTERVAL
      )::DATE AS month_start
    ),
    aggregated AS (
      SELECT
        date_trunc('month', created_at)::DATE AS month_start,
        COUNT(*) FILTER (WHERE event_type = 'impression') AS impressions,
        COUNT(*) FILTER (WHERE event_type = 'click') AS clicks
      FROM events
      GROUP BY date_trunc('month', created_at)
    )
    SELECT
      to_char(ms.month_start, 'Mon ''YY') AS period,
      ms.month_start AS period_start,
      COALESCE(a.impressions, 0) AS impressions,
      COALESCE(a.clicks, 0) AS clicks
    FROM month_series ms
    LEFT JOIN aggregated a ON ms.month_start = a.month_start
    ORDER BY ms.month_start ASC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_admin_chart_stats(INTEGER) TO anon, authenticated;
