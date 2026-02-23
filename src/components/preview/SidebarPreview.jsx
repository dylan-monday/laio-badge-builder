/**
 * Sidebar Preview
 * Shows the badge in a mock sidebar widget context
 */
export function SidebarPreview({ BadgeComponent, badgeProps, contrastStyle = '' }) {
  return (
    <div className="w-full max-w-[200px] sm:max-w-[240px]">
      {/* Sidebar card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Card header */}
        <div className="px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-800">Partners</h4>
        </div>

        {/* Card content */}
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Some placeholder content */}
          <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed">
            We&apos;re proud to be part of the Louisiana Innovation ecosystem.
          </p>

          {/* Badge placement - prominent */}
          <div className={`flex justify-center py-2 ${contrastStyle}`}>
            <BadgeComponent {...badgeProps} size="s" />
          </div>

          {/* Placeholder link */}
          <p className="text-[10px] sm:text-xs text-blue-600 hover:underline text-center">
            Learn more →
          </p>
        </div>
      </div>
    </div>
  )
}

export default SidebarPreview
