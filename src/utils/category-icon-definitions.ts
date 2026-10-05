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
  GraduationCap,
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
  Percent,
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
  Zap,
} from 'lucide-react'

import { translations } from '../i18n/translations'
import type { IconComponent } from './brand-logos/types'

export const AVAILABLE_ICONS: Record<string, IconComponent> = {
  // Finance
  PiggyBank, CreditCard, Briefcase, Landmark, Wallet, Banknote, Coins, Receipt, Percent,
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
  // Entertainment & Education
  Film, Music, Gamepad2, Tv, Ticket, Headphones, BookOpen, Book, GraduationCap,
  // Miscellaneous
  Package, MapPin, Star, Anchor, Dumbbell, Smile, Trophy, Users,
}

export const ICON_GROUPS = [
  {
    name: 'Finance',
    icons: ['PiggyBank', 'CreditCard', 'Briefcase', 'Landmark', 'Wallet', 'Banknote', 'Coins', 'Receipt', 'Percent'],
  },
  {
    name: 'Home & Utilities',
    icons: ['Home', 'Zap', 'Droplet', 'Flame', 'Wifi', 'Wrench', 'Trash2', 'Key', 'Building2'],
  },
  {
    name: 'Food & Drink',
    icons: ['ShoppingCart', 'Utensils', 'Coffee', 'Wine', 'Pizza', 'Apple', 'Carrot'],
  },
  {
    name: 'Transportation',
    icons: ['Car', 'Train', 'Plane', 'Bike', 'Bus', 'Ship', 'Fuel'],
  },
  {
    name: 'Shopping',
    icons: ['ShoppingBag', 'Gift', 'Tag', 'Shirt', 'Smartphone', 'Monitor'],
  },
  {
    name: 'Health & Wellness',
    icons: ['HeartPulse', 'Heart', 'Stethoscope', 'Pill', 'Activity', 'Syringe', 'Dumbbell'],
  },
  {
    name: 'Entertainment',
    icons: ['Film', 'Music', 'Gamepad2', 'Tv', 'Ticket', 'Headphones', 'BookOpen', 'Book', 'GraduationCap'],
  },
  {
    name: 'Miscellaneous',
    icons: ['Package', 'MapPin', 'Star', 'Anchor', 'Smile', 'Trophy', 'Users'],
  },
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
  Loans: Landmark,
  Taxes: Receipt,
  Groceries: ShoppingCart,
  'Dining Out': Utensils,
  DiningOut: Utensils,
  Shopping: ShoppingBag,
  Healthcare: HeartPulse,
  Education: GraduationCap,
  Transport: Car,
  Entertainment: Film,
  Insurance: Building2,
  Utilities: Zap,
  Communication: Wifi,
  Internet: Wifi,
  Savings: PiggyBank,
  Cash: Banknote,
  Transfers: CreditCard,
  Travel: Plane,
  Crypto: Coins,
  'Bank Fees': Percent,
  BankFees: Percent,
  Fees: Percent,
  Other: Package,
}
