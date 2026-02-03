'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Receipt, PiggyBank, TrendingUp, X, DollarSign, Wallet } from 'lucide-react'

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const actions = [
    { icon: DollarSign, label: 'Add Income', gradient: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/30', href: '/income' },
    { icon: Receipt, label: 'Add Expense', gradient: 'from-rose-500 to-pink-500', glow: 'shadow-rose-500/30', href: '/expenses' },
    { icon: PiggyBank, label: 'Add Savings', gradient: 'from-cyan-500 to-blue-500', glow: 'shadow-cyan-500/30', href: '/savings' },
    { icon: Wallet, label: 'Budgets', gradient: 'from-violet-500 to-purple-500', glow: 'shadow-violet-500/30', href: '/budgets' },
    { icon: TrendingUp, label: 'View Reports', gradient: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/30', href: '/reports' },
  ]

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FAB Menu */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Action Buttons */}
        <div className={`flex flex-col-reverse gap-3 mb-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          {actions.map((action, index) => (
            <button
              key={action.label}
              className={`group flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r ${action.gradient} text-white shadow-lg ${action.glow} hover:shadow-xl hover:scale-105 transition-all duration-300`}
              style={{ transitionDelay: `${index * 50}ms` }}
              onClick={() => {
                router.push(action.href)
                setIsOpen(false)
              }}
            >
              <div className="p-1 rounded-lg bg-white/20 backdrop-blur-sm">
                <action.icon className="w-5 h-5" />
              </div>
              <span className="font-semibold">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Main FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all duration-500 ${isOpen ? 'rotate-[135deg] scale-90' : 'hover:scale-110'}`}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
          <Plus className="w-7 h-7 text-white relative z-10" />
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-xl opacity-50 -z-10" />
        </button>
      </div>
    </>
  )
}
