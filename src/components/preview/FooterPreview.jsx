/**
 * Footer Preview
 * Shows the badge in a mock website footer context
 */
export function FooterPreview({ BadgeComponent, badgeProps, contrastStyle = '' }) {
  return (
    <div className="w-full max-w-md bg-[#1a1a2e] rounded-lg overflow-hidden shadow-xl">
      {/* Mock page content hint */}
      <div className="h-8 bg-gradient-to-b from-sub/5 to-transparent" />

      {/* Footer */}
      <div className="px-4 py-5 sm:px-6 sm:py-6 border-t border-white/10">
        {/* Footer nav */}
        <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-5">
          <span className="text-xs sm:text-sm text-white/50">About</span>
          <span className="text-xs sm:text-sm text-white/50">Services</span>
          <span className="text-xs sm:text-sm text-white/50">Contact</span>
          <span className="text-xs sm:text-sm text-white/50">Privacy</span>
        </div>

        {/* Footer bottom row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-[10px] sm:text-xs text-white/30">
            © 2024 Company Name. All rights reserved.
          </p>

          {/* Badge placement */}
          <div className={`flex-shrink-0 ${contrastStyle}`}>
            <BadgeComponent {...badgeProps} size="s" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FooterPreview
