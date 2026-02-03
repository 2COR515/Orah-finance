'use client'

import { DollarSign, TrendingUp, Briefcase, Building, Gift, RefreshCw } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface IncomeData {
  category: string
  label: string
  total: number
  color: string
}

interface IncomeAnalysisProps {
  data: IncomeData[]
  totalIncome: number
}

const CATEGORY_ICONS: Record<string, any> = {
  SALARY: Briefcase,
  BUSINESS: Building,
  FREELANCE: TrendingUp,
  INVESTMENTS: TrendingUp,
  GIFTS: Gift,
  REFUNDS: RefreshCw,
  SIDE_HUSTLE: DollarSign,
  RENTAL: Building,
  BONUS: Gift,
  OTHER: DollarSign,
}

export function IncomeAnalysis({ data, totalIncome }: IncomeAnalysisProps) {
  const { formatCompact, format } = useCurrency()

  if (data.length === 0) {
    return (
      <div className="card-elevated rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 tracking-tight">Income Analysis</h2>
        <div className="text-center py-8 text-zinc-500">
          <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No income recorded yet</p>
          <p className="text-sm mt-1 text-zinc-600">Add your first income to see analysis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-elevated rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white tracking-tight">Income Analysis</h2>
        <span className="text-emerald-400 font-semibold text-lg">{formatCompact(totalIncome)}</span>
      </div>

      <div className="flex gap-6">
        {/* Pie Chart */}
        <div className="w-36 h-36 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={3}
                dataKey="total"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="card-elevated rounded-lg px-3 py-2 shadow-xl">
                        <p className="text-white text-sm font-medium">{data.label}</p>
                        <p className="text-emerald-400 text-sm">{format(data.total)}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category List */}
        <div className="flex-1 space-y-3 overflow-hidden">
          {data.slice(0, 4).map((item) => {
            const IconComponent = CATEGORY_ICONS[item.category] || DollarSign
            const percentage = totalIncome > 0 ? Math.round((item.total / totalIncome) * 100) : 0
            
            return (
              <div key={item.category} className="flex items-center gap-3 group">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <IconComponent className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-zinc-300 truncate">{item.label}</span>
                    <span className="text-xs text-zinc-500 ml-2 font-medium">{percentage}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Income Sources Summary */}
      <div className="mt-6 pt-4 border-t border-zinc-800">
        <div className="flex justify-between text-xs text-zinc-500">
          <span>{data.length} income source{data.length !== 1 ? 's' : ''}</span>
          <span>Avg: {formatCompact(totalIncome / Math.max(data.length, 1))}/source</span>
        </div>
      </div>
    </div>
  )
}
