-- LA.IO Badge Builder v2 - Admin Highlights RPC Function
-- Calculates meaningful activity highlights instead of raw events

DROP FUNCTION IF EXISTS get_admin_highlights(integer) CASCADE;

-- Function: Get admin highlights (meaningful activity feed)
CREATE OR REPLACE FUNCTION get_admin_highlights(
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  highlight_type TEXT,
  partner_slug TEXT,
  partner_name TEXT,
  value TEXT,
  highlight_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH
  -- 1. New partners who joined (created badges)
  new_partners AS (
    SELECT
      'new_partner'::TEXT AS highlight_type,
      p.slug AS partner_slug,
      p.display_name AS partner_name,
      NULL::TEXT AS value,
      p.created_at AS highlight_at
    FROM partners p
    WHERE p.created_at >= (now() - INTERVAL '90 days')
  ),

  -- 2. Calculate total impressions per partner to find milestone crossings
  partner_impressions AS (
    SELECT
      e.partner_slug,
      COALESCE(p.display_name, e.partner_slug) AS partner_name,
      COUNT(*) AS total_impressions,
      MAX(e.created_at) AS last_impression_at
    FROM events e
    LEFT JOIN partners p ON e.partner_slug = p.slug
    WHERE e.event_type = 'impression'
    GROUP BY e.partner_slug, p.display_name
  ),

  -- Find which milestone each partner has crossed (highest milestone)
  milestones AS (
    SELECT
      'milestone'::TEXT AS highlight_type,
      pi.partner_slug,
      pi.partner_name,
      CASE
        WHEN pi.total_impressions >= 100000 THEN '100000'
        WHEN pi.total_impressions >= 50000 THEN '50000'
        WHEN pi.total_impressions >= 25000 THEN '25000'
        WHEN pi.total_impressions >= 10000 THEN '10000'
        WHEN pi.total_impressions >= 5000 THEN '5000'
        WHEN pi.total_impressions >= 1000 THEN '1000'
        WHEN pi.total_impressions >= 500 THEN '500'
        WHEN pi.total_impressions >= 100 THEN '100'
        ELSE NULL
      END AS value,
      pi.last_impression_at AS highlight_at
    FROM partner_impressions pi
    WHERE pi.total_impressions >= 100
  ),

  -- 3. New domains - first appearance of a badge on a domain
  first_domain_appearances AS (
    SELECT
      e.partner_slug,
      e.domain,
      MIN(e.created_at) AS first_seen
    FROM events e
    WHERE e.event_type = 'impression'
      AND e.domain IS NOT NULL
      AND e.domain != ''
      AND e.created_at >= (now() - INTERVAL '30 days')
    GROUP BY e.partner_slug, e.domain
  ),
  new_domains AS (
    SELECT
      'new_domain'::TEXT AS highlight_type,
      fda.partner_slug,
      COALESCE(p.display_name, fda.partner_slug) AS partner_name,
      fda.domain AS value,
      fda.first_seen AS highlight_at
    FROM first_domain_appearances fda
    LEFT JOIN partners p ON fda.partner_slug = p.slug
    -- Only show domains that were first seen in the last 7 days
    WHERE fda.first_seen >= (now() - INTERVAL '7 days')
  ),

  -- 4. Top performers - weekly top partner
  weekly_top AS (
    SELECT
      'top_weekly'::TEXT AS highlight_type,
      e.partner_slug,
      COALESCE(p.display_name, e.partner_slug) AS partner_name,
      COUNT(*)::TEXT AS value,
      date_trunc('week', now()) AS highlight_at
    FROM events e
    LEFT JOIN partners p ON e.partner_slug = p.slug
    WHERE e.event_type = 'impression'
      AND e.created_at >= date_trunc('week', now())
    GROUP BY e.partner_slug, p.display_name
    ORDER BY COUNT(*) DESC
    LIMIT 1
  ),

  -- Combine all highlights
  all_highlights AS (
    SELECT * FROM new_partners
    UNION ALL
    SELECT * FROM milestones WHERE value IS NOT NULL
    UNION ALL
    SELECT * FROM new_domains
    UNION ALL
    SELECT * FROM weekly_top WHERE value::INTEGER > 10  -- Only show if meaningful activity
  )

  SELECT
    ah.highlight_type,
    ah.partner_slug,
    ah.partner_name,
    ah.value,
    ah.highlight_at
  FROM all_highlights ah
  ORDER BY ah.highlight_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_admin_highlights(INTEGER) TO anon, authenticated;
