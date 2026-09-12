import React from 'react'
import { FaAmazon } from 'react-icons/fa'
import {
  SiAirbnb, SiAldisud, SiAllegro, SiApple, SiAral, SiAsda, SiAuchan,
  SiBookingdotcom, SiBurgerking, SiCarrefour, SiCoop, SiDeliveroo,
  SiDeutschebahn, SiDeutschetelekom, SiDm, SiDoordash, SiEbay, SiEdeka, SiGojek, SiGrab, SiIkea, SiJusteat, SiKaufland, SiKfc,
  SiKlarna, SiLidl,
  SiLyft, SiMastercard,
  SiMcdonalds,
  SiMorrisons, SiN26, SiNetflix, SiNike, SiO2,
  SiOrange, SiPaypal, SiPlaystation, SiRevolut, SiRewe,
  SiShell, SiShopee, SiSparkasse,
  SiSpotify, SiStarbucks, SiSteam, SiTarget, SiTesco, SiTwitch, SiUber, SiUbereats, SiVisa, SiVodafone, SiWise, SiYoutube, SiZabka, SiZalando, SiZara
} from 'react-icons/si'
import {
  Activity,
  Anchor,
  Apple,
  Banknote,
  Bike,
  Book,
  BookOpen,
  Briefcase,
  Building2,
  Bus,
  Car,
  Carrot,
  Coffee,
  Coins,
  CreditCard,
  Droplet,
  Dumbbell,
  Film,
  Flame,
  Fuel,
  Gamepad2,
  Gift,
  Headphones,
  Heart,
  HeartPulse,
  Home,
  Key,
  Landmark,
  MapPin,
  Monitor,
  Music,
  Package,
  PiggyBank,
  Pill,
  Pizza,
  Plane,
  Receipt,
  Ship,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Smile,
  Star,
  Stethoscope,
  Syringe,
  Tag,
  Ticket,
  Train,
  Trash2,
  Trophy,
  Tv,
  Users,
  Utensils,
  Wallet,
  Wifi,
  Wine,
  Wrench,
  Zap
} from 'lucide-react'

import { type MerchantSuggestion, POPULAR_MERCHANTS } from '../data/merchants'
import { translations } from '../i18n/translations'
import type { CustomCategory } from '../types'
import { getCategoryColor, ICON_COLORS } from './category-colors'
import { resolveCanonicalCategory } from './category-utils'

export type IconComponent = React.ComponentType<{ size?: number | string; color?: string; className?: string }>

export interface MerchantBrandInfo {
  merchant?: MerchantSuggestion
  logoComponent?: IconComponent
  brandColor: string
  suggestedCategory?: string
  initials: string
}

export const MERCHANT_LOGOS: Record<string, IconComponent> = {
  SiNetflix, SiSpotify, SiUber, SiStarbucks, SiSteam, SiMcdonalds,
  SiIkea, SiApple, SiPaypal, SiAirbnb, SiNike, SiDm, SiRewe,
  SiKaufland, SiShell, SiDeutschebahn, SiDeutschetelekom, SiVodafone, SiO2,
  FaAmazon, SiAldisud, SiAral, SiEdeka, SiLidl,
  SiZalando, SiTesco, SiShopee, SiOrange, SiGrab, SiGojek, SiDeliveroo,
  SiCarrefour, SiBookingdotcom, SiAllegro, SiJusteat, SiEbay, SiAuchan,
  SiZabka, SiAsda, SiMorrisons, SiCoop, SiTarget, SiBurgerking, SiKfc,
  SiDoordash, SiUbereats, SiRevolut, SiWise, SiKlarna, SiN26, SiMastercard,
  SiVisa, SiZara, SiLyft, SiYoutube, SiTwitch, SiPlaystation, SiSparkasse
}

export const AVAILABLE_ICONS: Record<string, IconComponent> = {
  // Finance
  PiggyBank, CreditCard, Briefcase, Landmark, Wallet, Banknote, Coins, Receipt,
  // Home & Utilities
  Home, Zap, Droplet, Flame, Wifi, Wrench, Trash2, Key, Building2,
  // Food & Drink
  ShoppingCart, Utensils, Coffee, Wine, Pizza, Apple, Carrot,
  // Transportation
  Car, Train, Plane, Bike, Bus, Ship, Fuel,
  // Shopping
  ShoppingBag, Gift, Tag, Shirt, Smartphone, Monitor,
  // Health
  HeartPulse, Heart, Stethoscope, Pill, Activity, Syringe,
  // Entertainment
  Film, Music, Gamepad2, Tv, Ticket, Headphones, BookOpen, Book,
  // Miscellaneous
  Package, MapPin, Star, Anchor, Dumbbell, Smile, Trophy, Users
}

export const ICON_GROUPS = [
  {
    name: 'Finance',
    icons: ['PiggyBank', 'CreditCard', 'Briefcase', 'Landmark', 'Wallet', 'Banknote', 'Coins', 'Receipt']
  },
  {
    name: 'Home & Utilities',
    icons: ['Home', 'Zap', 'Droplet', 'Flame', 'Wifi', 'Wrench', 'Trash2', 'Key', 'Building2']
  },
  {
    name: 'Food & Drink',
    icons: ['ShoppingCart', 'Utensils', 'Coffee', 'Wine', 'Pizza', 'Apple', 'Carrot']
  },
  {
    name: 'Transportation',
    icons: ['Car', 'Train', 'Plane', 'Bike', 'Bus', 'Ship', 'Fuel']
  },
  {
    name: 'Shopping',
    icons: ['ShoppingBag', 'Gift', 'Tag', 'Shirt', 'Smartphone', 'Monitor']
  },
  {
    name: 'Health & Wellness',
    icons: ['HeartPulse', 'Heart', 'Stethoscope', 'Pill', 'Activity', 'Syringe', 'Dumbbell']
  },
  {
    name: 'Entertainment',
    icons: ['Film', 'Music', 'Gamepad2', 'Tv', 'Ticket', 'Headphones', 'BookOpen', 'Book']
  },
  {
    name: 'Miscellaneous',
    icons: ['Package', 'MapPin', 'Star', 'Anchor', 'Smile', 'Trophy', 'Users']
  }
]

