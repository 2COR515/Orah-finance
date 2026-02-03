// Supported currencies for OrahFinance
export interface CurrencyConfig {
  code: string
  name: string
  symbol: string
  locale: string
  decimals: number
  flag: string
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  KES: {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KSh',
    locale: 'en-KE',
    decimals: 0,
    flag: '🇰🇪',
  },
  UGX: {
    code: 'UGX',
    name: 'Ugandan Shilling',
    symbol: 'UGX',
    locale: 'en-UG',
    decimals: 0,
    flag: '🇺🇬',
  },
  TZS: {
    code: 'TZS',
    name: 'Tanzanian Shilling',
    symbol: 'TSh',
    locale: 'en-TZ',
    decimals: 0,
    flag: '🇹🇿',
  },
  RWF: {
    code: 'RWF',
    name: 'Rwandan Franc',
    symbol: 'FRw',
    locale: 'rw-RW',
    decimals: 0,
    flag: '🇷🇼',
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    locale: 'en-US',
    decimals: 2,
    flag: '🇺🇸',
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    locale: 'en-EU',
    decimals: 2,
    flag: '🇪🇺',
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    locale: 'en-GB',
    decimals: 2,
    flag: '🇬🇧',
  },
  NGN: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    locale: 'en-NG',
    decimals: 0,
    flag: '🇳🇬',
  },
  ZAR: {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    locale: 'en-ZA',
    decimals: 2,
    flag: '🇿🇦',
  },
  GHS: {
    code: 'GHS',
    name: 'Ghanaian Cedi',
    symbol: 'GH₵',
    locale: 'en-GH',
    decimals: 2,
    flag: '🇬🇭',
  },
}

export const DEFAULT_CURRENCY = 'KES'

export function getCurrency(code: string): CurrencyConfig {
  return SUPPORTED_CURRENCIES[code] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY]
}

export function formatCurrency(amount: number, currencyCode: string = DEFAULT_CURRENCY): string {
  const currency = getCurrency(currencyCode)
  
  // For currencies with no decimals, divide by 1 (amount stored as-is)
  // For currencies with decimals, divide by 100 (amount stored in cents)
  const displayAmount = currency.decimals > 0 ? amount / 100 : amount
  
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(displayAmount)
}

export function formatCompactCurrency(amount: number, currencyCode: string = DEFAULT_CURRENCY): string {
  const currency = getCurrency(currencyCode)
  const displayAmount = currency.decimals > 0 ? amount / 100 : amount
  
  const formatter = new Intl.NumberFormat(currency.locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  })
  
  return `${currency.symbol} ${formatter.format(displayAmount)}`
}

// Convert display amount to storage amount (cents for decimal currencies)
export function toStorageAmount(displayAmount: number, currencyCode: string = DEFAULT_CURRENCY): number {
  const currency = getCurrency(currencyCode)
  return currency.decimals > 0 ? Math.round(displayAmount * 100) : Math.round(displayAmount)
}

// Convert storage amount to display amount
export function toDisplayAmount(storageAmount: number, currencyCode: string = DEFAULT_CURRENCY): number {
  const currency = getCurrency(currencyCode)
  return currency.decimals > 0 ? storageAmount / 100 : storageAmount
}
