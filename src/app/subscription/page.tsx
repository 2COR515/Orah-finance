'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Crown,
  Check,
  X,
  Zap,
  Shield,
  Star,
  Sparkles,
  Loader2,
  Phone,
  CreditCard,
  AlertTriangle,
  ChevronRight,
  Infinity,
  BarChart3,
  Download,
  Bell,
  Palette,
  Clock,
  Globe,
  RefreshCw,
  Receipt,
} from 'lucide-react'

interface Subscription {
  tier: string
  status: string
  isActive: boolean
  endDate: string | null
  trialEndsAt: string | null
  priceKES: number
  autoRenew: boolean
  cancelledAt: string | null
  limits: Record<string, any>
}

interface TierConfig {
  tier: string
  name: string
  priceKES: number
  description: string
  features: string[]
  limits: Record<string, any>
}

export default function SubscriptionPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [tiers, setTiers] = useState<TierConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCancel, setShowCancel] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchSubscription()
    }
  }, [session])

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscription')
      if (res.ok) {
        const data = await res.json()
        setSubscription(data.subscription)
        setTiers(data.availableTiers)
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (tier: string) => {
    setActionLoading(tier)
    setError('')
    setSuccess('')

    try {
      // If phone number provided, use M-Pesa
      if (phoneNumber) {
        const res = await fetch('/api/mpesa/pay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier, phoneNumber }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Payment failed')
        setSuccess(`M-Pesa payment initiated! Check your phone for the STK push prompt. ${data.checkoutRequestID ? `Reference: ${data.checkoutRequestID}` : ''}`)
        setShowPayment(null)
        setPhoneNumber('')
      } else {
        // Direct subscription (for demo/testing)
        const res = await fetch('/api/subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier, paymentMethod: 'MPESA', transactionRef: `DEMO-${Date.now()}` }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Subscription failed')
        setSuccess(`Successfully subscribed to ${data.subscription?.tier || tier} plan!`)
        setShowPayment(null)
      }
      await fetchSubscription()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async () => {
    setActionLoading('cancel')
    setError('')
    try {
      const res = await fetch('/api/subscription', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to cancel')
      setSuccess('Subscription cancelled. You can still use your plan until the end of the billing period.')
      setShowCancel(false)
      await fetchSubscription()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleResume = async () => {
    setActionLoading('resume')
    setError('')
    try {
      const res = await fetch('/api/subscription', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resume' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to resume')
      setSuccess('Subscription resumed successfully!')
      await fetchSubscription()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleAutoRenew = async () => {
    setActionLoading('toggle')
    try {
      const res = await fetch('/api/subscription', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_auto_renew' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')
      await fetchSubscription()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center animate-pulse">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400 font-medium">Loading plans...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/login')
    return null
  }

  const currentTier = subscription?.tier || 'FREE'
  const isActive = subscription?.isActive || currentTier === 'FREE'

  const tierOrder = ['FREE', 'BASIC', 'MEDIUM', 'PREMIUM']
  const currentTierIndex = tierOrder.indexOf(currentTier)

  const allTiers: TierConfig[] = [
    {
      tier: 'FREE',
      name: 'Free',
      priceKES: 0,
      description: 'Try OrahFinance with limited features',
      features: [
        'Up to 20 expenses/month',
        'Up to 10 incomes/month',
        '1 savings goal',
        '1 budget',
        'Last 30 days history',
        'KES currency only',
      ],
      limits: {},
    },
    ...tiers,
  ]

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'FREE': return Zap
      case 'BASIC': return Shield
      case 'MEDIUM': return Star
      case 'PREMIUM': return Crown
      default: return Zap
    }
  }

  const getTierGradient = (tier: string) => {
    switch (tier) {
      case 'FREE': return 'from-gray-500 to-gray-600'
      case 'BASIC': return 'from-blue-500 to-indigo-500'
      case 'MEDIUM': return 'from-violet-500 to-purple-500'
      case 'PREMIUM': return 'from-amber-500 to-orange-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getTierBorder = (tier: string) => {
    switch (tier) {
      case 'FREE': return 'border-gray-500/30'
      case 'BASIC': return 'border-blue-500/30'
      case 'MEDIUM': return 'border-violet-500/50'
      case 'PREMIUM': return 'border-amber-500/50'
      default: return 'border-gray-500/30'
    }
  }

  const getTierGlow = (tier: string) => {
    switch (tier) {
      case 'MEDIUM': return 'shadow-violet-500/20'
      case 'PREMIUM': return 'shadow-amber-500/20'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[128px]" />

      <div className="max-w-6xl mx-auto relative z-10">
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
        <div className="text-center mb-12">
          <div className="relative inline-block group mb-4">
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-600 to-violet-600 rounded-3xl blur opacity-40 group-hover:opacity-60 transition duration-500" />
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-violet-500">
              <Crown className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-3">
            Choose Your Plan
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Unlock the full power of OrahFinance. Choose a plan that fits your financial management needs.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 font-medium flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-medium flex items-center gap-3">
            <Check className="w-5 h-5 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Current Plan Banner */}
        {subscription && (
          <div className={`max-w-2xl mx-auto mb-10 evervault-card rounded-2xl p-6 border ${getTierBorder(currentTier)}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getTierGradient(currentTier)} flex items-center justify-center`}>
                  {(() => {
                    const Icon = getTierIcon(currentTier)
                    return <Icon className="w-7 h-7 text-white" />
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{currentTier} Plan</h3>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      subscription.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      subscription.status === 'TRIAL' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      subscription.status === 'CANCELLED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {subscription.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    {subscription.endDate && (
                      <p className="text-gray-500 text-sm flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {subscription.status === 'TRIAL' ? 'Trial ends' : 'Renews'}: {new Date(subscription.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                    {subscription.priceKES > 0 && (
                      <p className="text-gray-500 text-sm">KSh {subscription.priceKES}/month</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {subscription.status === 'CANCELLED' && (
                  <button
                    onClick={handleResume}
                    disabled={actionLoading === 'resume'}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold hover:bg-emerald-500/30 transition-all text-sm disabled:opacity-50"
                  >
                    {actionLoading === 'resume' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Resume'}
                  </button>
                )}
                {subscription.status === 'ACTIVE' && currentTier !== 'FREE' && (
                  <>
                    <button
                      onClick={handleToggleAutoRenew}
                      disabled={actionLoading === 'toggle'}
                      className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-gray-400 font-semibold hover:bg-white/[0.06] transition-all text-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${subscription.autoRenew ? 'text-emerald-400' : 'text-gray-500'}`} />
                      Auto-renew {subscription.autoRenew ? 'On' : 'Off'}
                    </button>
                    <button
                      onClick={() => setShowCancel(true)}
                      className="px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold hover:bg-rose-500/20 transition-all text-sm"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {allTiers.map((tier) => {
            const TierIcon = getTierIcon(tier.tier)
            const isCurrent = tier.tier === currentTier
            const isUpgrade = tierOrder.indexOf(tier.tier) > currentTierIndex
            const isDowngrade = tierOrder.indexOf(tier.tier) < currentTierIndex
            const isPopular = tier.tier === 'MEDIUM'

            return (
              <div
                key={tier.tier}
                className={`relative evervault-card rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-4px] ${
                  isCurrent
                    ? `border-2 ${getTierBorder(tier.tier)} shadow-lg ${getTierGlow(tier.tier)}`
                    : isPopular
                    ? 'border border-violet-500/40 shadow-lg shadow-violet-500/10'
                    : 'border border-white/[0.08]'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-lg shadow-violet-500/30">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {/* Current Badge */}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <span className={`px-3 py-1.5 bg-gradient-to-r ${getTierGradient(tier.tier)} text-white text-xs font-bold rounded-full`}>
                      CURRENT
                    </span>
                  </div>
                )}

                {/* Tier Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getTierGradient(tier.tier)} flex items-center justify-center mb-4`}>
                  <TierIcon className="w-7 h-7 text-white" />
                </div>

                {/* Tier Name & Price */}
                <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{tier.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      {tier.priceKES === 0 ? 'Free' : `KSh ${tier.priceKES}`}
                    </span>
                    {tier.priceKES > 0 && (
                      <span className="text-gray-500 text-sm">/month</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm">
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isCurrent || isUpgrade
                          ? `bg-gradient-to-br ${getTierGradient(tier.tier)}`
                          : 'bg-gray-700'
                      }`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className={isCurrent ? 'text-white' : 'text-gray-400'}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <div className="mt-auto">
                  {isCurrent ? (
                    <div className={`w-full py-3.5 rounded-xl bg-gradient-to-r ${getTierGradient(tier.tier)} text-white font-semibold text-center text-sm opacity-80`}>
                      Current Plan
                    </div>
                  ) : tier.tier === 'FREE' ? (
                    <div className="w-full py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-gray-500 font-semibold text-center text-sm">
                      Default Plan
                    </div>
                  ) : showPayment === tier.tier ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="07XXXXXXXX"
                          className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                        />
                      </div>
                      <button
                        onClick={() => handleSubscribe(tier.tier)}
                        disabled={!!actionLoading}
                        className={`w-full py-3 rounded-xl bg-gradient-to-r ${getTierGradient(tier.tier)} text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
                      >
                        {actionLoading === tier.tier ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            Pay with M-Pesa
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => { setShowPayment(null); setPhoneNumber('') }}
                        className="w-full py-2 text-gray-500 text-sm hover:text-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowPayment(tier.tier)}
                      className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                        isUpgrade
                          ? `bg-gradient-to-r ${getTierGradient(tier.tier)} text-white hover:opacity-90 shadow-lg ${getTierGlow(tier.tier)}`
                          : 'bg-white/[0.03] border border-white/[0.08] text-gray-300 hover:bg-white/[0.06]'
                      } flex items-center justify-center gap-2`}
                    >
                      {isUpgrade ? (
                        <>
                          <Zap className="w-4 h-4" />
                          Upgrade
                        </>
                      ) : (
                        'Switch Plan'
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Feature Comparison */}
        <div className="evervault-card rounded-2xl p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Feature Comparison</h2>
          <p className="text-gray-500 mb-8">See what&apos;s included in each plan</p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">Feature</th>
                  <th className="text-center py-4 px-3 text-gray-400 font-semibold text-sm">Free</th>
                  <th className="text-center py-4 px-3 text-blue-400 font-semibold text-sm">Basic</th>
                  <th className="text-center py-4 px-3 text-violet-400 font-semibold text-sm">Medium</th>
                  <th className="text-center py-4 px-3 text-amber-400 font-semibold text-sm">Premium</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { label: 'Expenses/month', values: ['20', '50', '∞', '∞'], icon: Receipt },
                  { label: 'Income entries/month', values: ['10', '30', '∞', '∞'], icon: CreditCard },
                  { label: 'Savings goals', values: ['1', '1', '3', '∞'], icon: Shield },
                  { label: 'Budgets', values: ['1', '2', '3', '∞'], icon: BarChart3 },
                  { label: 'Currencies', values: ['1', '1', '3', '∞'], icon: Globe },
                  { label: 'History', values: ['30 days', '30 days', '6 months', '∞'], icon: Clock },
                  { label: 'Charts & Analytics', values: [false, false, true, true], icon: BarChart3 },
                  { label: 'CSV Export', values: [false, false, true, true], icon: Download },
                  { label: 'PDF Export', values: [false, false, false, true], icon: Download },
                  { label: 'Budget Alerts', values: [false, false, true, true], icon: Bell },
                  { label: 'Custom Categories', values: [false, false, true, true], icon: Palette },
                  { label: 'Push Notifications', values: [false, false, true, true], icon: Bell },
                  { label: 'Financial Insights', values: [false, false, false, true], icon: Sparkles },
                  { label: 'Ad-free', values: [false, false, true, true], icon: X },
                  { label: 'Priority Support', values: [false, false, false, true], icon: Star },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 text-gray-300 font-medium flex items-center gap-2">
                      <row.icon className="w-4 h-4 text-gray-500" />
                      {row.label}
                    </td>
                    {row.values.map((val, j) => (
                      <td key={j} className="text-center py-3.5 px-3">
                        {typeof val === 'boolean' ? (
                          val ? (
                            <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-600 mx-auto" />
                          )
                        ) : val === '∞' ? (
                          <span className="text-emerald-400 font-bold">∞</span>
                        ) : (
                          <span className="text-gray-300">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="evervault-card rounded-2xl p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'How does the free trial work?',
                a: 'New accounts get a 7-day trial. After the trial ends, your account defaults to the Free plan. You can upgrade at any time.',
              },
              {
                q: 'Can I cancel my subscription?',
                a: 'Yes! You can cancel anytime. Your plan will remain active until the end of the current billing period.',
              },
              {
                q: 'How do I pay?',
                a: 'We accept M-Pesa payments. Simply enter your phone number and confirm the payment on your phone.',
              },
              {
                q: 'Can I switch between plans?',
                a: 'Yes, you can upgrade or switch plans at any time. Your new plan takes effect immediately.',
              },
              {
                q: 'What happens to my data if I downgrade?',
                a: 'Your existing data is preserved. However, new entries will be subject to the limits of your new plan.',
              },
            ].map((faq, i) => (
              <div key={i} className="p-5 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm pb-8">
          <p>All prices are in Kenyan Shillings (KES)</p>
          <p className="mt-1">Need help? Contact support at support@orahfinance.com</p>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="evervault-card rounded-2xl p-8 max-w-md w-full">
            <div className="w-14 h-14 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Cancel Subscription?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to cancel your <span className="text-white font-semibold">{currentTier}</span> plan?
              You&apos;ll still have access until {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'the end of your billing period'}.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={actionLoading === 'cancel'}
                className="flex-1 py-3.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold hover:bg-rose-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === 'cancel' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Cancel'}
              </button>
              <button
                onClick={() => setShowCancel(false)}
                className="flex-1 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white font-semibold hover:bg-white/[0.06] transition-all"
              >
                Keep Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
