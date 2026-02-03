'use client'

import { useRouter } from 'next/navigation'
import { useCurrency } from '@/contexts/CurrencyContext'

interface SavingsItem {
  id: string
  name: string
  type: string
  goalAmount: number
  amountSaved: number
}

interface SavingsProgressProps {
  savings: SavingsItem[]
}

const typeColors: Record<string, { bg: string; progress: string; text: string }> = {
  EMERGENCY: {
    bg: 'bg-rose-500/10',
    progress: 'from-rose-500 to-pink-500',
    text: 'text-rose-400',
  },
  SINKING: {
    bg: 'bg-amber-500/10',
    progress: 'from-amber-500 to-orange-500',
    text: 'text-amber-400',
  },
  LONG_TERM: {
    bg: 'bg-emerald-500/10',
    progress: 'from-emerald-500 to-teal-500',
    text: 'text-emerald-400',
  },
}

const typeLabels: Record<string, string> = {
  EMERGENCY: 'Emergency',
  SINKING: 'Sinking',
  LONG_TERM: 'Long-term',
}

export function SavingsProgress({ savings }: SavingsProgressProps) {
  const { formatCompact } = useCurrency()
  const router = useRouter()
  
  return (
    <div className="space-y-4">
      {savings.map((item) => {
        const percentage = Math.min(100, Math.round((item.amountSaved / item.goalAmount) * 100))
        const colors = typeColors[item.type] || typeColors.SINKING

        return (
          <div key={item.id} className={`p-4 rounded-xl ${colors.bg}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-white font-medium">{item.name}</h3>
                <span className={`text-xs ${colors.text}`}>
                  {typeLabels[item.type] || item.type}
                </span>
              </div>
              <span className="text-white font-bold">{percentage}%</span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-2">
              <div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colors.progress} rounded-full transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Amount Info */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">
                {formatCompact(item.amountSaved)}
              </span>
              <span className="text-gray-400">
                Goal: {formatCompact(item.goalAmount)}
              </span>
            </div>
          </div>
        )
      })}

      {/* Add New Savings Goal */}
      <button 
        onClick={() => router.push('/savings')}
        className="w-full py-3 rounded-xl border-2 border-dashed border-white/20 text-gray-400 hover:border-white/40 hover:text-white transition-colors text-sm"
      >
        + Add New Savings Goal
      </button>
    </div>
  )
}
