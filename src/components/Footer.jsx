import { Link } from 'react-router-dom'

/**
 * Persistent Footer Component
 * Appears on all routes with branding and contact info
 */
export function Footer() {
  return (
    <footer className="bg-card border-t border-sub/10 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
        <p className="text-accent text-lg sm:text-xl italic font-medium">
          The Future Flows Through Louisiana
        </p>
        <p className="text-sub text-xs sm:text-sm">
          &copy; 2026 Louisiana Economic Development. All Rights Reserved.
        </p>
        <p className="text-sub text-xs sm:text-sm">
          Need help? Email{' '}
          <a
            href="mailto:info@la.io"
            className="text-accent hover:text-accent/80 transition-colors"
          >
            info@la.io
          </a>
          <span className="mx-2">|</span>
          <Link
            to="/dashboard"
            className="text-sub/60 hover:text-sub transition-colors"
          >
            Admin
          </Link>
        </p>
      </div>
    </footer>
  )
}

export default Footer
