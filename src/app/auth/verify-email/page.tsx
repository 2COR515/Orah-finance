'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Mail, Loader2, Sparkles, ArrowLeft, RefreshCw, Check, Shield } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [countdown, setCountdown] = useState(0)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only allow digits

    const newCode = [...code]
    newCode[index] = value.slice(-1) // Take only last digit
    setCode(newCode)
    setError('')

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all filled
    if (newCode.every((c) => c !== '') && index === 5) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length === 6) {
      const newCode = pastedData.split('')
      setCode(newCode)
      inputRefs.current[5]?.focus()
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (verificationCode: string) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setSuccess('Email verified successfully! Redirecting...')

      // Auto sign in
      const password = searchParams.get('p')
      if (password) {
        await signIn('credentials', { email, password, redirect: false })
      }

      setTimeout(() => router.push('/'), 2000)
    } catch (err: any) {
      setError(err.message)
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setResending(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to resend code')

      setSuccess('New verification code sent! Check your email.')
      setCountdown(60)
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()

      setTimeout(() => setSuccess(''), 5000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px]" />

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
            <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-emerald-600 rounded-3xl blur opacity-40 group-hover:opacity-60 transition duration-500" />
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-emerald-500">
              <Mail className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mt-6">
            Verify Your Email
          </h1>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto">
            We sent a 6-digit verification code to{' '}
            <span className="text-violet-400 font-semibold">{email || 'your email'}</span>
          </p>
        </div>

        {/* Code Input */}
        <div className="evervault-card rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-medium flex items-center gap-2">
              <Check className="w-4 h-4" />
              {success}
            </div>
          )}

          <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading || !!success}
                className={`w-12 h-14 text-center text-2xl font-bold rounded-xl transition-all duration-300 ${
                  digit
                    ? 'bg-violet-500/10 border-2 border-violet-500/50 text-white'
                    : 'bg-white/[0.03] border-2 border-white/[0.08] text-white'
                } focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 disabled:opacity-50`}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={() => handleVerify(code.join(''))}
            disabled={loading || code.some((c) => !c) || !!success}
            className="relative w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-600 transition-all duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : success ? (
                <>
                  <Check className="w-5 h-5" />
                  Verified!
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Verify Email
                </>
              )}
            </span>
          </button>

          {/* Resend */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm mb-2">Didn&apos;t receive the code?</p>
            <button
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </button>
          </div>
        </div>

        {/* Help text */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Check your spam folder if you don&apos;t see the email.
            <br />
            <Link href="/auth/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
              Try a different email
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
