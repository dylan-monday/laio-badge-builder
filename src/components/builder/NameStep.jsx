import { cn } from '@/lib/utils'
import { validateSlug } from '@/lib/validation'

/**
 * Step 1: Organization Name Input
 * - Real-time validation
 * - Max 50 characters
 * - Compact on mobile
 */
export function NameStep({ name, onChange, onNext }) {
  const validation = validateSlug(name)
  const charCount = name.length
  const maxChars = 50

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validation.valid && onNext) {
      onNext()
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-1 sm:mb-2">What&apos;s your organization name?</h2>
        <p className="text-sm sm:text-base text-sub">
          This will appear on your LA.IO badge.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g., Monday and Partners"
            maxLength={maxChars}
            autoFocus
            className={cn(
              'w-full px-3 py-3 sm:px-4 sm:py-4 bg-card border-2 rounded-xl text-base sm:text-lg text-text placeholder:text-sub/50',
              'focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all',
              validation.error && name.length > 0
                ? 'border-error/50'
                : name.length > 0 && validation.valid
                ? 'border-success/50'
                : 'border-card hover:border-sub/30'
            )}
          />

          {/* Character count */}
          <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-sub">
            {charCount}/{maxChars}
          </div>
        </div>

        {/* Validation feedback */}
        {validation.error && name.length > 0 && (
          <p className="text-error text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {validation.error}
          </p>
        )}

        {/* Next button */}
        <button
          type="submit"
          disabled={!validation.valid}
          className={cn(
            'w-full py-3 sm:py-4 rounded-xl font-medium sm:font-semibold text-base sm:text-lg transition-all',
            validation.valid
              ? 'bg-accent text-bg hover:bg-accent/90 cursor-pointer'
              : 'bg-card text-sub cursor-not-allowed'
          )}
        >
          Continue
          <svg className="inline-block w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </form>
    </div>
  )
}

export default NameStep
