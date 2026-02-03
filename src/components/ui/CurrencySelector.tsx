'use client'

import { useState } from 'react'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'

export function CurrencySelector() {
  const [isOpen, setIsOpen] = useState(false)
  const { currency, currencyCode, setCurrency, availableCurrencies } = useCurrency()

  const currencies = Object.values(availableCurrencies)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm flex items-center gap-2 text-sm text-gray-300 hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300"
      >
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="font-medium">{currency.flag} {currency.code}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-72 evervault-card rounded-xl p-2 z-50 max-h-80 overflow-y-auto">
            <div className="px-3 py-2 text-xs text-gray-500 font-semibold uppercase tracking-wider border-b border-white/[0.08] mb-2">
              Select Currency
            </div>
            
            {currencies.map((cur) => (
              <button
                key={cur.code}
                onClick={() => {
                  setCurrency(cur.code)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 mb-1 ${
                  currencyCode === cur.code
                    ? 'bg-gradient-to-r from-violet-500/20 to-indigo-500/10 text-white border border-violet-500/30'
                    : 'text-gray-300 hover:bg-white/[0.05] border border-transparent'
                }`}
              >
                <span className="text-2xl">{cur.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{cur.name}</p>
                  <p className="text-xs text-gray-500">{cur.symbol} ({cur.code})</p>
                </div>
                {currencyCode === cur.code && (
                  <div className="w-6 h-6 rounded-lg bg-violet-500/30 flex items-center justify-center">
                    <Check className="w-4 h-4 text-violet-400" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
