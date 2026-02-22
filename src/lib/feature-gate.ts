import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { SubscriptionTier } from '@prisma/client'
import { getTierLimits, isSubscriptionActive, isWithinLimit, TierLimits } from '@/lib/subscription'

/**
 * Get the current user's subscription tier.
 * Returns FREE if no subscription exists or subscription is expired.
 */
export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription) return 'FREE'
  if (!isSubscriptionActive(subscription.endDate, subscription.status)) return 'FREE'

  return subscription.tier
}

/**
 * Get the current user's subscription with full details
 */
export async function getUserSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription) {
    return {
      tier: 'FREE' as SubscriptionTier,
      status: 'EXPIRED' as const,
      isActive: false,
      limits: getTierLimits('FREE'),
      endDate: null,
      trialEndsAt: null,
    }
  }

  const isActive = isSubscriptionActive(subscription.endDate, subscription.status)

  return {
    ...subscription,
    isActive,
    limits: getTierLimits(isActive ? subscription.tier : 'FREE'),
  }
}

/**
 * Check if user can perform an action based on their subscription tier
 */
export async function checkFeatureAccess(
  userId: string,
  feature: keyof TierLimits
): Promise<{ allowed: boolean; tier: SubscriptionTier; message?: string }> {
  const tier = await getUserTier(userId)
  const limits = getTierLimits(tier)
  const value = limits[feature]

  if (typeof value === 'boolean') {
    return {
      allowed: value,
      tier,
      message: value ? undefined : `This feature requires a higher subscription plan. Current: ${tier}`,
    }
  }

  return { allowed: true, tier }
}

/**
 * Check if user can create more of a resource (expenses, incomes, savings, budgets)
 */
export async function checkResourceLimit(
  userId: string,
  resource: 'expenses' | 'incomes' | 'savings' | 'budgets'
): Promise<{ allowed: boolean; tier: SubscriptionTier; remaining: number; message?: string }> {
  const tier = await getUserTier(userId)
  const limits = getTierLimits(tier)

  // Get current count for the resource this month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  let currentCount = 0

  switch (resource) {
    case 'expenses':
      currentCount = await prisma.expense.count({
        where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
      })
      break
    case 'incomes':
      currentCount = await prisma.income.count({
        where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
      })
      break
    case 'savings':
      currentCount = await prisma.savings.count({
        where: { userId, isActive: true },
      })
      break
    case 'budgets':
      currentCount = await prisma.budget.count({
        where: { userId, month: now.getMonth() + 1, year: now.getFullYear() },
      })
      break
  }

  const allowed = isWithinLimit(tier, resource, currentCount)

  const limitMap: Record<string, number> = {
    expenses: limits.maxExpensesPerMonth,
    incomes: limits.maxIncomesPerMonth,
    savings: limits.maxSavingsGoals,
    budgets: limits.maxBudgets,
  }

  const limit = limitMap[resource]
  const remaining = limit === -1 ? Infinity : Math.max(0, limit - currentCount)

  return {
    allowed,
    tier,
    remaining,
    message: allowed
      ? undefined
      : `You've reached your ${resource} limit (${limit}) for the ${tier} plan. Upgrade to add more.`,
  }
}

/**
 * Create a FREE subscription for new users automatically
 */
export async function createDefaultSubscription(userId: string) {
  const existing = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (existing) return existing

  const trialEnd = new Date()
  trialEnd.setDate(trialEnd.getDate() + 7)

  return prisma.subscription.create({
    data: {
      userId,
      tier: 'FREE',
      status: 'TRIAL',
      priceKES: 0,
      trialEndsAt: trialEnd,
      endDate: trialEnd,
    },
  })
}
