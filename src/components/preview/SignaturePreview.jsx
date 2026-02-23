/**
 * Signature Preview
 * Shows the badge in a mock email signature context
 */
export function SignaturePreview({ BadgeComponent, badgeProps, contrastStyle = '' }) {
  return (
    <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-4 sm:p-5">
      {/* Email signature layout */}
      <div className="space-y-3">
        {/* Divider line (like email separator) */}
        <div className="border-t-2 border-gray-300 pt-3">
          {/* Name and title */}
          <p className="text-sm sm:text-base font-semibold text-gray-900">Jane Smith</p>
          <p className="text-xs sm:text-sm text-gray-600">Director of Operations</p>
          <p className="text-xs sm:text-sm text-gray-600">Acme Corporation</p>
        </div>

        {/* Contact info */}
        <div className="text-[10px] sm:text-xs text-gray-500 space-y-0.5">
          <p>jane@acmecorp.com</p>
          <p>(555) 123-4567</p>
        </div>

        {/* Badge placement */}
        <div className={`pt-2 border-t border-gray-200 ${contrastStyle}`}>
          <BadgeComponent {...badgeProps} size="s" />
        </div>
      </div>
    </div>
  )
}

export default SignaturePreview
