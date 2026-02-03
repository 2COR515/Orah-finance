import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { AuthProvider } from '@/components/providers/AuthProvider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'OrahFinance - Personal Finance Dashboard',
  description: 'A comprehensive personal finance management system for tracking expenses, savings, and financial goals.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <CurrencyProvider>
            <div className="min-h-screen bg-[#08080c] bg-grid relative">
              {/* Gradient orbs for ambient effect */}
              <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px]" />
                <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px]" />
              </div>
              <div className="relative z-10">
                {children}
              </div>
            </div>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
