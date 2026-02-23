import { cn } from '@/lib/utils'

/**
 * Overview Component
 * Displays 4 stat cards: Impressions, Clicks, CTR, Unique Domains (or Active Partners for admin)
 */
export function Overview({ stats, loading, isAdmin = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl p-4 sm:p-6 animate-pulse">
            <div className="h-3 w-20 bg-sub/20 rounded mb-3" />
            <div className="h-8 w-24 bg-sub/20 rounded" />
          </div>
        ))}
      </div>
    )
  }

  const current = stats?.current || { impressions: 0, clicks: 0, unique_domains: 0, active_partners: 0 }
  const previous = stats?.previous || { impressions: 0, clicks: 0, unique_domains: 0, active_partners: 0 }

  // Calculate CTR
  const ctr = current.impressions > 0
    ? ((current.clicks / current.impressions) * 100).toFixed(2)
    : '0.00'

  const previousCtr = previous.impressions > 0
    ? ((previous.clicks / previous.impressions) * 100)
    : 0

  // Calculate trends (percentage change from previous period)
  const calcTrend = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous * 100).toFixed(1)
  }

  const cards = [
    {
      label: 'Impressions',
      value: formatNumber(current.impressions),
      trend: calcTrend(current.impressions, previous.impressions),
      icon: EyeIcon,
    },
    {
      label: 'Clicks',
      value: formatNumber(current.clicks),
      trend: calcTrend(current.clicks, previous.clicks),
      icon: CursorIcon,
    },
    {
      label: isAdmin ? 'Active Partners' : 'Click Rate',
      value: isAdmin ? formatNumber(current.active_partners) : `${ctr}%`,
      trend: isAdmin
        ? calcTrend(current.active_partners, previous.active_partners)
        : calcTrend(parseFloat(ctr), previousCtr),
      icon: isAdmin ? UsersIcon : PercentIcon,
    },
    {
      label: 'Unique Domains',
      value: formatNumber(current.unique_domains),
      trend: calcTrend(current.unique_domains, previous.unique_domains),
      icon: GlobeIcon,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  )
}

function StatCard({ label, value, trend, icon: Icon }) {
  const trendNum = parseFloat(trend)
  const isPositive = trendNum > 0
  const isNeutral = trendNum === 0

  return (
    <div className="bg-card rounded-xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm text-sub uppercase tracking-wider">{label}</span>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-sub" />
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text">{value}</span>
        {!isNeutral && (
          <div
            className={cn(
              'flex items-center gap-0.5 text-xs sm:text-sm font-medium',
              isPositive ? 'text-success' : 'text-error'
            )}
          >
            {isPositive ? (
              <TrendUpIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <TrendDownIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
            <span>{Math.abs(trendNum)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Format large numbers with K/M suffixes
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// Icons
function EyeIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function CursorIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
    </svg>
  )
}

function PercentIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-6 4h6m-6 4h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
    </svg>
  )
}

function GlobeIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  )
}

function UsersIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function TrendUpIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  )
}

function TrendDownIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  )
}

export default Overview
