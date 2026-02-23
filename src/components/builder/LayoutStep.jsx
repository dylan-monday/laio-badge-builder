import { cn } from '@/lib/utils'
import { StandardBadge } from '@/components/badges/StandardBadge'
import { PillBadge } from '@/components/badges/PillBadge'
import { HorizontalBadge } from '@/components/badges/HorizontalBadge'

/**
 * Step 2: Layout Selection
 * Shows 3 clickable layout cards with preview thumbnails
 */

const LAYOUT_OPTIONS = [
  {
    value: 'standard',
    label: 'Standard',
    description: 'Classic horizontal badge with arrows',
    ratio: '4:1',
    Component: StandardBadge,
  },
  {
    value: 'pill',
    label: 'Pill',
    description: 'Compact pill with LA.IO branding',
    ratio: '5.5:1',
    Component: PillBadge,
  },
  {
    value: 'horizontal',
    label: 'Horizontal',
    description: 'Full wordmark logo layout',
    ratio: '6.8:1',
    Component: HorizontalBadge,
  },
]

export function LayoutStep({ layout, slug, color, onChange, onNext, onBack }) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-1 sm:mb-2">Choose a layout</h2>
        <p className="text-sm sm:text-base text-sub">
          Pick the badge style that fits your website.
        </p>
      </div>

      {/* Layout options */}
      <div className="space-y-3">
        {LAYOUT_OPTIONS.map((option) => {
          const BadgeComponent = option.Component
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'w-full p-3 sm:p-4 rounded-xl border-2 text-left transition-all',
                'hover:border-accent/50 active:scale-[0.99]',
                layout === option.value
                  ? 'border-accent bg-accent/5'
                  : 'border-card bg-card hover:bg-card/80'
              )}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Radio indicator */}
                <div
                  className={cn(
                    'w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0',
                    layout === option.value
                      ? 'border-accent bg-accent'
                      : 'border-sub/50'
                  )}
                >
                  {layout === option.value && (
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-bg" />
                  )}
                </div>

                {/* Badge preview thumbnail */}
                <div className="flex-shrink-0 flex items-center justify-center w-20 sm:w-24 h-12 sm:h-14 bg-bg/50 rounded-lg overflow-hidden">
                  <div className="transform scale-[0.35] sm:scale-[0.4] origin-center">
                    <BadgeComponent slug={slug || 'preview'} color={color} size="m" />
                  </div>
                </div>

                {/* Label and description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium sm:font-semibold text-sm sm:text-base text-text">
                      {option.label}
                    </span>
                    <span className="text-xs text-sub font-mono">{option.ratio}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-sub truncate">{option.description}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-2 sm:gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 sm:py-4 rounded-xl font-medium sm:font-semibold text-sm sm:text-base bg-card text-text hover:bg-card/80 transition-colors"
        >
          <svg className="inline-block w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-3 sm:py-4 rounded-xl font-medium sm:font-semibold text-sm sm:text-base bg-accent text-bg hover:bg-accent/90 transition-colors"
        >
          Color
          <svg className="inline-block w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default LayoutStep
