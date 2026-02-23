import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function for conditional class names
 * Combines clsx and tailwind-merge for optimal class handling
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
