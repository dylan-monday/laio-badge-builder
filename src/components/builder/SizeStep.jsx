import { cn } from '@/lib/utils'
import { getSizePixels } from '@/lib/validation'
import { getBadgeComponent } from '@/components/badges'

/**
 * Step 4: Size Selection
 * - Inline preview on mobile (layout-aware)
 * - S/M/L radio buttons with pixel dimensions
 */

const SIZE_OPTIONS = [
  {
    value: 's',
    label: 'Small',
    pixels: getSizePixels('s'),
    description: 'Sidebars & footers',
  },
  {
    value: 'm',
    label: 'Medium',
    pixels: getSizePixels('m'),
    description: 'Recommended',
  },
  {
    value: 'l',
    label: 'Large',
    pixels: getSizePixels('l'),
    description: 'Hero sections',
  },
]

export function SizeStep({ size, slug, color, layout = 'standard', onChange, onNext, onBack }) {
  const BadgeComponent = getBadgeComponent(layout)

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Mobile inline preview */}
      <div className="lg:hidden flex items-center justify-center p-3 bg-card rounded-xl">
        <BadgeComponent slug={slug} color={color} size={size} />
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-1 sm:mb-2">Select badge size</h2>
        <p className="text-sm sm:text-base text-sub">
          Choose a size for your website.
        </p>
      </div>

      {/* Size options */}
      <div className="space-y-2 sm:space-y-3">
        {SIZE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'w-full p-3 sm:p-4 rounded-xl border-2 text-left transition-all',
              'hover:border-accent/50 active:scale-[0.99]',
              size === option.value
                ? 'border-accent bg-accent/5'
                : 'border-card bg-card hover:bg-card/80'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Radio indicator */}
                <div
                  className={cn(
                    'w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0',
                    size === option.value
                      ? 'border-accent bg-accent'
                      : 'border-sub/50'
                  )}
                >
                  {size === option.value && (
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-bg" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="font-medium sm:font-semibold text-sm sm:text-base text-text">{option.label}</span>
                    <span className="text-xs sm:text-sm text-sub font-mono">{option.pixels}px</span>
                  </div>
                  <p className="text-xs sm:text-sm text-sub">{option.description}</p>
                </div>
              </div>

              {/* Visual size indicator */}
              <div
                className="hidden sm:block h-5 sm:h-6 rounded bg-accent/30"
                style={{ width: `${option.pixels / 3.5}px` }}
              />
            </div>
          </button>
        ))}
      </div>

      {/* Keyboard hint - hidden on mobile */}
      <p className="hidden sm:block text-xs sm:text-sm text-sub text-center">
        Press <kbd className="px-1.5 py-0.5 bg-card rounded text-xs font-mono">1</kbd>{' '}
        <kbd className="px-1.5 py-0.5 bg-card rounded text-xs font-mono">2</kbd>{' '}
        <kbd className="px-1.5 py-0.5 bg-card rounded text-xs font-mono">3</kbd> to select
      </p>

      {/* Navigation buttons */}
      <div className="flex gap-2 sm:gap-3">
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
          Get Code
          <svg className="inline-block w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default SizeStep