// Dynamically compile coffee keywords from all registered locales + universal terms
const coffeeKeywords = new Set<string>(['coffee', 'cafe', 'latte', 'espresso', 'cappuccino'])
for (const locale of Object.values(translations)) {
  if (locale.icons?.Coffee) {
    coffeeKeywords.add(locale.icons.Coffee.toLowerCase())
  }
}
export const COFFEE_REGEX = new RegExp(`(${[...coffeeKeywords].join('|')})`, 'i')

export const CANONICAL_CATEGORY_ICONS: Record<string, IconComponent> = {
  Salary: Briefcase,
  Rent: Home,
  Groceries: ShoppingCart,
  'Dining Out': Utensils,
  DiningOut: Utensils,
  Shopping: ShoppingBag,
  Healthcare: HeartPulse,
  Transport: Car,
  Entertainment: Film,
  Insurance: Building2,
  Utilities: Zap,
  Savings: PiggyBank,
  Transfers: CreditCard,
  Other: Package,
}

export function getCategoryIcon(
  categoryName: string,
  size = 16,
  customCategories?: CustomCategory[],
  description?: string
): React.ReactNode {
  // 1. Check if it's a custom category with a selected icon
  if (customCategories) {
    const customMatch = customCategories.find((c) => c.id === categoryName)
    if (customMatch && customMatch.icon && AVAILABLE_ICONS[customMatch.icon as keyof typeof AVAILABLE_ICONS]) {
      const IconComp = AVAILABLE_ICONS[customMatch.icon as keyof typeof AVAILABLE_ICONS]
      const color = ICON_COLORS[customMatch.icon] || getCategoryColor(categoryName, customCategories)
      return <IconComp size={size} color={color} />
    }
  }

  // 1.5. Check if it matches a popular merchant based on description
  if (description) {
    const descLower = description.toLowerCase()
    const merchant = POPULAR_MERCHANTS.find((m) => descLower.includes(m.keyword.toLowerCase()))

    if (merchant) {
      if (merchant.logo && MERCHANT_LOGOS[merchant.logo]) {
        const LogoComp = MERCHANT_LOGOS[merchant.logo]
        return <LogoComp size={size} color={merchant.brandColor || 'var(--text-main)'} />
      }
      if (AVAILABLE_ICONS[merchant.icon]) {
        const IconComp = AVAILABLE_ICONS[merchant.icon]
        const color = merchant.brandColor || ICON_COLORS[merchant.icon] || getCategoryColor(categoryName, customCategories)
        return <IconComp size={size} color={color} />
      }
    }
  }

  // 2. Canonical category color
  const categoryColor = getCategoryColor(categoryName, customCategories)

  // Special sub-case for coffee / cafe (derived dynamically from all registered locales)
  if (COFFEE_REGEX.test(categoryName)) {
    return <Coffee size={size} color={ICON_COLORS['Coffee']} />
  }

  // 3. Dynamically resolve canonical category across all supported languages
  const canonical = resolveCanonicalCategory(categoryName)
  const IconComponent = CANONICAL_CATEGORY_ICONS[canonical] || Package
  return <IconComponent size={size} color={categoryColor} />
}

export function getMerchantBrandInfo(name: string): MerchantBrandInfo {
  const nameTrimmed = name.trim()
  const nameLower = nameTrimmed.toLowerCase()
  const merchant = POPULAR_MERCHANTS.find(
    (m) =>
      nameLower.includes(m.keyword.toLowerCase()) ||
      m.name.toLowerCase().includes(nameLower)
  )

  const words = nameTrimmed.split(/\s+/)
  const initials =
    words.length > 1
      ? `${words[0][0] || ''}${words[1][0] || ''}`.toUpperCase()
      : (nameTrimmed.slice(0, 2) || 'TX').toUpperCase()

  if (merchant) {
    const logoComponent =
      merchant.logo && MERCHANT_LOGOS[merchant.logo]
        ? MERCHANT_LOGOS[merchant.logo]
        : merchant.icon && AVAILABLE_ICONS[merchant.icon]
          ? AVAILABLE_ICONS[merchant.icon]
          : undefined
    const brandColor =
      merchant.brandColor ||
      (merchant.icon ? ICON_COLORS[merchant.icon] : undefined) ||
      '#6366f1'

    return {
      merchant,
      logoComponent,
      brandColor,
      suggestedCategory: merchant.category,
      initials,
    }
  }

  // Generate deterministic dynamic brand color from merchant name
  const fallbackPalette = [
    '#6366f1',
    '#10b981',
    '#f59e0b',
    '#ec4899',
    '#3b82f6',
    '#8b5cf6',
    '#06b6d4',
    '#14b8a6',
    '#f43f5e',
    '#a855f7',
  ]
  let hash = 0
  for (let i = 0; i < nameTrimmed.length; i++) {
    hash = nameTrimmed.charCodeAt(i) + ((hash << 5) - hash)
  }
  const brandColor = fallbackPalette[Math.abs(hash) % fallbackPalette.length]

  return {
    brandColor,
    initials,
  }
}
