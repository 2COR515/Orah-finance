'use client'

import { useState, useEffect } from 'react'
import { Header } from './Header'
import { StatsCards } from './StatsCards'
import { ExpenseChart } from '../charts/ExpenseChart'
import { IncomeAnalysis } from './IncomeAnalysis'
import { SavingsProgress } from '../savings/SavingsProgress'
import { RecentTransactions } from './RecentTransactions'
import { QuickActions } from './QuickActions'
import { Loader2 } from 'lucide-react'

interface DashboardData {
  stats: {
    totalExpenses: number
    totalSavings: number
    totalIncome: number
    expenseChange: number
    savingsChange: number
  }
  expensesByCategory: Array<{
    category: string
    label: string
    total: number
    color: string
  }>
  incomeByCategory: Array<{
    category: string
    label: string
    total: number
    color: string
  }>
  savings: Array<{
    id: string
    name: string
    type: string
    goalAmount: number
    amountSaved: number
  }>
  transactions: Array<{
    id: string
    type: 'EXPENSE' | 'SAVINGS_DEPOSIT' | 'INCOME' | 'SAVINGS_WITHDRAWAL'
    amount: number
    category: string
    description: string
    date: Date
  }>
}

const CATEGORY_COLORS: Record<string, string> = {
  FOOD: '#f97316',
  TRANSPORT: '#3b82f6',
  RENT: '#a855f7',
  TITHES: '#10b981',
  OFFERINGS_SUNDAY: '#8b5cf6',
  OFFERINGS_TUESDAY: '#14b8a6',
  OFFERINGS_HONORARIUM: '#06b6d4',
  OFFERINGS_BRICK_LAYERS: '#6366f1',
  COMMUNICATION_BUNDLES: '#ec4899',
  COMMUNICATION_CALLS: '#f43f5e',
  COMMUNICATION_SMS: '#ef4444',
  OTHER_GIVING_BIRTHDAYS: '#f59e0b',
  OTHER_GIVING_FUNERALS: '#64748b',
  OTHER_GIVING_LUNCH: '#84cc16',
  MISCELLANEOUS: '#6b7280',
}

const CATEGORY_LABELS: Record<string, string> = {
  FOOD: 'Food',
  TRANSPORT: 'Transport',
  RENT: 'Rent',
  TITHES: 'Tithes',
  OFFERINGS_SUNDAY: 'Sunday Offering',
  OFFERINGS_TUESDAY: 'Tuesday Offering',
  OFFERINGS_HONORARIUM: 'Honorarium',
  OFFERINGS_BRICK_LAYERS: 'Brick Layers',
  COMMUNICATION_BUNDLES: 'Data Bundles',
  COMMUNICATION_CALLS: 'Phone Calls',
  COMMUNICATION_SMS: 'SMS',
  OTHER_GIVING_BIRTHDAYS: 'Birthday Gifts',
  OTHER_GIVING_FUNERALS: 'Funeral Contributions',
  OTHER_GIVING_LUNCH: 'Lunch Treats',
  MISCELLANEOUS: 'Miscellaneous',
}

const INCOME_COLORS: Record<string, string> = {
  SALARY: '#10b981',
  BUSINESS: '#3b82f6',
  FREELANCE: '#8b5cf6',
  INVESTMENTS: '#14b8a6',
  GIFTS: '#ec4899',
  REFUNDS: '#f59e0b',
  SIDE_HUSTLE: '#f97316',
  RENTAL: '#6366f1',
  BONUS: '#06b6d4',
  OTHER: '#6b7280',
}

const INCOME_LABELS: Record<string, string> = {
  SALARY: 'Salary',
  BUSINESS: 'Business',
  FREELANCE: 'Freelance',
  INVESTMENTS: 'Investments',
  GIFTS: 'Gifts',
  REFUNDS: 'Refunds',
  SIDE_HUSTLE: 'Side Hustle',
  RENTAL: 'Rental',
  BONUS: 'Bonus',
  OTHER: 'Other',
}

