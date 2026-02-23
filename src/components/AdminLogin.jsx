import { useState } from 'react'
import { Link } from 'react-router-dom'
import { verifyAdminPassword } from '@/lib/supabase'

/**
 * Admin Login Component
 * Simple email/password login for admin dashboard access
 */
export function AdminLogin({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { success, error: authError } = await verifyAdminPassword(email, password)

    if (!success) {
      setError(authError || 'Invalid credentials')
      setLoading(false)
      return
    }

    onSuccess?.({ email })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-card rounded-2xl p-6 shadow-xl">
          {/* Header */}
          <div className="text-center mb-6">
            <img src="/laio-logo.svg" alt="LA.IO" className="h-6 w-auto mx-auto mb-3" />
            <h1 className="text-xl font-semibold text-text">Admin Login</h1>
            <p className="text-sm text-sub mt-1">Sign in to access the dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-sub uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@la.io"
                required
                className="w-full px-3 py-2.5 bg-bg border border-sub/20 rounded-lg text-sm text-text placeholder:text-sub/50 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-sub uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full px-3 py-2.5 bg-bg border border-sub/20 rounded-lg text-sm text-text placeholder:text-sub/50 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {error && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium bg-accent text-bg hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-sub hover:text-accent transition-colors">
              Back to Badge Builder
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
