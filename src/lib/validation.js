/**
 * Validation utilities for badge builder
 * Based on rules from CLAUDE.md
 */

// Valid size options
const VALID_SIZES = ['s', 'm', 'l', 'auto']

// Valid layout options
const VALID_LAYOUTS = ['standard', 'pill', 'horizontal']

// Hex color regex
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/

// Slug allowed characters: alphanumeric, spaces, hyphens, underscores
const SLUG_REGEX = /^[a-zA-Z0-9\s\-_]+$/

/**
 * Validate and sanitize a slug
 * @param {string} input - Raw slug input
 * @returns {{ valid: boolean, value: string, error: string | null }}
 */
export function validateSlug(input) {
  if (!input || typeof input !== 'string') {
    return { valid: false, value: '', error: 'Name is required' }
  }

  const trimmed = input.trim()

  if (trimmed.length === 0) {
    return { valid: false, value: '', error: 'Name is required' }
  }

  if (trimmed.length > 50) {
    return { valid: false, value: trimmed, error: 'Name must be 50 characters or less' }
  }

  if (!SLUG_REGEX.test(trimmed)) {
    return {
      valid: false,
      value: trimmed,
      error: 'Name can only contain letters, numbers, spaces, hyphens, and underscores',
    }
  }

  return { valid: true, value: trimmed, error: null }
}

/**
 * Convert display name to URL-friendly slug
 * @param {string} name - Display name
 * @returns {string} - URL-friendly slug
 */
export function nameToSlug(name) {
  if (!name || typeof name !== 'string') return ''

  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s\-_]/g, '') // Remove invalid chars
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-') // Multiple hyphens to single
    .replace(/^-|-$/g, '') // Trim leading/trailing hyphens
    .slice(0, 50) // Max length
}

/**
 * Validate a hex color
 * @param {string} color - Hex color string
 * @returns {{ valid: boolean, value: string, error: string | null }}
 */
export function validateColor(color) {
  if (!color || typeof color !== 'string') {
    return { valid: false, value: '#101948', error: 'Color is required' }
  }

  const trimmed = color.trim().toUpperCase()

  // If it doesn't start with #, add it
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`

  if (!HEX_COLOR_REGEX.test(withHash)) {
    return { valid: false, value: color, error: 'Invalid hex color format (use #RRGGBB)' }
  }

  return { valid: true, value: withHash, error: null }
}

/**
 * Validate a size option
 * @param {string} size - Size string
 * @returns {{ valid: boolean, value: string, error: string | null }}
 */
export function validateSize(size) {
  if (!size || typeof size !== 'string') {
    return { valid: false, value: 'm', error: 'Size is required' }
  }

  const normalized = size.toLowerCase().trim()

  if (!VALID_SIZES.includes(normalized)) {
    return {
      valid: false,
      value: 'm',
      error: `Invalid size. Must be one of: ${VALID_SIZES.join(', ')}`,
    }
  }

  return { valid: true, value: normalized, error: null }
}

/**
 * Validate a layout option
 * @param {string} layout - Layout string
 * @returns {{ valid: boolean, value: string, error: string | null }}
 */
export function validateLayout(layout) {
  if (!layout || typeof layout !== 'string') {
    return { valid: false, value: 'standard', error: 'Layout is required' }
  }

  const normalized = layout.toLowerCase().trim()

  if (!VALID_LAYOUTS.includes(normalized)) {
    return {
      valid: false,
      value: 'standard',
      error: `Invalid layout. Must be one of: ${VALID_LAYOUTS.join(', ')}`,
    }
  }

  return { valid: true, value: normalized, error: null }
}

/**
 * Get pixel width for a size option
 * @param {string} size - Size option (s, m, l)
 * @returns {number} - Width in pixels
 */
export function getSizePixels(size) {
  const sizes = {
    s: 120,
    m: 160,
    l: 220,
    auto: 160, // Default for auto
  }
  return sizes[size] || sizes.m
}

/**
 * Preset badge colors organized by category
 * Official LA.IO brand colors from LA.IO.COLORS.RGB.ase
 * Preferred combo: Dark + Easy
 */
export const PRESET_COLORS = {
  dark: [
    { hex: '#101948', name: 'Dark Purple' },
    { hex: '#172708', name: 'Dark Green' },
    { hex: '#01233C', name: 'Dark Blue' },
    { hex: '#302511', name: 'Dark Orange' },
    { hex: '#231F20', name: 'Dark Gray' },
  ],
  easy: [
    { hex: '#E385FE', name: 'Easy Magenta' },
    { hex: '#C8ED5D', name: 'Easy Green' },
    { hex: '#63DCDE', name: 'Easy Blue' },
    { hex: '#F1DC43', name: 'Easy Orange' },
    { hex: '#E3E6E7', name: 'Easy Gray' },
  ],
  electric: [
    { hex: '#F629CB', name: 'Electric Magenta' },
    { hex: '#96F90B', name: 'Electric Green' },
    { hex: '#00B9FE', name: 'Electric Blue' },
    { hex: '#F5C124', name: 'Electric Orange' },
    { hex: '#929497', name: 'Gray' },
  ],
}

/**
 * Flat array of all preset colors
 */
export const ALL_PRESET_COLORS = [
  ...PRESET_COLORS.dark,
  ...PRESET_COLORS.easy,
  ...PRESET_COLORS.electric,
]

/**
 * Color families for Pill badge two-color schemes
 * Each family has dark, easy, and electric variants at matching indices
 */
export const COLOR_FAMILIES = [
  { name: 'Magenta', dark: '#101948', easy: '#E385FE', electric: '#F629CB' },
  { name: 'Green', dark: '#172708', easy: '#C8ED5D', electric: '#96F90B' },
  { name: 'Blue', dark: '#01233C', easy: '#63DCDE', electric: '#00B9FE' },
  { name: 'Orange', dark: '#302511', easy: '#F1DC43', electric: '#F5C124' },
  { name: 'Gray', dark: '#231F20', easy: '#E3E6E7', electric: '#929497' },
]

/**
 * Valid scheme types for Pill badge
 */
export const PILL_SCHEMES = ['easy-dark', 'electric-dark']

/**
 * Get colors for a Pill badge scheme
 * @param {string} family - Color family name (Magenta, Green, Blue, Orange, Gray)
 * @param {string} scheme - Scheme type (easy-dark or electric-dark)
 * @param {boolean} reversed - If true, swap bg/fg
 * @returns {{ bg: string, fg: string }}
 */
export function getPillSchemeColors(family, scheme = 'easy-dark', reversed = false) {
  const fam = COLOR_FAMILIES.find(f => f.name.toLowerCase() === family.toLowerCase())
  if (!fam) {
    // Default to Blue easy-dark
    return reversed
      ? { bg: '#63DCDE', fg: '#01233C' }
      : { bg: '#01233C', fg: '#63DCDE' }
  }

  const light = scheme === 'electric-dark' ? fam.electric : fam.easy
  const dark = fam.dark

  return reversed
    ? { bg: light, fg: dark }
    : { bg: dark, fg: light }
}

/**
 * Default badge configuration
 */
export const DEFAULT_CONFIG = {
  color: '#101948',
  size: 'm',
  layout: 'standard',
}

/**
 * Default Pill badge configuration
 */
export const DEFAULT_PILL_CONFIG = {
  family: 'Blue',
  scheme: 'easy-dark',
  reversed: false,
}
