import { StandardBadge } from './StandardBadge'
import { PillBadge } from './PillBadge'
import { HorizontalBadge } from './HorizontalBadge'

export { StandardBadge, PillBadge, HorizontalBadge }

// Badge component selector
export function getBadgeComponent(layout) {
  switch (layout) {
    case 'pill':
      return PillBadge
    case 'horizontal':
      return HorizontalBadge
    case 'standard':
    default:
      return StandardBadge
  }
}
