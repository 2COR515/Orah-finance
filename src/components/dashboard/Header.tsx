'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Wallet, Bell, ChevronDown, LogOut, User, Settings, Sparkles, Crown, Shield } from 'lucide-react'
import { CurrencySelector } from '@/components/ui/CurrencySelector'

interface HeaderProps {
  timePeriod: 'week' | 'month' | 'year'
  onTimePeriodChange: (period: 'week' | 'month' | 'year') => void
}

export function Header({ timePeriod, onTimePeriodChange }: HeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showPeriodMenu, setShowPeriodMenu] = useState(false)
  
  const periodLabels = {
    week: 'This Week',
    month: 'This Month',
    year: 'This Year',
  }

  const periods: ('week' | 'month' | 'year')[] = ['week', 'month', 'year']

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/login' })
  }

  return (
    <header className="flex items-center justify-between py-5 mb-4">
      {/* Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300" />
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-xl">
            <Wallet className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 tracking-tight">OrahFinance</h1>
          <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Personal Finance
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Currency Selector */}
        <CurrencySelector />

        {/* Time Period Selector - Dropdown */}
        <div className="relative">
          <button 
            className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm flex items-center gap-2 text-sm text-gray-300 hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300"
            onClick={() => setShowPeriodMenu(!showPeriodMenu)}
          >
            <span className="font-medium">{periodLabels[timePeriod]}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showPeriodMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Period Dropdown */}
          {showPeriodMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowPeriodMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 evervault-card rounded-xl shadow-2xl z-50 py-2 overflow-hidden">
                {periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      onTimePeriodChange(period)
                      setShowPeriodMenu(false)
                    }}
                    className={`w-full px-4 py-3 text-left text-sm transition-all duration-200 ${
                      timePeriod === period
                        ? 'bg-gradient-to-r from-violet-500/20 to-indigo-500/10 text-violet-400 border-l-2 border-violet-500'
                        : 'text-gray-400 hover:bg-white/[0.05] hover:text-white border-l-2 border-transparent'
                    }`}
                  >
                    <span className="font-medium">{periodLabels[period]}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <button className="relative w-11 h-11 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm flex items-center justify-center hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300 group">
          <Bell className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full">
            <span className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full animate-ping opacity-75" />
          </span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 via-indigo-500 to-purple-600 flex items-center justify-center">
                {session?.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt="User" 
                    className="w-8 h-8 rounded-lg"
                  />
                ) : (
                  <span className="text-sm font-bold text-white">
                    {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
            </div>
            <span className="text-sm font-medium text-gray-300 hidden sm:block">
              {session?.user?.name || session?.user?.email?.split('@')[0] || 'User'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-60 evervault-card rounded-xl shadow-2xl z-50 py-2 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.08]">
                  <p className="text-sm font-semibold text-white">{session?.user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{session?.user?.email}</p>
                </div>
                
                <div className="py-1">
                  <button 
                    onClick={() => {
                      setShowUserMenu(false)
                      router.push('/profile')
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:bg-white/[0.05] hover:text-white transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="font-medium">Profile</span>
                  </button>
                  <button 
                    onClick={() => {
                      setShowUserMenu(false)
                      router.push('/subscription')
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:bg-white/[0.05] hover:text-white transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <Crown className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="font-medium">Subscription</span>
                  </button>
                  <button 
                    onClick={() => {
                      setShowUserMenu(false)
                      router.push('/settings')
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:bg-white/[0.05] hover:text-white transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Settings className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="font-medium">Settings</span>
                  </button>
                  {(session?.user as any)?.role === 'ADMIN' && (
                    <button 
                      onClick={() => {
                        setShowUserMenu(false)
                        router.push('/admin')
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:bg-white/[0.05] hover:text-white transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-rose-400" />
                      </div>
                      <span className="font-medium">Admin Panel</span>
                    </button>
                  )}
                </div>

                <div className="border-t border-white/[0.08] py-1">
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                      <LogOut className="w-4 h-4 text-rose-400" />
                    </div>
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
