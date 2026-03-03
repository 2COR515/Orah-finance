'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { KeyRound, Loader2, ArrowLeft, Mail, Check, Eye, EyeOff, Shield, Sparkles } from 'lucide-react'

type Step = 'email' | 'code' | 'password' | 'done'

export default function ForgotPasswordPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
  ]

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send reset code')

      setStep('code')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword: password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to reset password')

      setStep('done')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/3 -left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[128px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Login</span>
        </Link>

        {/* Icon */}
        <div className="text-center mb-8">
          <div className="relative inline-block group">
            <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-amber-600 rounded-3xl blur opacity-40 group-hover:opacity-60 transition duration-500" />
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-amber-500">
              <KeyRound className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mt-6">
            {step === 'done' ? 'Password Reset!' : 'Forgot Password'}
          </h1>
          <p className="text-gray-500 mt-2">
            {step === 'email' && "Enter your email and we'll send a reset code"}
            {step === 'code' && 'Enter the code from your email and set a new password'}
            {step === 'password' && 'Enter the code and your new password'}
            {step === 'done' && 'Your password has been reset successfully'}
          </p>
        </div>

        {/* Steps Progress */}
        {step !== 'done' && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {['email', 'code'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === s
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                    : (s === 'email' && step !== 'email')
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/[0.03] text-gray-500 border border-white/[0.08]'
                }`}>
                  {(s === 'email' && step !== 'email') ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < 1 && <div className={`w-12 h-0.5 ${step !== 'email' ? 'bg-emerald-500/30' : 'bg-white/[0.08]'}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="evervault-card rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="relative w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-600 transition-all duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-indigo-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send Reset Code
                    </>
                  )}
                </span>
              </button>
            </form>
          )}

          {/* Step 2: Code + New Password */}
          {step === 'code' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                  className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 text-center text-2xl tracking-[0.5em] font-bold"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-gray-600 text-xs mt-2">Enter the 6-digit code sent to {email}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password requirements */}
                {password && (
                  <div className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password Strength</span>
                    </div>
                    <div className="space-y-1.5">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${req.met ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                            {req.met && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className={req.met ? 'text-emerald-400' : 'text-gray-500'}>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                  className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300"
                  placeholder="••••••••"
                  required
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-2 text-xs text-rose-400 font-medium">Passwords do not match</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="px-6 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-gray-300 font-semibold hover:bg-white/[0.06] transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length < 6 || !password || password !== confirmPassword}
                  className="relative flex-1 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-600" />
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-indigo-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-5 h-5" />
                        Reset Password
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Done */}
          {step === 'done' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Password Reset Successful!</h2>
              <p className="text-gray-500 mb-6">You can now sign in with your new password.</p>
              <button
                onClick={() => router.push('/auth/login')}
                className="relative w-full py-4 rounded-xl font-semibold text-white overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-600" />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Go to Login</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
