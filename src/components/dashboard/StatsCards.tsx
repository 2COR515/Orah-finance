'use client'

import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, DollarSign, BarChart3 } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'

interface StatsCardsProps {
  stats: {
    totalExpenses: number
    totalSavings: number
    totalIncome: number
    expenseChange: number
    savingsChange: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const { formatCompact } = useCurrency()
  
  const netCashflow = stats.totalIncome - stats.totalExpenses
  const savingsRate = stats.totalIncome > 0 
    ? Math.round((stats.totalSavings / stats.totalIncome) * 100) 
    : 0

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Total Income */}
      <div className="card-elevated rounded-2xl p-5 group hover:border-emerald-500/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            Income
          </span>
        </div>
        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Total Income</p>
        <p className="text-white text-2xl font-semibold tracking-tight">{formatCompact(stats.totalIncome)}</p>
      </div>

      {/* Total Expenses */}
      <div className="card-elevated rounded-2xl p-5 group hover:border-rose-500/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
            <ArrowUpRight className="w-5 h-5 text-rose-400" />
          </div>
          <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
            stats.expenseChange < 0 
              ? 'text-emerald-400 bg-emerald-500/10' 
              : 'text-rose-400 bg-rose-500/10'
          }`}>
            {stats.expenseChange < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
            {Math.abs(stats.expenseChange)}%
          </span>
        </div>
        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Expenses</p>
        <p className="text-white text-2xl font-semibold tracking-tight">{formatCompact(stats.totalExpenses)}</p>
      </div>

      {/* Total Savings */}
      <div className="card-elevated rounded-2xl p-5 group hover:border-indigo-500/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
            <PiggyBank className="w-5 h-5 text-indigo-400" />
          </div>
          <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
            stats.savingsChange > 0 
              ? 'text-emerald-400 bg-emerald-500/10' 
              : 'text-rose-400 bg-rose-500/10'
          }`}>
            {stats.savingsChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(stats.savingsChange)}%
          </span>
        </div>
        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Savings</p>
        <p className="text-white text-2xl font-semibold tracking-tight">{formatCompact(stats.totalSavings)}</p>
      </div>

      {/* Net Cashflow */}
      <div className="card-elevated rounded-2xl p-5 group hover:border-purple-500/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            netCashflow >= 0 
              ? 'bg-purple-500/10 group-hover:bg-purple-500/20' 
              : 'bg-orange-500/10 group-hover:bg-orange-500/20'
          }`}>
            <BarChart3 className={`w-5 h-5 ${netCashflow >= 0 ? 'text-purple-400' : 'text-orange-400'}`} />
          </div>
          <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
            netCashflow >= 0 
              ? 'text-purple-400 bg-purple-500/10' 
              : 'text-orange-400 bg-orange-500/10'
          }`}>
            {netCashflow >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {netCashflow >= 0 ? 'Surplus' : 'Deficit'}
          </span>
        </div>
        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Net Cashflow</p>
        <p className={`text-2xl font-semibold tracking-tight ${netCashflow >= 0 ? 'text-purple-400' : 'text-orange-400'}`}>
          {netCashflow >= 0 ? '+' : ''}{formatCompact(netCashflow)}
        </p>
      </div>

      {/* Total Balance - Full Width */}
      <div className="col-span-2 border-gradient rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Total Balance</p>
            <p className="text-white text-3xl font-bold tracking-tight">
              {formatCompact(stats.totalIncome - stats.totalExpenses + stats.totalSavings)}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${savingsRate >= 20 ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                <span className="text-xs text-zinc-400">
                  Savings Rate: <span className={savingsRate >= 20 ? 'text-emerald-400' : 'text-yellow-400'}>{savingsRate}%</span>
                </span>
              </div>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg glow-indigo">
            <Wallet className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}
