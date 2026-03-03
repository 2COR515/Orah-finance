'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Shield,
  Users,
  CreditCard,
  TrendingUp,
  Search,
  Loader2,
  Crown,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserCheck,
  UserX,
  Sparkles,
  BarChart3,
  Activity,
  DollarSign,
  AlertTriangle,
} from 'lucide-react'

interface OverviewStats {
  totalUsers: number
  verifiedUsers: number
  activeSubscriptions: number
  totalRevenue: number
  monthlyRevenue: number
  monthlyPayments: number
}

interface OverviewData {
  stats: OverviewStats
  tierBreakdown: Array<{ tier: string; _count: number }>
  recentPayments: any[]
  recentUsers: any[]
}

interface UserItem {
  id: string
  name: string | null
  email: string
  role: string
  emailVerified: boolean
  createdAt: string
  subscription: {
    tier: string
    status: string
    endDate: string
  } | null
  _count: {
    expenses: number
    incomes: number
    savings: number
  }
}

interface Payment {
  id: string
  amount: number
  currency: string
  method: string
  status: string
  tier: string
  description: string
  paidAt: string | null
  createdAt: string
  user: { name: string | null; email: string }
}

type Tab = 'overview' | 'users' | 'payments'

export default function AdminPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()

  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [users, setUsers] = useState<UserItem[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  useEffect(() => {
    if (authStatus === 'authenticated') {
      if (!isAdmin) {
        router.push('/')
        return
      }
      fetchData()
    }
  }, [authStatus, tab, page, search])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ view: tab })
      if (tab === 'users') {
        params.set('page', String(page))
        params.set('limit', '10')
        if (search) params.set('search', search)
      }
      if (tab === 'payments') {
        params.set('page', String(page))
        params.set('limit', '10')
      }

      const res = await fetch(`/api/admin?${params}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to fetch')
      }
      const data = await res.json()

      if (tab === 'overview') setOverview(data)
      if (tab === 'users') { setUsers(data.users); setTotalPages(data.pagination.totalPages) }
      if (tab === 'payments') { setPayments(data.payments); setTotalPages(data.pagination.totalPages) }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: string) => {
    setActionLoading(userId)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Action failed')
      setSuccess(`Action "${action}" completed successfully`)
      fetchData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center animate-pulse">
          <Shield className="w-8 h-8 text-white" />
        </div>
      </div>
    )
  }

  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="evervault-card rounded-2xl p-8 max-w-md text-center">
          <div className="w-14 h-14 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">You don&apos;t have admin privileges.</p>
          <Link href="/" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: BarChart3 },
    { id: 'users' as Tab, label: 'Users', icon: Users },
    { id: 'payments' as Tab, label: 'Payments', icon: CreditCard },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[128px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.06] transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 to-orange-600 rounded-2xl blur opacity-40" />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Admin Dashboard</h1>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  OrahFinance Management
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 font-medium text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-medium text-sm">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setPage(1); setSearch('') }}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                tab === t.id
                  ? 'bg-gradient-to-r from-rose-500/20 to-orange-500/20 border border-rose-500/30 text-white'
                  : 'bg-white/[0.03] border border-white/[0.08] text-gray-400 hover:bg-white/[0.06]'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <>
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : overview && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Total Users', value: overview.stats.totalUsers, icon: Users, gradient: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/30', color: 'text-blue-400' },
                    { label: 'Active Subscriptions', value: overview.stats.activeSubscriptions, icon: Crown, gradient: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', color: 'text-amber-400' },
                    { label: 'Total Revenue', value: `KSh ${(overview.stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, gradient: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30', color: 'text-emerald-400' },
                    { label: 'Verified Users', value: overview.stats.verifiedUsers, icon: Activity, gradient: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30', color: 'text-violet-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="evervault-card rounded-xl p-5">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} border ${stat.border} flex items-center justify-center mb-3`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Tier Breakdown */}
                <div className="evervault-card rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Subscription Tiers</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {overview.tierBreakdown.map((item) => {
                      const colors: Record<string, string> = {
                        FREE: 'from-gray-500 to-gray-600',
                        BASIC: 'from-blue-500 to-indigo-500',
                        MEDIUM: 'from-violet-500 to-purple-500',
                        PREMIUM: 'from-amber-500 to-orange-500',
                      }
                      return (
                        <div key={item.tier} className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[item.tier] || colors.FREE} flex items-center justify-center mb-2`}>
                            <Crown className="w-5 h-5 text-white" />
                          </div>
                          <p className="text-xl font-bold text-white">{item._count}</p>
                          <p className="text-sm text-gray-500">{item.tier}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search users by name or email..."
                className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {users.map((user) => (
                    <div key={user.id} className="evervault-card rounded-xl p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-semibold">{user.name || 'No name'}</p>
                              {user.role === 'ADMIN' && (
                                <span className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-md">ADMIN</span>
                              )}
                              {user.emailVerified && (
                                <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-md">VERIFIED</span>
                              )}
                            </div>
                            <p className="text-gray-500 text-sm">{user.email}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                              <span>📊 {user._count.expenses} expenses</span>
                              <span>💰 {user._count.incomes} incomes</span>
                              <span>🎯 {user._count.savings} savings</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                            user.subscription
                              ? user.subscription.tier === 'PREMIUM'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : user.subscription.tier === 'MEDIUM'
                                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {user.subscription?.tier || 'FREE'}
                          </span>

                          {!user.emailVerified && (
                            <button
                              onClick={() => handleUserAction(user.id, 'verify-email')}
                              disabled={actionLoading === user.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                            >
                              {actionLoading === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Verify'}
                            </button>
                          )}

                          {user.role !== 'ADMIN' ? (
                            <button
                              onClick={() => handleUserAction(user.id, 'make-admin')}
                              disabled={actionLoading === user.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all disabled:opacity-50"
                            >
                              Make Admin
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(user.id, 'remove-admin')}
                              disabled={actionLoading === user.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-500/10 border border-gray-500/20 text-gray-400 hover:bg-gray-500/20 transition-all disabled:opacity-50"
                            >
                              Remove Admin
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {users.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-semibold">No users found</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                      className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:bg-white/[0.06] disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-400 font-medium">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page >= totalPages}
                      className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:bg-white/[0.06] disabled:opacity-30 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Payments Tab */}
        {tab === 'payments' && (
          <>
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {payments.map((payment) => (
                    <div key={payment.id} className="evervault-card rounded-xl p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-semibold">KSh {payment.amount.toLocaleString()}</p>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              payment.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                              payment.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-rose-500/20 text-rose-400'
                            }`}>
                              {payment.status}
                            </span>
                          </div>
                          <p className="text-gray-500 text-sm">{payment.user.name || payment.user.email} — {payment.description}</p>
                          <p className="text-gray-600 text-xs mt-1">
                            {payment.method} • {new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold self-start ${
                          payment.tier === 'PREMIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          payment.tier === 'MEDIUM' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' :
                          'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {payment.tier}
                        </span>
                      </div>
                    </div>
                  ))}

                  {payments.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                      <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-semibold">No payments yet</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                      className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:bg-white/[0.06] disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-400 font-medium">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page >= totalPages}
                      className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:bg-white/[0.06] disabled:opacity-30 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
