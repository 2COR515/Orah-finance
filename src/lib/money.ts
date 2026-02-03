import { dinero, add, subtract, multiply, toDecimal, Dinero } from 'dinero.js'
import { UGX } from '@dinero.js/currencies'

// Default currency configuration (Uganda Shillings)
export const DEFAULT_CURRENCY = UGX

// Create a Dinero object from cents
export function createMoney(amount: number, currency = DEFAULT_CURRENCY): Dinero<number> {
  return dinero({ amount, currency })
}

// Add multiple Dinero amounts
export function addMoney(...amounts: Dinero<number>[]): Dinero<number> {
  if (amounts.length === 0) return createMoney(0)
  return amounts.reduce((acc, amount) => add(acc, amount))
}

// Subtract Dinero amounts
export function subtractMoney(a: Dinero<number>, b: Dinero<number>): Dinero<number> {
  return subtract(a, b)
}

// Multiply a Dinero amount by a factor
export function multiplyMoney(amount: Dinero<number>, factor: number): Dinero<number> {
  return multiply(amount, factor)
}

// Format money for display
export function formatMoney(amount: Dinero<number>): string {
  const value = toDecimal(amount)
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value))
}

// Convert cents to a displayable number
export function centsToDisplay(cents: number): number {
  return cents // UGX doesn't have decimal places
}

// Convert display number to cents
export function displayToCents(display: number): number {
  return Math.round(display)
}

// Calculate percentage
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

// Format large numbers with abbreviations
export function formatCompactNumber(num: number): string {
  const formatter = Intl.NumberFormat('en', { notation: 'compact' })
  return formatter.format(num)
}
