import { ExpenseCategory, SavingsType } from '@prisma/client'

// ==================== Expense Types ====================

export interface Expense {
  id: string
  amount: number
  currency: string
  category: ExpenseCategory
  description: string | null
  date: Date
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface ExpenseWithUser extends Expense {
  user: {
    id: string
    name: string | null
  }
}

export interface CreateExpenseInput {
  amount: number
  category: ExpenseCategory
  description?: string
  date?: Date
}

export interface UpdateExpenseInput {
  amount?: number
  category?: ExpenseCategory
  description?: string
  date?: Date
}

// ==================== Savings Types ====================

export interface Savings {
  id: string
  name: string
  type: SavingsType
  goalAmount: number
  amountSaved: number
  currency: string
  startDate: Date
  targetDate: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface SavingsWithDeposits extends Savings {
  deposits: SavingsDeposit[]
}

export interface SavingsDeposit {
  id: string
  amount: number
  currency: string
  dateSaved: Date
  note: string | null
  createdAt: Date
  savingsId: string
}

export interface CreateSavingsInput {
  name: string
  type: SavingsType
  goalAmount: number
  targetDate?: Date
}

export interface CreateDepositInput {
  amount: number
  note?: string
  dateSaved?: Date
}

// ==================== Dashboard Types ====================

export interface DashboardStats {
  totalExpenses: number
  totalSavings: number
  totalIncome: number
  netWorth: number
  expensesByCategory: CategoryTotal[]
  savingsByType: SavingsTypeTotal[]
  recentTransactions: Transaction[]
  monthlyTrend: MonthlyData[]
}

export interface CategoryTotal {
  category: ExpenseCategory
  total: number
  percentage: number
  count: number
}

export interface SavingsTypeTotal {
  type: SavingsType
  total: number
  goalTotal: number
  percentage: number
}

export interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE' | 'SAVINGS_DEPOSIT' | 'SAVINGS_WITHDRAWAL'
  amount: number
  currency: string
  description: string | null
  category: string | null
  date: Date
}

export interface MonthlyData {
  month: string
  year: number
  expenses: number
  savings: number
  income: number
}

// ==================== Report Types ====================

export interface ReportFilters {
  startDate: Date
  endDate: Date
  categories?: ExpenseCategory[]
  savingsTypes?: SavingsType[]
}

export interface ReportData {
  period: {
    start: Date
    end: Date
  }
  summary: {
    totalExpenses: number
    totalSavings: number
    totalIncome: number
    netChange: number
  }
  expenses: ExpenseReportItem[]
  savings: SavingsReportItem[]
  charts: {
    expensesByCategory: CategoryTotal[]
    monthlyTrend: MonthlyData[]
  }
}

export interface ExpenseReportItem {
  date: string
  category: string
  description: string
  amount: number
}

export interface SavingsReportItem {
  name: string
  type: string
  goalAmount: number
  amountSaved: number
  progress: number
}

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
