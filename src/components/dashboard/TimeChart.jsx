import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

/**
 * TimeChart Component
 * Area chart showing impressions and clicks over time
 */
export function TimeChart({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-card rounded-xl p-4 sm:p-6">
        <div className="h-4 w-32 bg-sub/20 rounded mb-4 animate-pulse" />
        <div className="h-64 sm:h-80 bg-sub/10 rounded animate-pulse" />
      </div>
    )
  }

  // Format data for Recharts
  // Supports both old format (day) and new format (period, period_start)
  const chartData = (data || []).map((item) => ({
    date: item.period || formatDate(item.day || item.period_start),
    fullDate: item.period_start || item.day,
    impressions: Number(item.impressions) || 0,
    clicks: Number(item.clicks) || 0,
  }))

  const hasData = chartData.some((d) => d.impressions > 0 || d.clicks > 0)

  if (!hasData) {
    return (
      <div className="bg-card rounded-xl p-4 sm:p-6">
        <h3 className="text-sm font-medium text-sub uppercase tracking-wider mb-4">
          Activity Over Time
        </h3>
        <div className="h-64 sm:h-80 flex items-center justify-center text-sub">
          No activity data for this period
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-4 sm:p-6">
      <h3 className="text-sm font-medium text-sub uppercase tracking-wider mb-4">
        Activity Over Time
      </h3>
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00BAFF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00BAFF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E83F8F" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#E83F8F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatYAxis(value)}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 20 }}
              formatter={(value) => (
                <span className="text-sm text-sub capitalize">{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="impressions"
              stroke="#00BAFF"
              strokeWidth={2}
              fill="url(#impressionsGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#00BAFF', strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="clicks"
              stroke="#E83F8F"
              strokeWidth={2}
              fill="url(#clicksGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#E83F8F', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-bg border border-sub/20 rounded-lg p-3 shadow-lg">
      <p className="text-sm text-text font-medium mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sub capitalize">{entry.name}:</span>
          <span className="text-text font-medium">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatYAxis(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toString()
}

export default TimeChart
