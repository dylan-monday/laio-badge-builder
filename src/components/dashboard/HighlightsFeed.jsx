import { cn } from '@/lib/utils'

/**
 * HighlightsFeed Component
 * Shows meaningful activity highlights instead of raw events
 */
export function HighlightsFeed({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-card rounded-xl p-4 sm:p-6">
        <div className="h-4 w-32 bg-sub/20 rounded mb-4 animate-pulse" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-sub/10 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const highlights = data || []

  if (highlights.length === 0) {
    return (
      <div className="bg-card rounded-xl p-4 sm:p-6">
        <h3 className="text-sm font-medium text-sub uppercase tracking-wider mb-4">
          Highlights
        </h3>
        <div className="py-8 text-center text-sub">
          No highlights yet. Activity will appear here as partners use their badges.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-4 sm:p-6">
      <h3 className="text-sm font-medium text-sub uppercase tracking-wider mb-4">
        Highlights
      </h3>
      <div className="space-y-1">
        {highlights.map((highlight, index) => (
          <HighlightItem key={`${highlight.highlight_type}-${highlight.partner_slug}-${index}`} {...highlight} />
        ))}
      </div>
    </div>
  )
}

function HighlightItem({ highlight_type, partner_name, partner_slug, value, highlight_at }) {
  const config = getHighlightConfig(highlight_type, partner_name || partner_slug, value)

  return (
    <div className="flex items-start gap-3 py-3 border-b border-sub/10 last:border-0">
      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center',
          config.bgColor
        )}
      >
        <config.icon className={cn('w-4 h-4', config.iconColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text">
          <span className="font-medium">{config.title}</span>
        </p>
        <p className="text-xs text-sub mt-0.5">{config.description}</p>
      </div>

      {/* Timestamp */}
      <div className="flex-shrink-0 text-xs text-sub">
        {formatRelativeTime(highlight_at)}
      </div>
    </div>
  )
}

function getHighlightConfig(type, partnerName, value) {
  switch (type) {
    case 'new_partner':
      return {
        icon: UserPlusIcon,
        bgColor: 'bg-success/20',
        iconColor: 'text-success',
        title: `${partnerName} joined LA.IO`,
        description: 'New partner created a badge',
      }

    case 'milestone':
      return {
        icon: TrophyIcon,
        bgColor: 'bg-warning/20',
        iconColor: 'text-warning',
        title: `${partnerName} hit ${formatMilestone(value)} impressions`,
        description: 'Milestone achievement unlocked',
      }

    case 'new_domain':
      return {
        icon: GlobeIcon,
        bgColor: 'bg-accent/20',
        iconColor: 'text-accent',
        title: `${partnerName} badge spotted`,
        description: `Now live on ${value}`,
      }

    case 'top_weekly':
      return {
        icon: StarIcon,
        bgColor: 'bg-[#E83F8F]/20',
        iconColor: 'text-[#E83F8F]',
        title: `${partnerName} is this week's top performer`,
        description: `${formatNumber(value)} impressions this week`,
      }

    default:
      return {
        icon: SparkleIcon,
        bgColor: 'bg-sub/20',
        iconColor: 'text-sub',
        title: partnerName,
        description: value || 'Activity recorded',
      }
  }
}

function formatMilestone(value) {
  const num = parseInt(value, 10)
  if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return num.toLocaleString()
}

function formatNumber(value) {
  const num = parseInt(value, 10)
  if (isNaN(num)) return value
  return num.toLocaleString()
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return '-'

  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffSecs < 60) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Icons
function UserPlusIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  )
}

function TrophyIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
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

function StarIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  )
}

function SparkleIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}

export default HighlightsFeed
