'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES, getCurrency, formatCurrency, formatCompactCurrency, type CurrencyConfig } from '@/lib/currencies'

interface CurrencyContextType {
  currency: CurrencyConfig
  currencyCode: string
  setCurrency: (code: string) => void
  format: (amount: number) => string
  formatCompact: (amount: number) => string
  availableCurrencies: typeof SUPPORTED_CURRENCIES
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const STORAGE_KEY = 'orahfinance_currency'

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencyCode, setCurrencyCode] = useState<string>(DEFAULT_CURRENCY)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved currency from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && SUPPORTED_CURRENCIES[saved]) {
      setCurrencyCode(saved)
    }
    setIsLoaded(true)
  }, [])

  // Save currency to localStorage when changed
  const setCurrency = (code: string) => {
    if (SUPPORTED_CURRENCIES[code]) {
      setCurrencyCode(code)
      localStorage.setItem(STORAGE_KEY, code)
    }
  }

  const currency = getCurrency(currencyCode)

  const format = (amount: number) => formatCurrency(amount, currencyCode)
  const formatCompact = (amount: number) => formatCompactCurrency(amount, currencyCode)

  // Prevent hydration mismatch by showing default until loaded
  if (!isLoaded) {
    return null
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyCode,
        setCurrency,
        format,
        formatCompact,
        availableCurrencies: SUPPORTED_CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
