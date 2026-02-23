import { useState, useEffect } from 'react'
import { getAdminSession } from '@/lib/supabase'
import { AdminLogin } from './AdminLogin'

/**
 * Protected Route Component
 * Wraps admin pages with simple password authentication
 */
export function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const existingSession = getAdminSession()
    setSession(existingSession)
    setLoading(false)
  }, [])

  const handleLoginSuccess = (user) => {
    setSession({ email: user.email, timestamp: Date.now() })
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sub text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Not logged in - show login
  if (!session) {
    return <AdminLogin onSuccess={handleLoginSuccess} />
  }

  // Authorized - render children
  return children
}

export default ProtectedRoute
