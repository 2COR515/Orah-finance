'use client';

import { useState } from 'react';
import { Bell, ChevronDown, Globe } from 'lucide-react';
import { useCurrency, currencies } from '@/context/CurrencyContext';

export default function Header() {
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const { currency, setCurrency } = useCurrency();

  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0];

  return (
    <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">₿</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">OrahFinance</h1>
            <p className="text-slate-400 text-xs">Personal Finance</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Currency Selector */}
          <div className="relative">
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white transition-colors"
            >
              <Globe className="w-4 h-4 text-slate-300" />
              <span className="text-2xl">{currentCurrency.flag}</span>
              <span className="text-sm font-medium">{currentCurrency.code}</span>
              <ChevronDown className="w-4 h-4 text-slate-300" />
            </button>

            {showCurrencyDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-600 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-600">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Select Currency</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {currencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        setCurrency(curr.code);
                        setShowCurrencyDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-700 transition-colors ${
                        currency === curr.code ? 'bg-slate-700' : ''
                      }`}
                    >
                      <span className="text-2xl">{curr.flag}</span>
                      <div className="text-left">
                        <p className="text-white text-sm font-medium">{curr.name}</p>
                        <p className="text-slate-400 text-xs">{curr.symbol} ({curr.code})</p>
                      </div>
                      {currency === curr.code && (
                        <span className="ml-auto text-emerald-400">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Period Selector */}
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white transition-colors">
            <span className="text-sm font-medium">This Month</span>
            <ChevronDown className="w-4 h-4 text-slate-300" />
          </button>

          {/* Notifications */}
          <button className="relative p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-slate-300" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}