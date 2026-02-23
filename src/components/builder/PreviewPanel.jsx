import { useState } from 'react'
import { getBadgeComponent } from '@/components/badges'
import { FooterPreview } from '@/components/preview/FooterPreview'
import { SidebarPreview } from '@/components/preview/SidebarPreview'
import { SignaturePreview } from '@/components/preview/SignaturePreview'
import { cn } from '@/lib/utils'

const PREVIEW_MODES = [
  { value: 'badge', label: 'Badge' },
  { value: 'footer', label: 'Footer' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'signature', label: 'Signature' },
]

/**
 * Preview Panel
 * - Shows live badge preview with selected layout
 * - Toggle between badge-only and contextual views
 */
export function PreviewPanel({ name, slug, color, size, layout = 'standard', className, compact = false, needsContrastHelp = false, badgeProps: passedBadgeProps }) {
  const [previewMode, setPreviewMode] = useState('badge')
  const BadgeComponent = getBadgeComponent(layout)

  // Glow style for dark badges on dark backgrounds
  const contrastStyle = needsContrastHelp ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''

  // Use passed badgeProps or create default from individual props
  const badgeProps = passedBadgeProps || { slug, color, size }

  // Compact mode for inline previews (mobile color/size steps)
  if (compact) {
    return (
      <div className="flex items-center justify-center p-4 bg-card rounded-xl">
        <a
          href="https://la.io"
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:opacity-90 transition-opacity"
        >
          <BadgeComponent {...badgeProps} size="s" />
        </a>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Preview mode toggle */}
      <div className="flex items-center justify-center gap-1 mb-2">
        {PREVIEW_MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => setPreviewMode(mode.value)}
            className={cn(
              'px-2 py-1.5 text-xs font-medium rounded-md transition-colors',
              previewMode === mode.value
                ? 'bg-accent text-bg'
                : 'bg-card text-sub hover:text-text'
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Preview container */}
      <div className="flex-1 flex flex-col bg-card rounded-xl overflow-hidden">
        {/* Layout label */}
        <div className="px-3 py-1.5 border-b border-sub/10 flex items-center justify-between">
          <span className="text-[10px] text-sub uppercase tracking-wider">
            {layout} layout
          </span>
          {name && (
            <span className="text-[10px] text-sub truncate ml-2">
              {name}
            </span>
          )}
        </div>

        {/* Preview area */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-6 min-h-[280px] lg:min-h-[320px]">
          {previewMode === 'badge' && (
            <div className="p-5 lg:p-8 rounded-lg bg-gradient-to-br from-sub/5 to-sub/10 border border-sub/10">
              <a
                href="https://la.io"
                target="_blank"
                rel="noopener noreferrer"
                className={cn('block hover:opacity-90 transition-opacity', contrastStyle)}
              >
                <BadgeComponent {...badgeProps} />
              </a>
            </div>
          )}

          {previewMode === 'footer' && (
            <FooterPreview BadgeComponent={BadgeComponent} badgeProps={badgeProps} contrastStyle={contrastStyle} />
          )}

          {previewMode === 'sidebar' && (
            <SidebarPreview BadgeComponent={BadgeComponent} badgeProps={badgeProps} contrastStyle={contrastStyle} />
          )}

          {previewMode === 'signature' && (
            <SignaturePreview BadgeComponent={BadgeComponent} badgeProps={badgeProps} contrastStyle={contrastStyle} />
          )}
        </div>

        {/* Config summary */}
        <div className="px-3 py-2 border-t border-sub/10 bg-bg/30">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[9px] text-sub uppercase tracking-wider mb-0.5">Color</p>
              {badgeProps.bgColor ? (
                <div className="flex items-center justify-center gap-0.5">
                  <div className="w-2.5 h-2.5 rounded-l" style={{ backgroundColor: badgeProps.bgColor }} />
                  <div className="w-2.5 h-2.5 rounded-r" style={{ backgroundColor: badgeProps.fgColor }} />
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: color }} />
                  <span className="text-[10px] font-mono text-text">{color}</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-[9px] text-sub uppercase tracking-wider mb-0.5">Size</p>
              <p className="text-[10px] font-medium text-text uppercase">{size}</p>
            </div>
            <div>
              <p className="text-[9px] text-sub uppercase tracking-wider mb-0.5">Layout</p>
              <p className="text-[10px] font-medium text-text capitalize">{layout}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreviewPanel
