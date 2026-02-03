'use client'

import { useRouter } from 'next/navigation'
import { 
  UtensilsCrossed, 
  Car, 
  Phone, 
  Home, 
  Heart, 
  Gift,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Wallet
} from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'

interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE' | 'SAVINGS_DEPOSIT' | 'SAVINGS_WITHDRAWAL'
  amount: number
  category: string
  description: string
  date: Date
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  FOOD: UtensilsCrossed,
  TRANSPORT: Car,
  COMMUNICATION_BUNDLES: Phone,
  COMMUNICATION_SMS: Phone,
  COMMUNICATION_CALLS: Phone,
  RENT: Home,
  TITHES: Heart,
  OFFERINGS_SUNDAY: Gift,
  OFFERINGS_TUESDAY: Gift,
  OFFERINGS_HONORARIUM: Gift,
  OFFERINGS_BRICK_LAYERS: Gift,
  EMERGENCY: Wallet,
  DEFAULT: MoreHorizontal,
}

const categoryGradients: Record<string, { bg: string; border: string }> = {
  FOOD: { bg: 'from-orange-500/20 to-amber-500/10', border: 'border-orange-500/30' },
  TRANSPORT: { bg: 'from-blue-500/20 to-indigo-500/10', border: 'border-blue-500/30' },
  COMMUNICATION_BUNDLES: { bg: 'from-cyan-500/20 to-teal-500/10', border: 'border-cyan-500/30' },
  COMMUNICATION_SMS: { bg: 'from-cyan-500/20 to-teal-500/10', border: 'border-cyan-500/30' },
  COMMUNICATION_CALLS: { bg: 'from-cyan-500/20 to-teal-500/10', border: 'border-cyan-500/30' },
  RENT: { bg: 'from-red-500/20 to-rose-500/10', border: 'border-red-500/30' },
  TITHES: { bg: 'from-emerald-500/20 to-green-500/10', border: 'border-emerald-500/30' },
  OFFERINGS_SUNDAY: { bg: 'from-violet-500/20 to-purple-500/10', border: 'border-violet-500/30' },
  OFFERINGS_TUESDAY: { bg: 'from-violet-500/20 to-purple-500/10', border: 'border-violet-500/30' },
  OFFERINGS_HONORARIUM: { bg: 'from-violet-500/20 to-purple-500/10', border: 'border-violet-500/30' },
  OFFERINGS_BRICK_LAYERS: { bg: 'from-violet-500/20 to-purple-500/10', border: 'border-violet-500/30' },
  EMERGENCY: { bg: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/30' },
  DEFAULT: { bg: 'from-gray-500/20 to-slate-500/10', border: 'border-gray-500/30' },
}

const categoryTextColors: Record<string, string> = {
  FOOD: 'text-orange-400',
  TRANSPORT: 'text-blue-400',
  COMMUNICATION_BUNDLES: 'text-cyan-400',
  COMMUNICATION_SMS: 'text-cyan-400',
  COMMUNICATION_CALLS: 'text-cyan-400',
  RENT: 'text-red-400',
  TITHES: 'text-emerald-400',
  OFFERINGS_SUNDAY: 'text-violet-400',
  OFFERINGS_TUESDAY: 'text-violet-400',
  OFFERINGS_HONORARIUM: 'text-violet-400',
  OFFERINGS_BRICK_LAYERS: 'text-violet-400',
  EMERGENCY: 'text-emerald-400',
  DEFAULT: 'text-gray-400',
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { formatCompact } = useCurrency()
  const router = useRouter()
  
  const formatDate = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-2">
      {transactions.slice(0, 5).map((transaction) => {
        const Icon = categoryIcons[transaction.category] || categoryIcons.DEFAULT
        const gradient = categoryGradients[transaction.category] || categoryGradients.DEFAULT
        const textColor = categoryTextColors[transaction.category] || categoryTextColors.DEFAULT
        const isExpense = transaction.type === 'EXPENSE'
        const isSavings = transaction.type === 'SAVINGS_DEPOSIT'

        return (
          <div
            key={transaction.id}
            className="group flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-white/[0.03] to-transparent border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.05] transition-all duration-300"
          >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient.bg} border ${gradient.border} flex items-center justify-center backdrop-blur-sm`}>
              <Icon className={`w-5 h-5 ${textColor}`} />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate group-hover:text-white/90 transition-colors">
                {transaction.description}
              </p>
              <p className="text-gray-500 text-xs font-medium mt-0.5">
                {formatDate(transaction.date)}
              </p>
            </div>

            {/* Amount */}
            <div className="text-right flex items-center gap-2">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isExpense ? 'bg-rose-500/20' : 'bg-emerald-500/20'}`}>
                {isExpense ? (
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <p className={`text-sm font-bold ${isExpense ? 'text-rose-400' : isSavings ? 'text-emerald-400' : 'text-white'}`}>
                {isExpense ? '-' : '+'} {formatCompact(transaction.amount)}
              </p>
            </div>
          </div>
        )
      })}

      {/* View All Link */}
      <button 
        onClick={() => router.push('/expenses')}
        className="group w-full py-3 mt-2 text-center text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all duration-300 border border-white/[0.08] rounded-xl hover:border-white/[0.15] hover:bg-white/[0.02]"
      >
        <span className="inline-flex items-center gap-2">
          View All Transactions
          <ArrowUpRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </span>
      </button>
    </div>
  )
}
