import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, format } from 'date-fns'
import type { Expense, Savings, SavingsDeposit } from '@prisma/client'

type SavingsWithDeposits = Savings & { deposits: SavingsDeposit[] }

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const period = searchParams.get('period') || 'month' // week, month, year

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (period) {
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 })
        endDate = endOfWeek(now, { weekStartsOn: 1 })
        break
      case 'year':
        startDate = startOfYear(now)
        endDate = endOfYear(now)
        break
      default: // month
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
    }

    // Get expenses for the period
    const expenses: Expense[] = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Get all savings for the user
    const savings: SavingsWithDeposits[] = await prisma.savings.findMany({
      where: { userId },
      include: {
        deposits: {
          where: {
            dateSaved: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    })

    // Calculate totals
    const totalExpenses = expenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0)
    const totalSavingsDeposits = savings.reduce(
      (sum: number, s: SavingsWithDeposits) => sum + s.deposits.reduce((dSum: number, d: SavingsDeposit) => dSum + d.amount, 0),
      0
    )
    const totalSaved = savings.reduce((sum: number, s: SavingsWithDeposits) => sum + s.amountSaved, 0)

    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc: Record<string, number>, exp: Expense) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      return acc
    }, {})

    const categoryTotals = Object.entries(expensesByCategory)
      .map(([category, total]) => ({
        category,
        total: total as number,
        percentage: totalExpenses > 0 ? Math.round(((total as number) / totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)

    // Group savings by type
    const savingsByType = savings.reduce((acc: Record<string, { total: number; goalTotal: number }>, s: SavingsWithDeposits) => {
      if (!acc[s.type]) {
        acc[s.type] = { total: 0, goalTotal: 0 }
      }
      acc[s.type].total += s.amountSaved
      acc[s.type].goalTotal += s.goalAmount
      return acc
    }, {})

    const savingsTypeTotals = Object.entries(savingsByType).map(([type, data]) => ({
      type,
      total: (data as { total: number; goalTotal: number }).total,
      goalTotal: (data as { total: number; goalTotal: number }).goalTotal,
      percentage: (data as { total: number; goalTotal: number }).goalTotal > 0 ? Math.round(((data as { total: number; goalTotal: number }).total / (data as { total: number; goalTotal: number }).goalTotal) * 100) : 0,
    }))

    // Get monthly trend (last 6 months)
    const monthlyTrend = await getMonthlyTrend(userId, 6)

    // Get recent transactions (last 10)
    const recentExpenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10,
    })

    const recentDeposits = await prisma.savingsDeposit.findMany({
      where: {
        savings: { userId },
      },
      include: {
        savings: { select: { name: true } },
      },
      orderBy: { dateSaved: 'desc' },
      take: 10,
    })

    const recentTransactions = [
      ...recentExpenses.map((e) => ({
        id: e.id,
        type: 'EXPENSE' as const,
        amount: e.amount,
        currency: e.currency,
        description: e.description,
        category: e.category,
        date: e.date,
      })),
      ...recentDeposits.map((d) => ({
        id: d.id,
        type: 'SAVINGS_DEPOSIT' as const,
        amount: d.amount,
        currency: d.currency,
        description: d.note || `Deposit to ${d.savings.name}`,
        category: null,
        date: d.dateSaved,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)

    return NextResponse.json({
      success: true,
      data: {
        period: { start: startDate, end: endDate },
        summary: {
          totalExpenses,
          totalSavingsDeposits,
          totalSaved,
          netChange: totalSavingsDeposits - totalExpenses,
        },
        expensesByCategory: categoryTotals,
        savingsByType: savingsTypeTotals,
        monthlyTrend,
        recentTransactions,
        savingsGoals: savings.map((s) => ({
          id: s.id,
          name: s.name,
          type: s.type,
          goalAmount: s.goalAmount,
          amountSaved: s.amountSaved,
          progress: s.goalAmount > 0 ? Math.round((s.amountSaved / s.goalAmount) * 100) : 0,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

async function getMonthlyTrend(userId: string, months: number) {
  const trend = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(now, i)
    const start = startOfMonth(date)
    const end = endOfMonth(date)

    const [expenses, deposits] = await Promise.all([
      prisma.expense.aggregate({
        where: {
          userId,
          date: { gte: start, lte: end },
        },
        _sum: { amount: true },
      }),
      prisma.savingsDeposit.aggregate({
        where: {
          savings: { userId },
          dateSaved: { gte: start, lte: end },
        },
        _sum: { amount: true },
      }),
    ])

    trend.push({
      month: format(date, 'MMM'),
      year: date.getFullYear(),
      expenses: expenses._sum.amount || 0,
      savings: deposits._sum.amount || 0,
    })
  }

  return trend
}
