import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Some features may not work.')
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// ===== Admin Authentication (Simple Password) =====

const ADMIN_SESSION_KEY = 'laio_admin_session'

/**
 * Verify admin password against database
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 */
export async function verifyAdminPassword(email, password) {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' }
  }

  const { data, error } = await supabase.rpc('verify_admin_password', {
    p_email: email,
    p_password: password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  if (data) {
    // Store session in localStorage
    const session = { email, timestamp: Date.now() }
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
    return { success: true, error: null }
  }

  return { success: false, error: 'Invalid email or password' }
}

/**
 * Sign out the current admin
 */
export function signOut() {
  localStorage.removeItem(ADMIN_SESSION_KEY)
}

/**
 * Get the current admin session
 * @returns {{ email: string, timestamp: number } | null}
 */
export function getAdminSession() {
  try {
    const session = localStorage.getItem(ADMIN_SESSION_KEY)
    if (!session) return null

    const parsed = JSON.parse(session)

    // Session expires after 24 hours
    const maxAge = 24 * 60 * 60 * 1000
    if (Date.now() - parsed.timestamp > maxAge) {
      localStorage.removeItem(ADMIN_SESSION_KEY)
      return null
    }

    return parsed
  } catch {
    return null
  }
}

/**
 * Check if there's a valid admin session
 */
export function isAdminLoggedIn() {
  return getAdminSession() !== null
}

/**
 * Upsert a partner record when they create a badge
 * @param {Object} partner - Partner data
 * @param {string} partner.slug - Unique partner slug
 * @param {string} partner.displayName - Display name
 * @param {Object} partner.badgeConfig - Badge configuration (color, size, layout)
 */
export async function upsertPartner({ slug, displayName, badgeConfig }) {
  if (!supabase) {
    console.warn('Supabase not configured, skipping partner upsert')
    return { data: null, error: new Error('Supabase not configured') }
  }

  const { data, error } = await supabase
    .from('partners')
    .upsert(
      {
        slug,
        display_name: displayName,
        badge_config: badgeConfig,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'slug',
      }
    )
    .select()
    .single()

  if (error) {
    console.error('Error upserting partner:', error)
  }

  return { data, error }
}

/**
 * Get partner data by slug
 * @param {string} slug - Partner slug
 */
export async function getPartner(slug) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }

  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('slug', slug)
    .single()

  return { data, error }
}

// ===== Dashboard Data Functions =====

/**
 * Get partner stats for overview cards
 * @param {string} slug - Partner slug
 * @param {number} days - Number of days for the time range (7, 30, 90)
 */
export async function getPartnerStats(slug, days = 30) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }

  const { data, error } = await supabase.rpc('get_partner_stats', {
    p_slug: slug,
    p_days: days,
  })

  return { data, error }
}

/**
 * Get daily stats for time series chart
 * @param {string} slug - Partner slug
 * @param {number} days - Number of days for the time range
 */
export async function getDailyStats(slug, days = 30) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }

  const { data, error } = await supabase.rpc('get_daily_stats', {
    p_slug: slug,
    p_days: days,
  })

  return { data, error }
}

/**
 * Get domain breakdown
 * @param {string} slug - Partner slug
 * @param {number} days - Number of days for the time range
 * @param {number} limit - Maximum number of domains to return
 */
export async function getDomainBreakdown(slug, days = 30, limit = 20) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }

  const { data, error } = await supabase.rpc('get_domain_breakdown', {
    p_slug: slug,
    p_days: days,
    p_limit: limit,
  })

  return { data, error }
}

/**
 * Get recent activity feed
 * @param {string} slug - Partner slug
 * @param {number} limit - Maximum number of events to return
 */
export async function getRecentActivity(slug, limit = 20) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }

  const { data, error } = await supabase.rpc('get_recent_activity', {
    p_slug: slug,
    p_limit: limit,
  })

  return { data, error }
}

// ===== Admin Dashboard Functions =====

/**
 * Get admin-level stats across all partners
 * @param {number} days - Number of days (0 for all time)
 */
export async function getAdminStats(days = 30) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }

  const { data, error } = await supabase.rpc('get_admin_stats', {
    p_days: days,
  })

  return { data, error }
}

/**
 * Get partner leaderboard sorted by impressions
 * @param {number} days - Number of days (0 for all time)
 * @param {number} limit - Maximum number of partners to return
 */
export async function getPartnerLeaderboard(days = 30, limit = 50) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }

  const { data, error } = await supabase.rpc('get_partner_leaderboard', {
    p_days: days,
    p_limit: limit,
  })

  return { data, error }
}

/**
 * Get chart stats across all partners with adaptive granularity
 * 7d/30d = daily, 90d = weekly, 0 (all time) = monthly
 * @param {number} days - Number of days (0 for all time)
 */
export async function getAdminChartStats(days = 30) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }

  const { data, error } = await supabase.rpc('get_admin_chart_stats', {
    p_days: days,
  })

  return { data, error }
}

/**
 * Get recent activity across all partners
 * @param {number} limit - Maximum number of events to return
 */
export async function getAdminRecentActivity(limit = 30) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }

  const { data, error } = await supabase.rpc('get_admin_recent_activity', {
    p_limit: limit,
  })

  return { data, error }
}

/**
 * Get detailed stats for a specific partner (for expandable rows)
 * @param {string} slug - Partner slug
 * @param {number} days - Number of days (0 for all time)
 */
export async function getPartnerDetail(slug, days = 30) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }

  const { data, error } = await supabase.rpc('get_partner_detail', {
    p_slug: slug,
    p_days: days,
  })

  return { data, error }
}

/**
 * Get admin highlights (meaningful activity feed)
 * @param {number} limit - Maximum number of highlights to return
 */
export async function getAdminHighlights(limit = 20) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') }
  }

  const { data, error } = await supabase.rpc('get_admin_highlights', {
    p_limit: limit,
  })

  return { data, error }
}
