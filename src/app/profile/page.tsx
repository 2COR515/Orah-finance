'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Edit2, 
  Save, 
  X, 
  ArrowLeft,
  Wallet,
  TrendingUp,
  PiggyBank,
  Sparkles,
  Crown,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'

interface UserStats {
  totalExpenses: number
  totalSavings: number
  totalBudgets: number
  totalTransactions: number
}

interface UserSubscription {
  tier: string
  status: string
  isActive: boolean
  endDate: string | null
  priceKES: number
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
      })
    }
  }, [session])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/profile/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      }
    }

    const fetchSubscription = async () => {
      try {
        const res = await fetch('/api/subscription')
        if (res.ok) {
          const data = await res.json()
          setSubscription(data.subscription)
        }
      } catch (err) {
        console.error('Failed to fetch subscription:', err)
      }
    }
    
    if (session?.user) {
      fetchStats()
      fetchSubscription()
    }
  }, [session])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center animate-pulse">
            <User className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/login')
    return null
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      await update({ name: formData.name })
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: session?.user?.name || '',
      email: session?.user?.email || '',
    })
    setIsEditing(false)
    setError('')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[128px]" />
      
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

        {/* Profile Header */}
        <div className="evervault-card rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-300" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-3xl font-bold">
                  {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
                  {session.user?.name || 'User'}
                </h1>
                <p className="text-gray-500 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {session.user?.email}
                </p>
              </div>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 text-violet-400 hover:from-violet-600/30 hover:to-purple-600/30 transition-all duration-300 font-semibold"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="evervault-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-rose-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.totalExpenses || 0}</p>
            <p className="text-sm text-gray-500 font-medium">Total Expenses</p>
          </div>
          
          <div className="evervault-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.totalSavings || 0}</p>
            <p className="text-sm text-gray-500 font-medium">Savings Goals</p>
          </div>
          
          <div className="evervault-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.totalBudgets || 0}</p>
            <p className="text-sm text-gray-500 font-medium">Active Budgets</p>
          </div>
          
          <div className="evervault-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-violet-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.totalTransactions || 0}</p>
            <p className="text-sm text-gray-500 font-medium">Transactions</p>
          </div>
        </div>

        {/* Subscription Card */}
        <Link href="/subscription" className="block mb-8 group">
          <div className="evervault-card rounded-2xl p-6 hover:border-violet-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  subscription?.tier === 'PREMIUM' ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
                  subscription?.tier === 'MEDIUM' ? 'bg-gradient-to-br from-violet-500 to-purple-500' :
                  subscription?.tier === 'BASIC' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' :
                  'bg-gradient-to-br from-gray-500 to-gray-600'
                }`}>
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">
                    {subscription?.tier || 'FREE'} Plan
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {subscription?.isActive
                      ? subscription.tier === 'FREE'
                        ? 'Upgrade to unlock more features'
                        : `Active — KSh ${subscription.priceKES}/month`
                      : 'Upgrade to unlock more features'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  subscription?.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  subscription?.status === 'TRIAL' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {subscription?.status || 'FREE'}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        </Link>

        {/* Profile Details */}
        <div className="evervault-card rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Account Information</h2>

          {error && (
            <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-medium">
              {success}
            </div>
          )}

          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="flex items-center gap-2 text-gray-500 text-sm font-semibold mb-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300"
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-white text-lg font-medium">{session.user?.name || 'Not set'}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="flex items-center gap-2 text-gray-500 text-sm font-semibold mb-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <p className="text-white text-lg font-medium">{session.user?.email}</p>
              <p className="text-gray-600 text-sm mt-1">Email cannot be changed</p>
            </div>

            {/* Account Security */}
            <div>
              <label className="flex items-center gap-2 text-gray-500 text-sm font-semibold mb-2">
                <Shield className="w-4 h-4" />
                Account Security
              </label>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-semibold">
                  Password Protected
                </span>
                <button className="text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors">
                  Change Password
                </button>
              </div>
            </div>

            {/* Member Since */}
            <div>
              <label className="flex items-center gap-2 text-gray-500 text-sm font-semibold mb-2">
                <Calendar className="w-4 h-4" />
                Member Since
              </label>
              <p className="text-white text-lg font-medium">
                {new Date().toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-4 mt-8 pt-6 border-t border-white/[0.08]">
              <button
                onClick={handleSave}
                disabled={loading}
                className="relative flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 transition-all duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Save className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-gray-300 font-semibold hover:bg-white/[0.06] transition-all duration-300"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
