import { SubscriptionTier } from '@prisma/client'

// ==================== Subscription Tier Configuration ====================

export interface TierConfig {
  tier: SubscriptionTier
  name: string
  priceKES: number
  description: string
  features: string[]
  limits: TierLimits
}

export interface TierLimits {
  maxExpensesPerMonth: number    // -1 = unlimited
  maxIncomesPerMonth: number     // -1 = unlimited
  maxSavingsGoals: number        // -1 = unlimited
  maxBudgets: number             // -1 = unlimited
  allowedSavingsTypes: string[]
  maxCurrencies: number          // -1 = unlimited
  transactionHistoryDays: number // -1 = unlimited
  canExportCSV: boolean
  canExportPDF: boolean
  canViewCharts: boolean
  canViewTrends: boolean
  canCustomCategories: boolean
  canRecurringExpenses: boolean
  canPushNotifications: boolean
  canBudgetAlerts: boolean
  canFinancialInsights: boolean
  showAds: boolean
  prioritySupport: boolean
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierConfig> = {
  FREE: {
    tier: 'FREE',
    name: 'Free',
    priceKES: 0,
    description: 'Try OrahFinance with limited features',
    features: [
      'Up to 20 expenses/month',
      'Up to 10 incomes/month',
      '1 savings goal (Emergency only)',
      'Last 7 days history',
      'KES currency only',
    ],
    limits: {
      maxExpensesPerMonth: 20,
      maxIncomesPerMonth: 10,
      maxSavingsGoals: 1,
      maxBudgets: 0,
      allowedSavingsTypes: ['EMERGENCY'],
      maxCurrencies: 1,
      transactionHistoryDays: 7,
      canExportCSV: false,
      canExportPDF: false,
      canViewCharts: false,
      canViewTrends: false,
      canCustomCategories: false,
      canRecurringExpenses: false,
      canPushNotifications: false,
      canBudgetAlerts: false,
      canFinancialInsights: false,
      showAds: true,
      prioritySupport: false,
    },
  },
  BASIC: {
    tier: 'BASIC',
    name: 'Basic',
    priceKES: 50,
    description: 'Essential finance tracking',
    features: [
      'Up to 50 expenses/month',
      'Up to 30 incomes/month',
      '1 savings goal (Emergency only)',
      'Last 30 days history',
      'KES currency only',
      'Basic dashboard stats',
      'Ads supported',
    ],
    limits: {
      maxExpensesPerMonth: 50,
      maxIncomesPerMonth: 30,
      maxSavingsGoals: 1,
      maxBudgets: 0,
      allowedSavingsTypes: ['EMERGENCY'],
      maxCurrencies: 1,
      transactionHistoryDays: 30,
      canExportCSV: false,
      canExportPDF: false,
      canViewCharts: false,
      canViewTrends: false,
      canCustomCategories: false,
      canRecurringExpenses: false,
      canPushNotifications: false,
      canBudgetAlerts: false,
      canFinancialInsights: false,
      showAds: true,
      prioritySupport: false,
    },
  },
  MEDIUM: {
    tier: 'MEDIUM',
    name: 'Medium',
    priceKES: 100,
    description: 'Full analytics & budgeting',
    features: [
      'Unlimited expenses & income',
      '3 savings goals',
      'Emergency + Sinking funds',
      '3 budgets with alerts',
      'Charts & analytics',
      'CSV export (monthly)',
      '3 currencies',
      '6 months history',
      'Budget alerts',
      'Custom categories',
      'Ad-free experience',
    ],
    limits: {
      maxExpensesPerMonth: -1,
      maxIncomesPerMonth: -1,
      maxSavingsGoals: 3,
      maxBudgets: 3,
      allowedSavingsTypes: ['EMERGENCY', 'SINKING'],
      maxCurrencies: 3,
      transactionHistoryDays: 180,
      canExportCSV: true,
      canExportPDF: false,
      canViewCharts: true,
      canViewTrends: false,
      canCustomCategories: true,
      canRecurringExpenses: false,
      canPushNotifications: true,
      canBudgetAlerts: true,
      canFinancialInsights: false,
      showAds: false,
      prioritySupport: false,
    },
  },
  PREMIUM: {
    tier: 'PREMIUM',
    name: 'Premium',
    priceKES: 200,
    description: 'Everything unlocked',
    features: [
      'Unlimited everything',
      'All savings types',
      'Unlimited budgets',
      'Advanced charts & trends',
      'PDF + CSV export (custom range)',
      'All currencies',
      'Full history',
      'Push notifications',
      'Recurring expenses',
      'Financial insights & tips',
      'Ad-free experience',
      'Priority support',
    ],
    limits: {
      maxExpensesPerMonth: -1,
      maxIncomesPerMonth: -1,
      maxSavingsGoals: -1,
      maxBudgets: -1,
      allowedSavingsTypes: ['EMERGENCY', 'SINKING', 'LONG_TERM'],
      maxCurrencies: -1,
      transactionHistoryDays: -1,
      canExportCSV: true,
      canExportPDF: true,
      canViewCharts: true,
      canViewTrends: true,
      canCustomCategories: true,
      canRecurringExpenses: true,
      canPushNotifications: true,
      canBudgetAlerts: true,
      canFinancialInsights: true,
      showAds: false,
      prioritySupport: true,
    },
  },
}

// ==================== Helper Functions ====================

/**
 * Get tier configuration by tier name
 */
export function getTierConfig(tier: SubscriptionTier): TierConfig {
  return SUBSCRIPTION_TIERS[tier]
}

/**
 * Get tier limits by tier name
 */
export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return SUBSCRIPTION_TIERS[tier].limits
}

