import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Overview, TimeChart, HighlightsFeed, PartnerLeaderboard } from '@/components/dashboard'
import {
  getAdminStats,
  getPartnerLeaderboard,
  getAdminChartStats,
  getAdminHighlights,
  signOut,
} from '@/lib/supabase'
import { cn } from '@/lib/utils'

const TIME_RANGES = [
  { value: 7, label: '7d' },
  { value: 30, label: '30d' },
  { value: 90, label: '90d' },
  { value: 0, label: 'All' },
]

/**
 * Admin Dashboard Page
 * Shows analytics across ALL partners
 */
export default function DashboardPage() {
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState(30)
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [leaderboard, setLeaderboard] = useState(null)
  const [highlights, setHighlights] = useState(null)
  const [loading, setLoading] = useState(true)

  const handleSignOut = async () => {
    await signOut()
    navigate('/dashboard') // Redirect back to login
  }

  // Fetch dashboard data when time range changes
  const fetchDashboardData = useCallback(async () => {
    setLoading(true)

    const [statsRes, chartRes, leaderboardRes, highlightsRes] = await Promise.all([
      getAdminStats(timeRange),
      getAdminChartStats(timeRange),
      getPartnerLeaderboard(timeRange, 50),
      getAdminHighlights(20),
    ])

    setStats(statsRes.data)
    setChartData(chartRes.data)
    setLeaderboard(leaderboardRes.data)
    setHighlights(highlightsRes.data)
    setLoading(false)
  }, [timeRange])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Check if there's any data at all
  const hasData = stats?.current?.impressions > 0 || stats?.current?.clicks > 0

  return (
    <div className="bg-bg">
      {/* Header */}
      <header className="border-b border-sub/10 sticky top-0 bg-bg/95 backdrop-blur-sm z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="p-2 -ml-2 rounded-lg hover:bg-card transition-colors"
                title="Back to Builder"
              >
                <svg className="w-5 h-5 text-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-text">
                  LA.IO Badge Analytics
                </h1>
                <p className="text-xs sm:text-sm text-sub">Admin Dashboard</p>
              </div>
            </div>

            {/* Time range selector + Sign out */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-card rounded-lg p-1">
                {TIME_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setTimeRange(range.value)}
                    className={cn(
                      'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                      timeRange === range.value
                        ? 'bg-accent text-bg'
                        : 'text-sub hover:text-text'
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg hover:bg-card transition-colors text-sub hover:text-text"
                title="Sign out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!hasData && !loading ? (
          <EmptyState />
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Overview cards - admin mode shows Active Partners instead of CTR */}
            <Overview stats={stats} loading={loading} isAdmin={true} />

            {/* Time series chart */}
            <TimeChart data={chartData} loading={loading} />

            {/* Partner leaderboard */}
            <PartnerLeaderboard data={leaderboard} loading={loading} timeRange={timeRange} />

            {/* Highlights feed */}
            <HighlightsFeed data={highlights} loading={loading} />
          </div>
        )}
      </main>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-card flex items-center justify-center">
          <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">No Activity Yet</h2>
        <p className="text-sub max-w-md mx-auto mb-8">
          No badge activity has been recorded yet. Partners need to create badges and embed them on their websites.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg font-semibold rounded-lg hover:bg-accent/90 transition-colors"
        >
          Create a Badge
        </Link>
      </div>
    </div>
  )
}
