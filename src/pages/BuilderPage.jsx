import { useState, useEffect, useCallback, useRef } from 'react'
import { ExportModal } from '@/components/builder/ExportModal'
import { PreviewPanel } from '@/components/builder/PreviewPanel'
import { getBadgeComponent } from '@/components/badges'
import { FooterPreview } from '@/components/preview/FooterPreview'
import { SidebarPreview } from '@/components/preview/SidebarPreview'
import { SignaturePreview } from '@/components/preview/SignaturePreview'
import { nameToSlug, DEFAULT_CONFIG, PRESET_COLORS, validateColor, getSizePixels, COLOR_FAMILIES, getPillSchemeColors, DEFAULT_PILL_CONFIG } from '@/lib/validation'
import { upsertPartner } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const MOBILE_PREVIEW_MODES = [
  { value: 'badge', label: 'Badge' },
  { value: 'footer', label: 'Footer' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'signature', label: 'Signature' },
]

const LAYOUT_OPTIONS = [
  { value: 'standard', label: 'Standard', description: 'Full horizontal badge with LA.IO branding' },
  { value: 'pill', label: 'Pill', description: 'Compact pill with LA.IO branding' },
  { value: 'horizontal', label: 'Horizontal', description: 'Full wordmark logo layout' },
]

const SIZE_OPTIONS = [
  { value: 's', label: 'Small', pixels: getSizePixels('s'), description: 'Sidebars & footers' },
  { value: 'm', label: 'Medium', pixels: getSizePixels('m'), description: 'Recommended' },
  { value: 'l', label: 'Large', pixels: getSizePixels('l'), description: 'Hero sections' },
]

/**
 * Builder Page - Continuous Single-Page Flow
 * All steps visible as a progressive form that reveals sections as you go
 * Preview panel always visible alongside
 */
// Accent cyan for preview before user selects a color
const PREVIEW_DEFAULT_COLOR = '#00BAFF'

// Check if a color is too dark (close to the card background #11131a)
function isColorTooDark(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance < 0.15
}