/**
 * Check if a feature is available for a given tier
 */
export function hasFeature(tier: SubscriptionTier, feature: keyof TierLimits): boolean {
  const limits = getTierLimits(tier)
  const value = limits[feature]
  
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (Array.isArray(value)) return value.length > 0
  return false
}

/**
 * Check if user has reached their limit for a resource
 */
export function isWithinLimit(tier: SubscriptionTier, resource: 'expenses' | 'incomes' | 'savings' | 'budgets', currentCount: number): boolean {
  const limits = getTierLimits(tier)
  
  const limitMap: Record<string, number> = {
    expenses: limits.maxExpensesPerMonth,
    incomes: limits.maxIncomesPerMonth,
    savings: limits.maxSavingsGoals,
    budgets: limits.maxBudgets,
  }

  const limit = limitMap[resource]
  if (limit === -1) return true // unlimited
  return currentCount < limit
}

/**
 * Get remaining count for a resource
 */
export function getRemainingCount(tier: SubscriptionTier, resource: 'expenses' | 'incomes' | 'savings' | 'budgets', currentCount: number): number {
  const limits = getTierLimits(tier)
  
  const limitMap: Record<string, number> = {
    expenses: limits.maxExpensesPerMonth,
    incomes: limits.maxIncomesPerMonth,
    savings: limits.maxSavingsGoals,
    budgets: limits.maxBudgets,
  }

  const limit = limitMap[resource]
  if (limit === -1) return Infinity
  return Math.max(0, limit - currentCount)
}

/**
 * Get all subscription tier options for display
 */
export function getAllTiers(): TierConfig[] {
  return Object.values(SUBSCRIPTION_TIERS).filter(t => t.tier !== 'FREE')
}

/**
 * Calculate trial end date (7 days from now)
 */
export function getTrialEndDate(): Date {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date
}

/**
 * Calculate subscription end date (1 month from now)
 */
export function getSubscriptionEndDate(fromDate?: Date): Date {
  const date = fromDate ? new Date(fromDate) : new Date()
  date.setMonth(date.getMonth() + 1)
  return date
}

/**
 * Check if subscription is active (not expired)
 */
export function isSubscriptionActive(endDate: Date | null | undefined, status: string): boolean {
  if (status === 'CANCELLED' || status === 'EXPIRED') return false
  if (!endDate) return status === 'ACTIVE' || status === 'TRIAL'
  return new Date(endDate) > new Date()
}
