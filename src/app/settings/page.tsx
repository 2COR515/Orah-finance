'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCurrency } from '@/contexts/CurrencyContext'
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Globe,
  Bell,
  Shield,
  Palette,
  Check,
  Moon,
  Sun,
  Smartphone,
  Sparkles,
  Crown,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'

const currencies = [
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
]

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { currency, setCurrency } = useCurrency()
  
  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications: {
      email: true,
      budgetAlerts: true,
      savingsReminders: true,
      weeklyReports: false,
    },
    privacy: {
      showBalance: true,
    },
  })
  
  const [saved, setSaved] = useState(false)

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center animate-pulse">
            <SettingsIcon className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/login')
    return null
  }

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency)
    showSaved()
  }

  const handleNotificationChange = (key: string) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key as keyof typeof settings.notifications],
      },
    })
    showSaved()
  }

  const showSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[128px]" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.06] group-hover:border-white/[0.15] transition-all duration-300">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-medium">Back to Dashboard</span>
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300" />
              <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center">
                <SettingsIcon className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Settings</h1>
              <p className="text-gray-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Customize your OrahFinance experience
              </p>
            </div>
          </div>
          
          {saved && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl font-semibold">
              <Check className="w-4 h-4" />
              Saved!
            </div>
          )}
        </div>

        {/* Subscription */}
        <Link href="/subscription" className="block mb-6 group">
          <div className="evervault-card rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Subscription</h2>
                  <p className="text-gray-500 text-sm">Manage your plan and billing</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </Link>

        {/* Currency Settings */}
        <div className="evervault-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Currency</h2>
              <p className="text-gray-500 text-sm">Choose your default currency</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => handleCurrencyChange(curr.code)}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  currency.code === curr.code
                    ? 'bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-violet-500/50 text-white'
                    : 'bg-white/[0.02] border-white/[0.05] text-gray-400 hover:bg-white/[0.05] hover:border-white/[0.1]'
                }`}
              >
                <div className="text-2xl font-bold mb-1">{curr.symbol}</div>
                <div className="text-sm font-semibold">{curr.code}</div>
                <div className="text-xs opacity-70">{curr.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Theme Settings */}
        <div className="evervault-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center">
              <Palette className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Appearance</h2>
              <p className="text-gray-500 text-sm">Customize the look and feel</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setSettings({ ...settings, theme: 'dark' })}
              className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 ${
                settings.theme === 'dark'
                  ? 'bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-violet-500/50 text-white'
                  : 'bg-white/[0.02] border-white/[0.05] text-gray-400 hover:bg-white/[0.05]'
              }`}
            >
              <Moon className="w-6 h-6" />
              <span className="text-sm font-semibold">Dark</span>
            </button>
            
            <button
              onClick={() => setSettings({ ...settings, theme: 'light' })}
              className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 ${
                settings.theme === 'light'
                  ? 'bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-violet-500/50 text-white'
                  : 'bg-white/[0.02] border-white/[0.05] text-gray-400 hover:bg-white/[0.05]'
              }`}
            >
              <Sun className="w-6 h-6" />
              <span className="text-sm font-semibold">Light</span>
            </button>
            
            <button
              onClick={() => setSettings({ ...settings, theme: 'system' })}
              className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 ${
                settings.theme === 'system'
                  ? 'bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-violet-500/50 text-white'
                  : 'bg-white/[0.02] border-white/[0.05] text-gray-400 hover:bg-white/[0.05]'
              }`}
            >
              <Smartphone className="w-6 h-6" />
              <span className="text-sm font-semibold">System</span>
            </button>
          </div>
          
          <p className="text-gray-600 text-sm mt-4">
            Note: Theme switching is currently in development. Dark mode is the default.
          </p>
        </div>

        {/* Notification Settings */}
        <div className="evervault-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Notifications</h2>
              <p className="text-gray-500 text-sm">Manage your notification preferences</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
              { key: 'budgetAlerts', label: 'Budget Alerts', description: 'Get notified when approaching budget limits' },
              { key: 'savingsReminders', label: 'Savings Reminders', description: 'Reminders to make savings deposits' },
              { key: 'weeklyReports', label: 'Weekly Reports', description: 'Receive weekly spending summaries' },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.03] transition-all duration-300"
              >
                <div>
                  <p className="text-white font-semibold">{item.label}</p>
                  <p className="text-gray-500 text-sm">{item.description}</p>
                </div>
                <button
                  onClick={() => handleNotificationChange(item.key)}
                  className={`w-14 h-7 rounded-full transition-all duration-300 relative ${
                    settings.notifications[item.key as keyof typeof settings.notifications]
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500'
                      : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-lg ${
                      settings.notifications[item.key as keyof typeof settings.notifications]
                        ? 'translate-x-8'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
          
          <p className="text-gray-600 text-sm mt-4">
            Note: Email notifications require email verification (coming soon).
          </p>
        </div>

        {/* Privacy Settings */}
        <div className="evervault-card rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Privacy & Security</h2>
              <p className="text-gray-500 text-sm">Manage your account security</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.03] transition-all duration-300">
              <div>
                <p className="text-white font-semibold">Show Balance on Dashboard</p>
                <p className="text-gray-500 text-sm">Display your total balance prominently</p>
              </div>
              <button
                onClick={() => setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, showBalance: !settings.privacy.showBalance }
                })}
                className={`w-14 h-7 rounded-full transition-all duration-300 relative ${
                  settings.privacy.showBalance
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500'
                    : 'bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-lg ${
                    settings.privacy.showBalance
                      ? 'translate-x-8'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <Link
              href="/auth/change-password"
              className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.03] transition-all duration-300 group"
            >
              <div>
                <p className="text-white font-semibold">Change Password</p>
                <p className="text-gray-500 text-sm">Update your account password</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-500 rotate-180 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl">
              <div>
                <p className="text-rose-400 font-semibold">Delete Account</p>
                <p className="text-rose-400/60 text-sm">Permanently delete your account and data</p>
              </div>
              <button className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-xl transition-all duration-300 text-sm font-semibold">
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center text-gray-600 text-sm">
          <p className="font-semibold">OrahFinance v1.0.0</p>
          <p className="mt-1">© 2024 OrahFinance. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
