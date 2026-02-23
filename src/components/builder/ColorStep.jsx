import { useState } from 'react'
import { cn } from '@/lib/utils'
import { PRESET_COLORS, validateColor } from '@/lib/validation'
import { getBadgeComponent } from '@/components/badges'

/**
 * Step 3: Color Selection
 * - Inline badge preview on mobile (layout-aware)
 * - 15 preset colors organized by category
 * - Custom hex color input
 */
export function ColorStep({ color, slug, layout = 'standard', onChange, onNext, onBack }) {
  const BadgeComponent = getBadgeComponent(layout)
  const [customHex, setCustomHex] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleColorSelect = (hex) => {
    setShowCustomInput(false)
    setCustomHex('')
    onChange(hex)
  }

  const handleCustomHexChange = (value) => {
    let hex = value.trim()
    if (!hex.startsWith('#') && hex.length > 0) {
      hex = '#' + hex
    }
    setCustomHex(hex)

    const validation = validateColor(hex)
    if (validation.valid) {
      onChange(validation.value)
    }
  }

  const isPresetSelected = (hex) => color.toUpperCase() === hex.toUpperCase()
  const isDarkColor = (hex) => ['#000000', '#101948', '#172708', '#01233C', '#302511', '#231F20'].includes(hex.toUpperCase())

  const ColorSwatch = ({ hex, name }) => (
    <button
      type="button"
      onClick={() => handleColorSelect(hex)}
      className={cn(
        'group relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg transition-all duration-200',
        'hover:scale-105 hover:z-10 active:scale-95',
        isPresetSelected(hex)
          ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg scale-105 z-10'
          : 'hover:ring-2 hover:ring-white/20'
      )}
      style={{ backgroundColor: hex }}
      title={`${name} (${hex})`}
    >
      {isPresetSelected(hex) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke={isDarkColor(hex) ? 'white' : 'black'}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  )

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Mobile inline preview */}
      <div className="lg:hidden flex items-center justify-center p-3 bg-card rounded-xl">
        <BadgeComponent slug={slug} color={color} size="s" />
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-1 sm:mb-2">Choose your badge color</h2>
        <p className="text-sm sm:text-base text-sub">
          Select a color that matches your brand.
        </p>
      </div>

      {/* Color grid - all colors in a single responsive grid */}
      <div className="space-y-3 sm:space-y-4">
        {/* Dark colors */}
        <div className="space-y-1.5 sm:space-y-2">
          <h3 className="text-xs sm:text-sm font-medium text-sub uppercase tracking-wider">Dark</h3>
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {PRESET_COLORS.dark.map((c) => (
              <ColorSwatch key={c.hex} hex={c.hex} name={c.name} />
            ))}
          </div>
        </div>

        {/* Easy colors */}
        <div className="space-y-1.5 sm:space-y-2">
          <h3 className="text-xs sm:text-sm font-medium text-sub uppercase tracking-wider">Easy</h3>
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {PRESET_COLORS.easy.map((c) => (
              <ColorSwatch key={c.hex} hex={c.hex} name={c.name} />
            ))}
          </div>
        </div>

        {/* Electric colors */}
        <div className="space-y-1.5 sm:space-y-2">
          <h3 className="text-xs sm:text-sm font-medium text-sub uppercase tracking-wider">Electric</h3>
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {PRESET_COLORS.electric.map((c) => (
              <ColorSwatch key={c.hex} hex={c.hex} name={c.name} />
            ))}
          </div>
        </div>
      </div>

      {/* Custom color input */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="text-xs sm:text-sm text-accent hover:text-accent/80 transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Custom hex color
        </button>

        {showCustomInput && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customHex}
              onChange={(e) => handleCustomHexChange(e.target.value)}
              placeholder="#RRGGBB"
              maxLength={7}
              className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-card border border-sub/20 rounded-lg text-sm sm:text-base text-text placeholder:text-sub/50 focus:outline-none focus:border-accent transition-colors"
            />
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg border border-sub/20 flex-shrink-0"
              style={{ backgroundColor: validateColor(customHex).valid ? customHex : '#11131a' }}
            />
          </div>
        )}
      </div>

      {/* Current selection - compact */}
      <div className="flex items-center gap-2.5 p-3 sm:p-4 bg-card rounded-xl">
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-sub">Selected</p>
          <p className="font-mono text-sm sm:text-base text-text truncate">{color.toUpperCase()}</p>
        </div>
      </div>

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
          Size
          <svg className="inline-block w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ColorStep
