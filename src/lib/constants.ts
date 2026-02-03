import { ExpenseCategory, SavingsType } from '@prisma/client'

// Expense category display names and colors
export const EXPENSE_CATEGORIES: Record<ExpenseCategory, { label: string; color: string; icon: string }> = {
  FOOD: { label: 'Food', color: '#f97316', icon: 'UtensilsCrossed' },
  OFFERINGS_HONORARIUM: { label: 'Honorarium', color: '#8b5cf6', icon: 'Gift' },
  OFFERINGS_BRICK_LAYERS: { label: 'Brick Layers', color: '#a855f7', icon: 'Hammer' },
  OFFERINGS_SUNDAY: { label: 'Sunday Offering', color: '#c084fc', icon: 'Church' },
  OFFERINGS_TUESDAY: { label: 'Tuesday Offering', color: '#d8b4fe', icon: 'Church' },
  TRANSPORT: { label: 'Transport', color: '#3b82f6', icon: 'Car' },
  COMMUNICATION_SMS: { label: 'SMS', color: '#06b6d4', icon: 'MessageSquare' },
  COMMUNICATION_CALLS: { label: 'Calls', color: '#0891b2', icon: 'Phone' },
  COMMUNICATION_BUNDLES: { label: 'Bundles', color: '#0e7490', icon: 'Wifi' },
  TITHES: { label: 'Tithes', color: '#10b981', icon: 'Heart' },
  OTHER_GIVING_BIRTHDAYS: { label: 'Birthdays', color: '#f43f5e', icon: 'Cake' },
  OTHER_GIVING_FUNERALS: { label: 'Funerals', color: '#64748b', icon: 'Flower2' },
  OTHER_GIVING_LUNCH: { label: 'Lunch Treats', color: '#f59e0b', icon: 'Coffee' },
  RENT: { label: 'Rent', color: '#ef4444', icon: 'Home' },
  MISCELLANEOUS: { label: 'Miscellaneous', color: '#6b7280', icon: 'MoreHorizontal' },
}

// Savings type display names and colors
export const SAVINGS_TYPES: Record<SavingsType, { label: string; color: string; description: string }> = {
  EMERGENCY: {
    label: 'Emergency Fund',
    color: '#ef4444',
    description: 'For unexpected expenses and emergencies',
  },
  SINKING: {
    label: 'Sinking Fund',
    color: '#f59e0b',
    description: 'For planned future expenses',
  },
  LONG_TERM: {
    label: 'Long-term Savings',
    color: '#10b981',
    description: 'For major life goals and investments',
  },
}

// Group expense categories
export const EXPENSE_GROUPS = {
  'Offerings': ['OFFERINGS_HONORARIUM', 'OFFERINGS_BRICK_LAYERS', 'OFFERINGS_SUNDAY', 'OFFERINGS_TUESDAY'],
  'Communication': ['COMMUNICATION_SMS', 'COMMUNICATION_CALLS', 'COMMUNICATION_BUNDLES'],
  'Other Giving': ['OTHER_GIVING_BIRTHDAYS', 'OTHER_GIVING_FUNERALS', 'OTHER_GIVING_LUNCH'],
  'Essential': ['FOOD', 'TRANSPORT', 'RENT'],
  'Spiritual': ['TITHES'],
  'Other': ['MISCELLANEOUS'],
}

// Time period options for filtering
export const TIME_PERIODS = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
] as const

export type TimePeriod = typeof TIME_PERIODS[number]['value']
