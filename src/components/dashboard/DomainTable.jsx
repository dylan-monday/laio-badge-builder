/**
 * DomainTable Component
 * Shows domains displaying the badge with impression/click stats
 */
export function DomainTable({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-card rounded-xl p-4 sm:p-6">
        <div className="h-4 w-32 bg-sub/20 rounded mb-4 animate-pulse" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-sub/10 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const domains = data || []

  if (domains.length === 0) {
    return (
      <div className="bg-card rounded-xl p-4 sm:p-6">
        <h3 className="text-sm font-medium text-sub uppercase tracking-wider mb-4">
          Domain Breakdown
        </h3>
        <div className="py-8 text-center text-sub">
          No domain data available yet
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-4 sm:p-6">
      <h3 className="text-sm font-medium text-sub uppercase tracking-wider mb-4">
        Domain Breakdown
      </h3>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="text-left text-xs text-sub uppercase tracking-wider border-b border-sub/10">
              <th className="pb-3 px-4 sm:px-0 font-medium">Domain</th>
              <th className="pb-3 px-2 font-medium text-right">Impressions</th>
              <th className="pb-3 px-2 font-medium text-right">Clicks</th>
              <th className="pb-3 px-4 sm:px-0 font-medium text-right">Last Seen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sub/10">
            {domains.map((row, i) => (
              <DomainRow key={row.domain || i} {...row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DomainRow({ domain, impressions, clicks, last_seen }) {
  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : '0'

  return (
    <tr className="text-sm hover:bg-sub/5 transition-colors">
      <td className="py-3 px-4 sm:px-0">
        <div className="flex items-center gap-2">
          <DomainIcon domain={domain} />
          <span className="text-text truncate max-w-[200px]">{domain}</span>
        </div>
      </td>
      <td className="py-3 px-2 text-right">
        <span className="text-text font-medium">{Number(impressions).toLocaleString()}</span>
      </td>
      <td className="py-3 px-2 text-right">
        <div className="flex items-center justify-end gap-2">
          <span className="text-text font-medium">{Number(clicks).toLocaleString()}</span>
          <span className="text-xs text-sub">({ctr}%)</span>
        </div>
      </td>
      <td className="py-3 px-4 sm:px-0 text-right">
        <span className="text-sub">{formatRelativeTime(last_seen)}</span>
      </td>
    </tr>
  )
}

function DomainIcon({ domain }) {
  // Use Google favicon service for domain icons
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`

  return (
    <img
      src={faviconUrl}
      alt=""
      className="w-4 h-4 rounded flex-shrink-0"
      onError={(e) => {
        // Hide image on error
        e.target.style.display = 'none'
      }}
    />
  )
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return '-'

  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default DomainTable
