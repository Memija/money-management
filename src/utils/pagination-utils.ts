/**
 * Generates an array of page numbers and ellipsis tokens for truncated pagination.
 * Ensures the visible page buttons do not exceed a maximum count (7 items),
 * keeping the UI compact and readable regardless of total pages.
 *
 * @param current - Currently active page (1-indexed)
 * @param total - Total number of pages
 * @returns An array of page numbers or '...' indicators
 */
export function getVisiblePages(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: Math.max(0, total) }, (_, i) => i + 1)
  }

  const safeCurrent = Math.min(Math.max(1, current), total)

  // Near the beginning: 1 2 3 4 5 ... total
  if (safeCurrent <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  // Near the end: 1 ... total-4 total-3 total-2 total-1 total
  if (safeCurrent >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  // In the middle: 1 ... current-1 current current+1 ... total
  return [1, '...', safeCurrent - 1, safeCurrent, safeCurrent + 1, '...', total]
}
