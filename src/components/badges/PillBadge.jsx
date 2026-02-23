import { getSizePixels } from '@/lib/validation'

/**
 * Pill Badge Component
 * Compact horizontal pill shape (~5.5:1 ratio)
 * Based on official la.io pill.svg
 *
 * Supports two modes:
 * 1. Single color: pass `color` prop, text auto-contrasts
 * 2. Two-color scheme: pass `bgColor` and `fgColor` props
 */
export function PillBadge({
  slug = '',
  color,
  bgColor,
  fgColor,
  size = 'm'
}) {
  const width = getSizePixels(size)
  const height = Math.round(width / 5.5)

  // Determine background and foreground colors
  const bg = bgColor || color || '#01233C'
  const fg = fgColor || (isLightColor(bg) ? '#03243c' : '#ffffff')

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 130.23 23.58"
      width={width}
      height={height}
      role="img"
      aria-label={`LA.IO badge for ${slug || 'partner'}`}
    >
      {/* Background pill */}
      <rect
        x="0"
        y="0"
        width="130.23"
        height="23.58"
        rx="11.79"
        ry="11.79"
        fill={bg}
      />

      <g fill={fg}>
        {/* INNOVATION text - top row */}
        <g>
          <path d="M79.28,15.33v-.3h.71v-1.91h-.71v-.3h1.76v.3h-.7v1.91h.7v.3h-1.76Z"/>
          <path d="M84.32,14.77v-1.94h.32v2.51h-.31l-1.24-2.07v2.07h-.32v-2.51h.41l1.14,1.94Z"/>
          <path d="M87.87,14.77v-1.94h.32v2.51h-.31l-1.24-2.07v2.07h-.32v-2.51h.41l1.14,1.94Z"/>
          <path d="M90.8,15.38c-.61,0-1.04-.53-1.04-1.3s.44-1.3,1.04-1.3,1.04.53,1.04,1.3-.44,1.3-1.04,1.3ZM90.8,13.08c-.41,0-.68.39-.68,1s.27,1,.68,1,.68-.39.68-1-.27-1-.68-1Z"/>
          <path d="M94.14,15.33l-.84-2.51h.37l.68,2.1h.02l.67-2.1h.36l-.84,2.51h-.41Z"/>
          <path d="M98.34,14.6h-.92l-.23.73h-.34l.84-2.51h.42l.84,2.51h-.36l-.24-.73ZM97.51,14.32h.74l-.36-1.11h-.02l-.36,1.11Z"/>
          <path d="M101.26,15.33v-2.21h-.89v-.3h2.13v.3h-.9v2.21h-.35Z"/>
          <path d="M104.1,15.33v-.3h.71v-1.91h-.71v-.3h1.76v.3h-.7v1.91h.7v.3h-1.76Z"/>
          <path d="M108.53,15.38c-.61,0-1.04-.53-1.04-1.3s.44-1.3,1.04-1.3,1.04.53,1.04,1.3-.44,1.3-1.04,1.3ZM108.53,13.08c-.41,0-.68.39-.68,1s.27,1,.68,1,.68-.39.68-1-.27-1-.68-1Z"/>
          <path d="M112.69,14.77v-1.94h.32v2.51h-.31l-1.24-2.07v2.07h-.32v-2.51h.41l1.14,1.94Z"/>
        </g>

        {/* LOUISIANA text - bottom row */}
        <g>
          <path d="M80.05,8.26v2.46h1.59v.77h-2.46v-3.22h.87Z"/>
          <path d="M84.23,11.54c-.83,0-1.45-.68-1.45-1.67s.62-1.67,1.45-1.67,1.45.68,1.45,1.67-.62,1.67-1.45,1.67ZM84.23,8.96c-.35,0-.57.36-.57.91s.22.91.57.91.57-.36.57-.91-.22-.91-.57-.91Z"/>
          <path d="M86.79,10.18v-1.92h.86v1.78c0,.49.08.77.48.77s.48-.28.48-.77v-1.78h.87v1.92c0,.94-.57,1.36-1.35,1.36s-1.34-.42-1.34-1.36Z"/>
          <path d="M90.81,11.48v-.75h.8v-1.72h-.8v-.75h2.48v.75h-.8v1.72h.8v.75h-2.48Z"/>
          <path d="M95,10.37c.24.32.58.48.96.48.31,0,.5-.1.5-.28s-.15-.21-.29-.24l-.66-.15c-.48-.11-.84-.37-.84-.93,0-.63.49-1.05,1.23-1.05.57,0,1,.24,1.3.59l-.52.54c-.17-.25-.38-.43-.78-.43-.24,0-.42.11-.42.27,0,.15.12.19.25.23l.64.15c.64.15.92.45.92.97,0,.67-.59,1.03-1.32,1.03-.64,0-1.09-.2-1.44-.56l.49-.61Z"/>
          <path d="M98.63,11.48v-.75h.8v-1.72h-.8v-.75h2.48v.75h-.8v1.72h.8v.75h-2.48Z"/>
          <path d="M104.23,10.86h-.96l-.17.62h-.84l.99-3.22h1.06l.99,3.22h-.89l-.17-.62ZM103.45,10.21h.59l-.29-1.02h-.02l-.29,1.02Z"/>
          <path d="M108.23,10.14v-1.88h.79v3.22h-.81l-1.08-2.2v2.2h-.79v-3.22h1.03l.86,1.88Z"/>
          <path d="M112.04,10.86h-.96l-.17.62h-.84l.99-3.22h1.06l.99,3.22h-.89l-.17-.62ZM111.27,10.21h.59l-.29-1.02h-.02l-.29,1.02Z"/>
        </g>

        {/* LA.IO text */}
        <g>
          <path d="M30.93,8.86v4.6h2.97v1.44h-4.6v-6.04h1.63Z"/>
          <path d="M39.62,13.73h-1.79l-.33,1.17h-1.58l1.85-6.04h1.99l1.85,6.04h-1.67l-.33-1.17ZM38.17,12.51h1.11l-.54-1.92h-.04l-.54,1.92Z"/>
          <path d="M45.17,13.06h1.84v1.84h-1.84v-1.84Z"/>
          <path d="M51.09,14.9v-1.41h1.5v-3.22h-1.5v-1.41h4.64v1.41h-1.5v3.22h1.5v1.41h-4.64Z"/>
          <path d="M60.73,15.01c-1.55,0-2.71-1.27-2.71-3.13s1.16-3.13,2.71-3.13,2.71,1.27,2.71,3.13-1.16,3.13-2.71,3.13ZM60.73,10.18c-.65,0-1.06.67-1.06,1.7s.41,1.7,1.06,1.7,1.06-.67,1.06-1.7-.41-1.7-1.06-1.7Z"/>
        </g>

        {/* Left arrow */}
        <polygon points="20.2 11.79 25.75 17.34 24.21 18.88 17.13 11.79 24.21 4.7 25.75 6.24 20.2 11.79"/>

        {/* Right arrow */}
        <polygon points="72.55 11.79 67 6.24 68.54 4.7 75.63 11.79 68.54 18.88 67 17.34 72.55 11.79"/>
      </g>
    </svg>
  )
}

// Helper to determine if color is light (for contrast)
function isLightColor(hex) {
  if (!hex || typeof hex !== 'string') return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}

export default PillBadge
