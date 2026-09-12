import { resolveCanonicalCategory } from './category-utils'

/**
 * Canonical palette for all default categories across charts, icons, badges, and lists.
 */
export const CATEGORY_COLORS: Record<string, string> = {
  Salary: '#10b981',       // Emerald Green
  Rent: '#6366f1',         // Indigo
  Groceries: '#f97316',    // Warm Orange
  'Dining Out': '#f43f5e', // Rose
  DiningOut: '#f43f5e',
  Shopping: '#ec4899',     // Hot Pink
  Transport: '#3b82f6',    // Vibrant Blue
  Utilities: '#eab308',    // Electric Gold / Yellow
  Healthcare: '#ef4444',   // Medical Red
  Entertainment: '#8b5cf6',// Violet / Purple
  Insurance: '#64748b',    // Slate Grey
  Savings: '#14b8a6',      // Teal
  Transfers: '#06b6d4',    // Cyan
  Other: '#a855f7',        // Lilac
}

/**
 * Standard icon color mappings aligned with the canonical category palette.
 */
export const ICON_COLORS: Record<string, string> = {
  // Finance
  PiggyBank: '#14b8a6', CreditCard: '#06b6d4', Briefcase: '#10b981', Landmark: '#94a3b8',
  Wallet: '#10b981', Banknote: '#10b981', Coins: '#eab308', Receipt: '#64748b',
  // Home & Utilities
  Home: '#6366f1', Zap: '#eab308', Droplet: '#06b6d4', Flame: '#f97316',
  Wifi: '#3b82f6', Wrench: '#64748b', Trash2: '#64748b', Key: '#f59e0b', Building2: '#64748b',
  // Food & Drink
  ShoppingCart: '#f97316', Utensils: '#f43f5e', Coffee: '#78350f', Wine: '#be123c',
  Pizza: '#f43f5e', Apple: '#f97316', Carrot: '#f97316',
  // Transportation
  Car: '#3b82f6', Train: '#64748b', Plane: '#0ea5e9', Bike: '#10b981',
  Bus: '#eab308', Ship: '#0ea5e9', Fuel: '#f59e0b',
  // Shopping
  ShoppingBag: '#ec4899', Gift: '#d946ef', Tag: '#ec4899', Shirt: '#ec4899',
  Smartphone: '#64748b', Monitor: '#64748b',
  // Health
  HeartPulse: '#ef4444', Heart: '#ef4444', Stethoscope: '#ef4444', Pill: '#ef4444',
  Activity: '#10b981', Syringe: '#0ea5e9', Dumbbell: '#64748b',
  // Entertainment
  Film: '#8b5cf6', Music: '#d946ef', Gamepad2: '#8b5cf6', Tv: '#64748b',
  Ticket: '#f59e0b', Headphones: '#3b82f6', BookOpen: '#0ea5e9', Book: '#0ea5e9',
  // Miscellaneous
  Package: '#a855f7', MapPin: '#ef4444', Star: '#eab308', Anchor: '#64748b',
  Smile: '#eab308', Trophy: '#eab308', Users: '#3b82f6'
}

/**
 * Returns a consistent canonical hex color for any category, taking custom user-defined
 * category icons and palette into account.
 */
export const getCategoryColor = (
  categoryName: string,
  customCategories?: { id: string; icon?: string }[]
): string => {
  if (!categoryName) return '#94a3b8'

  // 1. Check custom categories first
  const custom = customCategories?.find((c) => c.id === categoryName)
  if (custom?.icon && ICON_COLORS[custom.icon]) {
    return ICON_COLORS[custom.icon]
  }

  // 2. Direct exact match in canonical palette
  if (CATEGORY_COLORS[categoryName]) {
    return CATEGORY_COLORS[categoryName]
  }

  // 3. Resolve canonical category dynamically across all supported languages
  const canonical = resolveCanonicalCategory(categoryName)
  return CATEGORY_COLORS[canonical] || CATEGORY_COLORS.Other
}

/**
 * Lightens (positive amount) or darkens (negative amount) a hex color string.
 * Clamps RGB values between 0 and 255.
 */
export const adjustColor = (hex: string, amount: number): string => {
  if (!hex || typeof hex !== 'string') return hex
  let col = hex.replace('#', '')
  if (col.length === 3) {
    col = col
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const num = parseInt(col, 16)
  if (isNaN(num)) return hex

  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))

  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}