export default function BuilderPage() {
  const [showExportModal, setShowExportModal] = useState(false)
  const [mobilePreviewMode, setMobilePreviewMode] = useState('badge')
  const [config, setConfig] = useState({
    name: '',
    slug: '',
    color: DEFAULT_CONFIG.color,
    size: DEFAULT_CONFIG.size,
    layout: DEFAULT_CONFIG.layout,
  })
  const [hasSelectedColor, setHasSelectedColor] = useState(false)
  const [customHex, setCustomHex] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  // Pill-specific color scheme state
  const [pillConfig, setPillConfig] = useState(DEFAULT_PILL_CONFIG)

  // Refs for scrolling to sections
  const layoutRef = useRef(null)
  const colorRef = useRef(null)
  const sizeRef = useRef(null)

  // Derived state: which sections are unlocked
  const hasName = config.name.trim().length >= 2
  const hasLayout = hasName // Layout unlocks after name
  const hasColor = hasLayout // Color unlocks after layout
  const hasSize = hasColor // Size unlocks after color
  const canExport = hasName && hasLayout && hasColor && hasSize

  // Update slug when name changes
  const handleNameChange = useCallback((name) => {
    setConfig((prev) => ({
      ...prev,
      name,
      slug: nameToSlug(name),
    }))
  }, [])

  const handleLayoutChange = useCallback((layout) => {
    setConfig((prev) => ({ ...prev, layout }))
  }, [])

  const handleColorChange = useCallback((color) => {
    setShowCustomInput(false)
    setCustomHex('')
    setHasSelectedColor(true)
    setConfig((prev) => ({ ...prev, color }))
  }, [])

  const handleCustomHexChange = (value) => {
    let hex = value.trim()
    if (!hex.startsWith('#') && hex.length > 0) {
      hex = '#' + hex
    }
    setCustomHex(hex)
    const validation = validateColor(hex)
    if (validation.valid) {
      setHasSelectedColor(true)
      setConfig((prev) => ({ ...prev, color: validation.value }))
    }
  }

  const handleSizeChange = useCallback((size) => {
    setConfig((prev) => ({ ...prev, size }))
  }, [])

  // Pill scheme handlers
  const handlePillFamilyChange = useCallback((family) => {
    setPillConfig((prev) => ({ ...prev, family }))
    setHasSelectedColor(true)
  }, [])

  const handlePillSchemeChange = useCallback((scheme) => {
    setPillConfig((prev) => ({ ...prev, scheme }))
    setHasSelectedColor(true)
  }, [])

  const handlePillReversedChange = useCallback((reversed) => {
    setPillConfig((prev) => ({ ...prev, reversed }))
    setHasSelectedColor(true)
  }, [])

  // Scroll to next section
  const scrollToLayout = () => layoutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const scrollToColor = () => colorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const scrollToSize = () => sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showExportModal) {
        setShowExportModal(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showExportModal])

  // Register partner when embed code is copied
  const handleEmbedCopied = async () => {
    if (config.slug && config.name) {
      await upsertPartner({
        slug: config.slug,
        displayName: config.name,
        badgeConfig: {
          color: config.color,
          size: config.size,
          layout: config.layout,
        },
      })
    }
  }

  const BadgeComponent = getBadgeComponent(config.layout)
  const isPresetSelected = (hex) => config.color.toUpperCase() === hex.toUpperCase()
  const isDarkColor = (hex) => ['#231F20', '#101948', '#172708', '#01233C', '#302511'].includes(hex.toUpperCase())

  // Get Pill badge colors from scheme
  const pillColors = getPillSchemeColors(pillConfig.family, pillConfig.scheme, pillConfig.reversed)

  // Use accent cyan for preview until user explicitly selects a color
  const previewColor = hasSelectedColor ? config.color : PREVIEW_DEFAULT_COLOR
  // Check if badge needs contrast help on dark background
  const needsContrastHelp = config.layout === 'pill'
    ? isColorTooDark(pillColors.bg)
    : isColorTooDark(previewColor)

  // Badge props vary by layout
  const getBadgeProps = () => {
    const baseProps = { slug: config.slug || 'your-badge', size: config.size }
    if (config.layout === 'pill') {
      return { ...baseProps, bgColor: pillColors.bg, fgColor: pillColors.fg }
    }
    return { ...baseProps, color: previewColor }
  }
  const badgeProps = getBadgeProps()

  return (
    <div className="bg-bg">
      {/* Mobile: Combined sticky header + preview */}
      <div className="lg:hidden sticky top-0 z-40 bg-bg shadow-[0_4px_20px_rgba(0,0,0,0.7)]">
        {/* Header */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/laio-logo.svg" alt="LA.IO" className="h-4 w-auto" />
              <div className="border-l border-sub/20 pl-2">
                <p className="text-[9px] text-sub">Badge Builder</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {['Name', 'Layout', 'Color', 'Size'].map((label, i) => {
                const isComplete = i === 0 ? hasName : i === 1 ? hasLayout : i === 2 ? hasColor : hasSize
                return (
                  <div
                    key={label}
                    className={cn(
                      'w-1.5 h-1.5 rounded-full transition-colors',
                      isComplete ? 'bg-accent' : 'bg-card'
                    )}
                    title={label}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="px-3 pb-3">
          <div className="flex items-center justify-center gap-1 mb-2">
            {MOBILE_PREVIEW_MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                onClick={() => setMobilePreviewMode(mode.value)}
                className={cn(
                  'px-2 py-1 text-[10px] font-medium rounded-md transition-colors',
                  mobilePreviewMode === mode.value
                    ? 'bg-accent text-bg'
                    : 'bg-card text-sub hover:text-text'
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <div className="bg-card rounded-xl overflow-hidden">
            <div className="px-2 py-1 border-b border-sub/10">
              <span className="text-[9px] text-sub uppercase tracking-wider">{config.layout} layout</span>
            </div>
            <div className={cn(
              'flex items-center justify-center p-4 min-h-[120px]',
              needsContrastHelp && 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'
            )}>
              {mobilePreviewMode === 'badge' && (
                <BadgeComponent {...badgeProps} />
              )}
              {mobilePreviewMode === 'footer' && (
                <div className="w-full max-w-xs transform scale-[0.85] origin-center">
                  <FooterPreview
                    BadgeComponent={BadgeComponent}
                    badgeProps={badgeProps}
                    contrastStyle={needsContrastHelp ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}
                  />
                </div>
              )}
              {mobilePreviewMode === 'sidebar' && (
                <div className="transform scale-[0.85] origin-center">
                  <SidebarPreview
                    BadgeComponent={BadgeComponent}
                    badgeProps={badgeProps}
                    contrastStyle={needsContrastHelp ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}
                  />
                </div>
              )}
              {mobilePreviewMode === 'signature' && (
                <div className="w-full max-w-xs transform scale-[0.85] origin-center">
                  <SignaturePreview
                    BadgeComponent={BadgeComponent}
                    badgeProps={badgeProps}
                    contrastStyle={needsContrastHelp ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Separate header */}
      <header className="hidden lg:block sticky top-0 bg-bg z-40 border-b border-sub/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/laio-logo.svg" alt="LA.IO" className="h-5 w-auto" />
              <div className="border-l border-sub/20 pl-2">
                <p className="text-[10px] text-sub">Badge Builder</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {['Name', 'Layout', 'Color', 'Size'].map((label, i) => {
                const isComplete = i === 0 ? hasName : i === 1 ? hasLayout : i === 2 ? hasColor : hasSize
                return (
                  <div
                    key={label}
                    className={cn(
                      'w-2 h-2 rounded-full transition-colors',
                      isComplete ? 'bg-accent' : 'bg-card'
                    )}
                    title={label}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-10">
        <div className="grid lg:grid-cols-5 gap-4 lg:gap-10">
          {/* Form column - continuous flow */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">

            {/* === STEP 1: NAME === */}
            <section>
              <div className="space-y-3">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold mb-0.5">Name your badge</h2>
                  <p className="text-xs text-sub">Enter your company or organization name.</p>
                </div>

                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Acme Corporation"
                  maxLength={50}
                  className="w-full px-3 py-2.5 bg-card border border-sub/20 rounded-lg text-sm text-text placeholder:text-sub/50 focus:outline-none focus:border-accent transition-colors"
                  autoFocus
                />

                {config.slug && (
                  <p className="text-[10px] sm:text-xs text-sub">
                    Badge ID: <span className="font-mono text-accent">{config.slug}</span>
                  </p>
                )}

                {hasName && (
                  <button
                    onClick={scrollToLayout}
                    className="w-full py-2.5 rounded-lg text-sm font-medium bg-accent text-bg hover:bg-accent/90 transition-colors"
                  >
                    Continue to Layout
                  </button>
                )}
              </div>
            </section>

            {/* === STEP 2: LAYOUT === */}
            <section
              ref={layoutRef}
              className={cn(
                'transition-all duration-300 scroll-mt-64 lg:scroll-mt-20',
                hasLayout ? 'opacity-100' : 'opacity-30 pointer-events-none'
              )}
            >
              <div className="space-y-3">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold mb-0.5">Choose a layout</h2>
                  <p className="text-xs text-sub">Select the badge style that fits your site.</p>
                </div>

                <div className="space-y-1.5">
                  {LAYOUT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleLayoutChange(option.value)}
                      className={cn(
                        'w-full p-2.5 rounded-lg border-2 text-left transition-all',
                        config.layout === option.value
                          ? 'border-accent bg-accent/5'
                          : 'border-card bg-card hover:border-accent/30'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                            config.layout === option.value ? 'border-accent bg-accent' : 'border-sub/50'
                          )}
                        >
                          {config.layout === option.value && (
                            <div className="w-1 h-1 rounded-full bg-bg" />
                          )}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-text">{option.label}</span>
                          <p className="text-[10px] sm:text-xs text-sub">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {hasLayout && (
                  <button
                    onClick={scrollToColor}
                    className="w-full py-2.5 rounded-lg text-sm font-medium bg-accent text-bg hover:bg-accent/90 transition-colors"
                  >
                    Continue to Color
                  </button>
                )}
              </div>
            </section>

            {/* === STEP 3: COLOR === */}
            <section
              ref={colorRef}
              className={cn(
                'transition-all duration-300 scroll-mt-64 lg:scroll-mt-20',
                hasColor ? 'opacity-100' : 'opacity-30 pointer-events-none'
              )}
            >
              <div className="space-y-3">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold mb-0.5">
                    {config.layout === 'pill' ? 'Choose color scheme' : 'Pick your color'}
                  </h2>
                  <p className="text-xs text-sub">
                    {config.layout === 'pill'
                      ? 'Select a color family and scheme for your pill badge.'
                      : 'Select a color that matches your brand.'}
                  </p>
                </div>

                {config.layout === 'pill' ? (
                  /* Pill scheme picker */
                  <div className="space-y-4">
                    {/* Color family selector */}
                    <div>
                      <p className="text-[10px] font-medium text-sub uppercase tracking-wider mb-2">Color Family</p>
                      <div className="grid grid-cols-5 gap-1.5">
                        {COLOR_FAMILIES.map((fam) => {
                          const isSelected = pillConfig.family === fam.name
                          const displayColor = pillConfig.scheme === 'electric-dark' ? fam.electric : fam.easy
                          return (
                            <button
                              key={fam.name}
                              onClick={() => handlePillFamilyChange(fam.name)}
                              className={cn(
                                'relative rounded-lg overflow-hidden transition-all hover:scale-105 h-14',
                                isSelected && 'ring-2 ring-accent ring-offset-2 ring-offset-bg scale-105'
                              )}
                              title={fam.name}
                            >
                              <div className="absolute inset-0 flex flex-col">
                                <div className="flex-1" style={{ backgroundColor: fam.dark }} />
                                <div className="flex-1" style={{ backgroundColor: displayColor }} />
                              </div>
                              {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                      <p className="text-[10px] text-sub mt-1">{pillConfig.family}</p>
                    </div>

                    {/* Scheme toggle */}
                    <div>
                      <p className="text-[10px] font-medium text-sub uppercase tracking-wider mb-2">Scheme</p>
                      <div className="flex gap-2">
                        {[
                          { value: 'easy-dark', label: 'Easy + Dark' },
                          { value: 'electric-dark', label: 'Electric + Dark' },
                        ].map((scheme) => (
                          <button
                            key={scheme.value}
                            onClick={() => handlePillSchemeChange(scheme.value)}
                            className={cn(
                              'flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all',
                              pillConfig.scheme === scheme.value
                                ? 'bg-accent text-bg'
                                : 'bg-card text-sub hover:text-text'
                            )}
                          >
                            {scheme.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reverse toggle */}
                    <div>
                      <button
                        onClick={() => handlePillReversedChange(!pillConfig.reversed)}
                        className={cn(
                          'flex items-center gap-2 py-2 px-3 rounded-lg text-xs transition-all w-full',
                          pillConfig.reversed
                            ? 'bg-accent/10 text-accent'
                            : 'bg-card text-sub hover:text-text'
                        )}
                      >
                        <div
                          className={cn(
                            'w-8 h-4 rounded-full transition-colors relative',
                            pillConfig.reversed ? 'bg-accent' : 'bg-sub/30'
                          )}
                        >
                          <div
                            className={cn(
                              'absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform',
                              pillConfig.reversed ? 'translate-x-4' : 'translate-x-0.5'
                            )}
                          />
                        </div>
                        <span>Reverse colors (light background)</span>
                      </button>
                    </div>

                    {/* Current selection preview */}
                    <div className="flex items-center gap-3 p-2.5 bg-card rounded-lg">
                      <div className="flex rounded-md overflow-hidden">
                        <div className="w-6 h-6" style={{ backgroundColor: pillColors.bg }} />
                        <div className="w-6 h-6" style={{ backgroundColor: pillColors.fg }} />
                      </div>
                      <div>
                        <p className="text-[10px] text-sub">Selected</p>
                        <p className="font-mono text-xs">{pillColors.bg} + {pillColors.fg}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard/Horizontal color picker */
                  <>
                    {/* Color swatches */}
                    <div className="space-y-2.5">
                      <div>
                        <p className="text-[10px] font-medium text-sub uppercase tracking-wider mb-1.5">Dark</p>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_COLORS.dark.map((c) => (
                            <button
                              key={c.hex}
                              onClick={() => handleColorChange(c.hex)}
                              className={cn(
                                'w-9 h-9 rounded-lg transition-all hover:scale-105',
                                isPresetSelected(c.hex) && 'ring-2 ring-accent ring-offset-2 ring-offset-bg scale-105'
                              )}
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            >
                              {isPresetSelected(c.hex) && (
                                <svg className="w-3.5 h-3.5 mx-auto" fill="none" stroke={isDarkColor(c.hex) ? 'white' : 'black'} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-sub uppercase tracking-wider mb-1.5">Easy</p>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_COLORS.easy.map((c) => (
                            <button
                              key={c.hex}
                              onClick={() => handleColorChange(c.hex)}
                              className={cn(
                                'w-9 h-9 rounded-lg transition-all hover:scale-105',
                                isPresetSelected(c.hex) && 'ring-2 ring-accent ring-offset-2 ring-offset-bg scale-105'
                              )}
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            >
                              {isPresetSelected(c.hex) && (
                                <svg className="w-3.5 h-3.5 mx-auto" fill="none" stroke={isDarkColor(c.hex) ? 'white' : 'black'} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-sub uppercase tracking-wider mb-1.5">Electric</p>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_COLORS.electric.map((c) => (
                            <button
                              key={c.hex}
                              onClick={() => handleColorChange(c.hex)}
                              className={cn(
                                'w-9 h-9 rounded-lg transition-all hover:scale-105',
                                isPresetSelected(c.hex) && 'ring-2 ring-accent ring-offset-2 ring-offset-bg scale-105'
                              )}
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            >
                              {isPresetSelected(c.hex) && (
                                <svg className="w-3.5 h-3.5 mx-auto" fill="none" stroke={isDarkColor(c.hex) ? 'white' : 'black'} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Custom hex */}
                    <div>
                      <button
                        onClick={() => setShowCustomInput(!showCustomInput)}
                        className="text-xs text-accent hover:text-accent/80 transition-colors"
                      >
                        + Custom hex color
                      </button>
                      {showCustomInput && (
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="text"
                            value={customHex}
                            onChange={(e) => handleCustomHexChange(e.target.value)}
                            placeholder="#RRGGBB"
                            maxLength={7}
                            className="flex-1 px-2.5 py-2 bg-card border border-sub/20 rounded-lg text-xs text-text placeholder:text-sub/50 focus:outline-none focus:border-accent"
                          />
                          <div
                            className="w-9 h-9 rounded-lg border border-sub/20"
                            style={{ backgroundColor: validateColor(customHex).valid ? customHex : '#11131a' }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Current selection */}
                    <div className="flex items-center gap-2 p-2.5 bg-card rounded-lg">
                      <div className="w-7 h-7 rounded-md" style={{ backgroundColor: config.color }} />
                      <div>
                        <p className="text-[10px] text-sub">Selected</p>
                        <p className="font-mono text-xs">{config.color.toUpperCase()}</p>
                      </div>
                    </div>
                  </>
                )}

                {hasColor && (
                  <button
                    onClick={scrollToSize}
                    className="w-full py-2.5 rounded-lg text-sm font-medium bg-accent text-bg hover:bg-accent/90 transition-colors"
                  >
                    Continue to Size
                  </button>
                )}
              </div>
            </section>

            {/* === STEP 4: SIZE === */}
            <section
              ref={sizeRef}
              className={cn(
                'transition-all duration-300 scroll-mt-64 lg:scroll-mt-20',
                hasSize ? 'opacity-100' : 'opacity-30 pointer-events-none'
              )}
            >
              <div className="space-y-3">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold mb-0.5">Select size</h2>
                  <p className="text-xs text-sub">Choose a size for your website.</p>
                </div>

                <div className="space-y-1.5">
                  {SIZE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSizeChange(option.value)}
                      className={cn(
                        'w-full p-2.5 rounded-lg border-2 text-left transition-all',
                        config.size === option.value
                          ? 'border-accent bg-accent/5'
                          : 'border-card bg-card hover:border-accent/30'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                              config.size === option.value ? 'border-accent bg-accent' : 'border-sub/50'
                            )}
                          >
                            {config.size === option.value && (
                              <div className="w-1 h-1 rounded-full bg-bg" />
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-text">{option.label}</span>
                            <span className="text-[10px] text-sub ml-1.5 font-mono">{option.pixels}px</span>
                            <p className="text-[10px] sm:text-xs text-sub">{option.description}</p>
                          </div>
                        </div>
                        <div
                          className="hidden sm:block h-4 rounded bg-accent/30"
                          style={{ width: `${option.pixels / 5}px` }}
                        />
                      </div>
                    </button>
                  ))}
                </div>

                {canExport && (
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="w-full py-3 rounded-lg font-semibold bg-success text-bg hover:bg-success/90 transition-colors text-sm sm:text-base"
                  >
                    Get Your Badge Code
                  </button>
                )}
              </div>
            </section>

          </div>

          {/* Preview column - desktop only */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="lg:sticky lg:top-16">
              <PreviewPanel
                name={config.name}
                slug={config.slug}
                color={config.layout === 'pill' ? pillColors.bg : previewColor}
                size={config.size}
                layout={config.layout}
                needsContrastHelp={needsContrastHelp}
                className="min-h-[400px]"
                badgeProps={badgeProps}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          slug={config.slug}
          color={config.layout === 'pill' ? pillColors.bg : config.color}
          size={config.size}
          layout={config.layout}
          bgColor={config.layout === 'pill' ? pillColors.bg : undefined}
          fgColor={config.layout === 'pill' ? pillColors.fg : undefined}
          onClose={() => setShowExportModal(false)}
          onCopied={handleEmbedCopied}
        />
      )}
    </div>
  )
}
