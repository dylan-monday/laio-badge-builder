import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'
import { getPartnerDetail } from '@/lib/supabase'

/**
 * PartnerLeaderboard Component
 * Shows all partners sorted by impressions with expandable detail rows
 */
export function PartnerLeaderboard({ data, loading, timeRange }) {
  const [expandedSlug, setExpandedSlug] = useState(null)
  const [partnerDetail, setPartnerDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const handleRowClick = async (slug) => {
    if (expandedSlug === slug) {
      setExpandedSlug(null)
      setPartnerDetail(null)
      return
    }

    setExpandedSlug(slug)
    setDetailLoading(true)

    const { data: detail } = await getPartnerDetail(slug, timeRange)
    setPartnerDetail(detail)
    setDetailLoading(false)
  }

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-4 sm:p-6">
        <div className="h-4 w-40 bg-sub/20 rounded mb-4 animate-pulse" />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 bg-sub/10 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const partners = data || []

  if (partners.length === 0) {
    return (
      <div className="bg-card rounded-xl p-4 sm:p-6">
        <h3 className="text-sm font-medium text-sub uppercase tracking-wider mb-4">
          Partner Leaderboard
        </h3>
        <div className="py-12 text-center text-sub">
          No partner data available yet
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-4 sm:p-6">
      <h3 className="text-sm font-medium text-sub uppercase tracking-wider mb-4">
        Partner Leaderboard
      </h3>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="text-left text-xs text-sub uppercase tracking-wider border-b border-sub/10">
              <th className="pb-3 px-4 sm:px-2 font-medium">Partner</th>
              <th className="pb-3 px-2 font-medium text-right">Impressions</th>
              <th className="pb-3 px-2 font-medium text-right">Clicks</th>
              <th className="pb-3 px-2 font-medium text-right">CTR</th>
              <th className="pb-3 px-2 font-medium text-right">Domains</th>
              <th className="pb-3 px-4 sm:px-2 font-medium text-right">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner, index) => (
              <PartnerRow
                key={partner.partner_slug}
                partner={partner}
                rank={index + 1}
                isExpanded={expandedSlug === partner.partner_slug}
                onClick={() => handleRowClick(partner.partner_slug)}
                detail={expandedSlug === partner.partner_slug ? partnerDetail : null}
                detailLoading={expandedSlug === partner.partner_slug && detailLoading}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PartnerRow({ partner, rank, isExpanded, onClick, detail, detailLoading }) {
  const ctr = partner.impressions > 0
    ? ((Number(partner.clicks) / Number(partner.impressions)) * 100).toFixed(2)
    : '0.00'

  return (
    <>
      <tr
        onClick={onClick}
        className={cn(
          'text-sm cursor-pointer transition-colors',
          isExpanded ? 'bg-accent/10' : 'hover:bg-sub/5'
        )}
      >
        <td className="py-3 px-4 sm:px-2">
          <div className="flex items-center gap-3">
            <span className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
              rank <= 3 ? 'bg-accent text-bg' : 'bg-sub/20 text-sub'
            )}>
              {rank}
            </span>
            <div>
              <span className="text-text font-medium">{partner.display_name}</span>
              <span className="text-sub text-xs ml-2 font-mono">{partner.partner_slug}</span>
            </div>
          </div>
        </td>
        <td className="py-3 px-2 text-right">
          <span className="text-text font-medium">{Number(partner.impressions).toLocaleString()}</span>
        </td>
        <td className="py-3 px-2 text-right">
          <span className="text-text font-medium">{Number(partner.clicks).toLocaleString()}</span>
        </td>
        <td className="py-3 px-2 text-right">
          <span className="text-sub">{ctr}%</span>
        </td>
        <td className="py-3 px-2 text-right">
          <span className="text-sub">{Number(partner.unique_domains).toLocaleString()}</span>
        </td>
        <td className="py-3 px-4 sm:px-2 text-right">
          <span className="text-sub">{formatRelativeTime(partner.last_activity)}</span>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="p-0">
            <PartnerDetail detail={detail} loading={detailLoading} />
          </td>
        </tr>
      )}
    </>
  )
}

function PartnerDetail({ detail, loading }) {
  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-bg/50 border-t border-sub/10">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-48 bg-sub/10 rounded-lg animate-pulse" />
          <div className="h-48 bg-sub/10 rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="p-4 sm:p-6 bg-bg/50 border-t border-sub/10 text-center text-sub">
        No detail data available
      </div>
    )
  }

  const chartData = detail.daily_stats || []
  const domains = detail.domains || []

  return (
    <div className="p-4 sm:p-6 bg-bg/50 border-t border-sub/10">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Mini chart */}
        <div>
          <h4 className="text-xs font-medium text-sub uppercase tracking-wider mb-3">
            Activity Over Time
          </h4>
          {chartData.length > 0 ? (
            <MiniChart data={chartData} />
          ) : (
            <div className="h-32 flex items-center justify-center text-sub text-sm">
              No chart data
            </div>
          )}
        </div>

        {/* Domain breakdown */}
        <div>
          <h4 className="text-xs font-medium text-sub uppercase tracking-wider mb-3">
            Top Domains
          </h4>
          {domains.length > 0 ? (
            <div className="space-y-2">
              {domains.slice(0, 5).map((d) => (
                <div key={d.domain} className="flex items-center justify-between text-sm">
                  <span className="text-text truncate max-w-[200px]">{d.domain}</span>
                  <span className="text-sub">{Number(d.impressions).toLocaleString()} imp</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sub text-sm">No domain data</div>
          )}
        </div>
      </div>
    </div>
  )
}

function MiniChart({ data }) {
  // Format data for Recharts
  const chartData = data.slice(-14).map((item) => ({
    date: formatShortDate(item.day || item.period_start),
    impressions: Number(item.impressions) || 0,
    clicks: Number(item.clicks) || 0,
  }))

  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="miniImpressionsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00BAFF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00BAFF" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="miniClicksGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E83F8F" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#E83F8F" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis hide />
          <Tooltip content={<MiniTooltip />} />
          <Area
            type="monotone"
            dataKey="impressions"
            stroke="#00BAFF"
            strokeWidth={1.5}
            fill="url(#miniImpressionsGradient)"
            dot={false}
            activeDot={{ r: 3, fill: '#00BAFF', strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="#E83F8F"
            strokeWidth={1.5}
            fill="url(#miniClicksGradient)"
            dot={false}
            activeDot={{ r: 3, fill: '#E83F8F', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function MiniTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-bg border border-sub/20 rounded-lg p-2 shadow-lg text-xs">
      <p className="text-text font-medium mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sub capitalize">{entry.name}:</span>
          <span className="text-text font-medium">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

function formatShortDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

export default PartnerLeaderboard
