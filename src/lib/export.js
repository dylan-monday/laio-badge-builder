import { toPng, toSvg } from 'html-to-image'
import { saveAs } from 'file-saver'

/**
 * Export badge as PNG image
 * @param {HTMLElement} element - Badge DOM element to export
 * @param {string} filename - Output filename (without extension)
 */
export async function exportAsPng(element, filename = 'laio-badge') {
  try {
    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2, // Higher resolution for crisp output
      backgroundColor: 'transparent',
    })

    // Convert data URL to blob and trigger download
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    saveAs(blob, `${filename}.png`)

    return { success: true }
  } catch (error) {
    console.error('PNG export failed:', error)
    return { success: false, error }
  }
}

/**
 * Export badge as SVG file
 * @param {HTMLElement} element - Badge DOM element to export
 * @param {string} filename - Output filename (without extension)
 */
export async function exportAsSvg(element, filename = 'laio-badge') {
  try {
    const dataUrl = await toSvg(element)

    // Convert data URL to blob and trigger download
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    saveAs(blob, `${filename}.svg`)

    return { success: true }
  } catch (error) {
    console.error('SVG export failed:', error)
    return { success: false, error }
  }
}

/**
 * Generate embed code script tag
 * @param {Object} config - Badge configuration
 * @param {string} config.slug - Partner slug
 * @param {string} config.color - Badge color
 * @param {string} config.size - Badge size
 * @param {string} config.layout - Badge layout
 * @param {string} config.bgColor - Pill badge background color
 * @param {string} config.fgColor - Pill badge foreground color
 * @returns {string} - HTML script tag
 */
export function generateEmbedCode(config) {
  const badgeJsUrl = import.meta.env.VITE_BADGE_JS_URL || 'https://badgebuilder.la.io/badge.js'

  // For Pill layout with two-color scheme, use bgColor/fgColor
  const isPillTwoColor = config.layout === 'pill' && config.bgColor && config.fgColor

  let attrs = `data-slug="${config.slug}"
        data-size="${config.size}"`

  if (isPillTwoColor) {
    attrs += `
        data-bg-color="${config.bgColor}"
        data-fg-color="${config.fgColor}"`
  } else {
    attrs += `
        data-color="${config.color}"`
  }

  // Only include layout if not standard (for backward compatibility)
  if (config.layout && config.layout !== 'standard') {
    attrs += `
        data-layout="${config.layout}"`
  }

  return `<script async src="${badgeJsUrl}"
        ${attrs}></script>`
}

/**
 * Generate markdown badge code
 * @param {Object} config - Badge configuration
 * @param {string} config.slug - Partner slug
 * @returns {string} - Markdown code
 */
export function generateMarkdown(config) {
  // Points to a potential future badge image endpoint
  const badgeUrl = `https://badgebuilder.la.io/badge/${config.slug}.svg`
  const linkUrl = `https://la.io/?ref=badge&slug=${encodeURIComponent(config.slug)}`

  return `[![LA.IO Partner](${badgeUrl})](${linkUrl})`
}

/**
 * Copy text to clipboard with fallback
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    } catch (fallbackErr) {
      console.error('Copy failed:', fallbackErr)
      return false
    }
  }
}
