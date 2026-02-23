import { cn } from '@/lib/utils'

/**
 * ActivityFeed Component
 * Shows recent impression and click events
 */
export function ActivityFeed({ data, loading, showPartner = false }) {
  if (loading) {
    return (
      <div className="bg-card rounded-xl p-4 sm:p-6">
        <div className="h-4 w-32 bg-sub/20 rounded mb-4 animate-pulse" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-sub/10 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const events = data || []

  if (events.length === 0) {
    return (
      <div className="bg-card rounded-xl p-4 sm:p-6">
        <h3 className="text-sm font-medium text-sub uppercase tracking-wider mb-4">
          Recent Activity
        </h3>
        <div className="py-8 text-center text-sub">
          No recent activity
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-4 sm:p-6">
      <h3 className="text-sm font-medium text-sub uppercase tracking-wider mb-4">
        Recent Activity
      </h3>
      <div className="space-y-1">
        {events.map((event) => (
          <ActivityItem key={event.id} {...event} showPartner={showPartner} />
        ))}
      </div>
    </div>
  )
}

function ActivityItem({ event_type, domain, page_url, created_at, display_name, partner_slug, showPartner }) {
  const isClick = event_type === 'click'

  return (
    <div className="flex items-start gap-3 py-3 border-b border-sub/10 last:border-0">
      {/* Event type icon */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isClick ? 'bg-[#E83F8F]/20' : 'bg-accent/20'
        )}
      >
        {isClick ? (
          <CursorIcon className="w-4 h-4 text-[#E83F8F]" />
        ) : (
          <EyeIcon className="w-4 h-4 text-accent" />
        )}
      </div>

      {/* Event details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'text-sm font-medium',
              isClick ? 'text-[#E83F8F]' : 'text-accent'
            )}
          >
            {isClick ? 'Click' : 'Impression'}
          </span>
          {showPartner && (display_name || partner_slug) && (
            <>
              <span className="text-xs text-sub">by</span>
              <span className="text-sm text-text font-medium">{display_name || partner_slug}</span>
            </>
          )}
          <span className="text-xs text-sub">on</span>
          <span className="text-sm text-text truncate">{domain || 'Unknown'}</span>
        </div>
        {page_url && (
          <p className="text-xs text-sub truncate mt-0.5" title={page_url}>
            {truncateUrl(page_url)}
          </p>
        )}
      </div>

      {/* Timestamp */}
      <div className="flex-shrink-0 text-xs text-sub">
        {formatRelativeTime(created_at)}
      </div>
    </div>
  )
}

function truncateUrl(url) {
  try {
    const parsed = new URL(url)
    const path = parsed.pathname + parsed.search
    if (path.length > 50) {
      return path.slice(0, 47) + '...'
    }
    return path || '/'
  } catch {
    return url.slice(0, 50)
  }
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

export default ActivityFeed
