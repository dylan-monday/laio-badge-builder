import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { getBadgeComponent } from '@/components/badges'
import {
  generateEmbedCode,
  generateMarkdown,
  exportAsPng,
  exportAsSvg,
  copyToClipboard,
} from '@/lib/export'

const TABS = [
  { id: 'embed', label: 'Embed', icon: CodeIcon },
  { id: 'svg', label: 'SVG', icon: ImageIcon },
  { id: 'png', label: 'PNG', icon: PhotoIcon },
  { id: 'markdown', label: 'Markdown', icon: MarkdownIcon },
]

/**
 * Export Modal
 * - 4 tabs: Embed Code, SVG, PNG, Markdown
 * - Copy/download functionality for each format
 */
export function ExportModal({ slug, color, size, layout = 'standard', bgColor, fgColor, onClose, onCopied }) {
  const [activeTab, setActiveTab] = useState('embed')
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const badgeRef = useRef(null)

  const BadgeComponent = getBadgeComponent(layout)
  const config = { slug, color, size, layout, bgColor, fgColor }

  const embedCode = generateEmbedCode(config)
  const markdownCode = generateMarkdown(config)

  // Badge props for rendering - use bgColor/fgColor for Pill, color for others
  const badgeProps = bgColor
    ? { slug, size, bgColor, fgColor }
    : { slug, size, color }

  const handleCopy = async (text) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)
      onCopied?.()
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleExportPng = async () => {
    if (!badgeRef.current) return
    setExporting(true)
    await exportAsPng(badgeRef.current, `laio-badge-${slug}`)
    setExporting(false)
  }

  const handleExportSvg = async () => {
    if (!badgeRef.current) return
    setExporting(true)
    await exportAsSvg(badgeRef.current, `laio-badge-${slug}`)
    setExporting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-sub/10">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">Export your badge</h2>
            <p className="text-xs sm:text-sm text-sub mt-0.5 sm:mt-1">
              Choose a format to use on your website
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-sub/10 transition-colors"
          >
            <svg className="w-5 h-5 text-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-sub/10">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 text-xs sm:text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'text-accent border-b-2 border-accent -mb-px'
                    : 'text-sub hover:text-text'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Badge preview for export (hidden but used for PNG/SVG export) */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <div ref={badgeRef} className="inline-block p-2 bg-transparent">
            <BadgeComponent {...badgeProps} />
          </div>
        </div>

        {/* Tab content */}
        <div className="p-4 sm:p-6">
          {/* Embed Code Tab */}
          {activeTab === 'embed' && (
            <div className="space-y-4">
              <div className="relative">
                <pre className="p-3 sm:p-4 bg-bg rounded-xl text-xs sm:text-sm text-text font-mono overflow-x-auto whitespace-pre-wrap break-all max-h-32 sm:max-h-40">
                  {embedCode}
                </pre>
                <CopyButton copied={copied} onClick={() => handleCopy(embedCode)} />
              </div>
              <p className="text-xs text-sub">
                Paste this code into your website HTML where you want the badge to appear.
              </p>
            </div>
          )}

          {/* SVG Tab */}
          {activeTab === 'svg' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-6 bg-bg rounded-xl">
                <BadgeComponent {...badgeProps} />
              </div>
              <button
                onClick={handleExportSvg}
                disabled={exporting}
                className="w-full py-3 rounded-xl font-medium bg-accent text-bg hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : 'Download SVG'}
              </button>
              <p className="text-xs text-sub">
                Scalable vector format. Perfect for print and presentations.
              </p>
            </div>
          )}

          {/* PNG Tab */}
          {activeTab === 'png' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-6 bg-bg rounded-xl">
                <BadgeComponent {...badgeProps} />
              </div>
              <button
                onClick={handleExportPng}
                disabled={exporting}
                className="w-full py-3 rounded-xl font-medium bg-accent text-bg hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : 'Download PNG'}
              </button>
              <p className="text-xs text-sub">
                High-resolution image. Great for email signatures and documents.
              </p>
            </div>
          )}

          {/* Markdown Tab */}
          {activeTab === 'markdown' && (
            <div className="space-y-4">
              <div className="relative">
                <pre className="p-3 sm:p-4 bg-bg rounded-xl text-xs sm:text-sm text-text font-mono overflow-x-auto whitespace-pre-wrap break-all">
                  {markdownCode}
                </pre>
                <CopyButton copied={copied} onClick={() => handleCopy(markdownCode)} />
              </div>
              <p className="text-xs text-sub">
                For GitHub READMEs and markdown documents. Note: Requires badge image hosting.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-4 sm:px-6 py-4 border-t border-sub/10 bg-bg/50">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 bg-sub/20 text-text rounded-lg font-medium hover:bg-sub/30 transition-colors text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

// Copy button component
function CopyButton({ copied, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'absolute top-2 right-2 sm:top-3 sm:right-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all',
        copied
          ? 'bg-success text-bg'
          : 'bg-accent text-bg hover:bg-accent/90'
      )}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

// Icons
function CodeIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  )
}

function ImageIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function PhotoIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function MarkdownIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 5v14h18V5H3zm15 10l-3-3v2H9V9h6v2l3-3 3 3-3 3z" />
    </svg>
  )
}

export default ExportModal