export function Dashboard() {
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('month')
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<DashboardData>({
    stats: {
      totalExpenses: 0,
      totalSavings: 0,
      totalIncome: 0,
      expenseChange: 0,
      savingsChange: 0,
    },
    expensesByCategory: [],
    incomeByCategory: [],
    savings: [],
    transactions: [],
  })

  useEffect(() => {
    fetchDashboardData()
  }, [timePeriod])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Fetch expenses
      const expensesRes = await fetch('/api/expenses')
      const expenses = expensesRes.ok ? await expensesRes.json() : []

      // Fetch savings
      const savingsRes = await fetch('/api/savings')
      const savings = savingsRes.ok ? await savingsRes.json() : []

      // Fetch income
      const incomeRes = await fetch('/api/income')
      const incomeData = incomeRes.ok ? await incomeRes.json() : []

      // Fetch transactions
      const transactionsRes = await fetch('/api/transactions')
      const transactions = transactionsRes.ok ? await transactionsRes.json() : []

      // Calculate stats
      const totalExpenses = expenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)
      const totalSavings = savings.reduce((sum: number, s: { amountSaved: number }) => sum + s.amountSaved, 0)
      const totalIncome = incomeData.reduce((sum: number, i: { amount: number }) => sum + i.amount, 0)

      // Group expenses by category
      const expensesByCategory = Object.entries(
        expenses.reduce((acc: Record<string, number>, e: { category: string; amount: number }) => {
          acc[e.category] = (acc[e.category] || 0) + e.amount
          return acc
        }, {} as Record<string, number>)
      ).map(([category, total]) => ({
        category,
        label: CATEGORY_LABELS[category] || category,
        total: total as number,
        color: CATEGORY_COLORS[category] || '#6b7280',
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6)

      // Group income by category
      const incomeByCategory = Object.entries(
        incomeData.reduce((acc: Record<string, number>, i: { category: string; amount: number }) => {
          acc[i.category] = (acc[i.category] || 0) + i.amount
          return acc
        }, {} as Record<string, number>)
      ).map(([category, total]) => ({
        category,
        label: INCOME_LABELS[category] || category,
        total: total as number,
        color: INCOME_COLORS[category] || '#6b7280',
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6)

      // Format transactions for display (combine expenses and income)
      const recentTransactions = [
        ...expenses.slice(0, 5).map((e: { id: string; amount: number; category: string; description: string; date: string }) => ({
          id: e.id,
          type: 'EXPENSE' as const,
          amount: e.amount,
          category: e.category,
          description: e.description || CATEGORY_LABELS[e.category] || e.category,
          date: new Date(e.date),
        })),
        ...incomeData.slice(0, 5).map((i: { id: string; amount: number; category: string; source: string; description: string; date: string }) => ({
          id: i.id,
          type: 'INCOME' as const,
          amount: i.amount,
          category: i.category,
          description: i.source || i.description || INCOME_LABELS[i.category] || i.category,
          date: new Date(i.date),
        })),
      ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5)

      setData({
        stats: {
          totalExpenses,
          totalSavings,
          totalIncome,
          expenseChange: 0,
          savingsChange: 0,
        },
        expensesByCategory,
        incomeByCategory,
        savings: savings.map((s: { id: string; name: string; type: string; goalAmount: number; amountSaved: number }) => ({
          id: s.id,
          name: s.name,
          type: s.type,
          goalAmount: s.goalAmount,
          amountSaved: s.amountSaved,
        })),
        transactions: recentTransactions,
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-24">
      {/* Header */}
      <Header 
        timePeriod={timePeriod} 
        onTimePeriodChange={setTimePeriod} 
      />

      {/* Stats Overview */}
      <StatsCards stats={data.stats} />

      {/* Income Analysis */}
      <IncomeAnalysis 
        data={data.incomeByCategory} 
        totalIncome={data.stats.totalIncome} 
      />

      {/* Expense Chart - Donut */}
      <section className="card-elevated rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 tracking-tight">Expenditure Breakdown</h2>
        {data.expensesByCategory.length > 0 ? (
          <ExpenseChart data={data.expensesByCategory} />
        ) : (
          <div className="text-center py-8 text-zinc-500">
            <p>No expenses recorded yet</p>
            <p className="text-sm mt-1 text-zinc-600">Add your first expense to see the breakdown</p>
          </div>
        )}
      </section>

      {/* Savings Progress */}
      <section className="card-elevated rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 tracking-tight">Savings Goals</h2>
        {data.savings.length > 0 ? (
          <SavingsProgress savings={data.savings} />
        ) : (
          <div className="text-center py-8 text-zinc-500">
            <p>No savings goals yet</p>
            <p className="text-sm mt-1 text-zinc-600">Create a savings goal to track your progress</p>
          </div>
        )}
      </section>

      {/* Recent Transactions */}
      <section className="card-elevated rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 tracking-tight">Recent Transactions</h2>
        {data.transactions.length > 0 ? (
          <RecentTransactions transactions={data.transactions} />
        ) : (
          <div className="text-center py-8 text-zinc-500">
            <p>No transactions yet</p>
            <p className="text-sm mt-1 text-zinc-600">Your recent activity will appear here</p>
          </div>
        )}
      </section>

      {/* Quick Actions FAB */}
      <QuickActions />
    </div>
  )
}
