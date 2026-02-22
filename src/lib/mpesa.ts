/**
 * M-Pesa Daraja API Integration for OrahFinance
 * 
 * Environment variables needed:
 *   MPESA_CONSUMER_KEY     - Safaricom Daraja consumer key
 *   MPESA_CONSUMER_SECRET  - Safaricom Daraja consumer secret
 *   MPESA_PASSKEY          - Lipa Na M-Pesa passkey
 *   MPESA_SHORTCODE        - Business short code (paybill/till)
 *   MPESA_CALLBACK_URL     - Your server callback URL (e.g., https://yourdomain.com/api/mpesa/callback)
 *   MPESA_ENV              - 'sandbox' or 'production'
 */

const MPESA_BASE_URL = process.env.MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke'

/**
 * Get OAuth access token from Daraja API
 */
async function getAccessToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY!
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')

  const response = await fetch(
    `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to get M-Pesa access token: ${response.statusText}`)
  }

  const data = await response.json()
  return data.access_token
}

/**
 * Generate password for Lipa Na M-Pesa STK Push
 */
function generatePassword(timestamp: string): string {
  const shortcode = process.env.MPESA_SHORTCODE!
  const passkey = process.env.MPESA_PASSKEY!
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')
}

/**
 * Get current timestamp in M-Pesa format (YYYYMMDDHHmmss)
 */
function getTimestamp(): string {
  const now = new Date()
  return now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0')
}

/**
 * Initiate STK Push (Lipa Na M-Pesa Online)
 * This sends a prompt to the user's phone to authorize payment
 */
export async function initiateSTKPush(params: {
  phoneNumber: string  // Format: 254XXXXXXXXX
  amount: number       // Amount in KES
  accountReference: string  // e.g., "OrahFinance-SUB"
  description: string  // e.g., "Premium subscription"
}): Promise<{
  success: boolean
  checkoutRequestID?: string
  merchantRequestID?: string
  responseDescription?: string
  error?: string
}> {
  try {
    const accessToken = await getAccessToken()
    const timestamp = getTimestamp()
    const password = generatePassword(timestamp)

    const response = await fetch(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BusinessShortCode: process.env.MPESA_SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: params.amount,
          PartyA: params.phoneNumber,
          PartyB: process.env.MPESA_SHORTCODE,
          PhoneNumber: params.phoneNumber,
          CallBackURL: `${process.env.MPESA_CALLBACK_URL}`,
          AccountReference: params.accountReference,
          TransactionDesc: params.description,
        }),
      }
    )

    const data = await response.json()

    if (data.ResponseCode === '0') {
      return {
        success: true,
        checkoutRequestID: data.CheckoutRequestID,
        merchantRequestID: data.MerchantRequestID,
        responseDescription: data.ResponseDescription,
      }
    }

    return {
      success: false,
      error: data.errorMessage || data.ResponseDescription || 'STK Push failed',
    }
  } catch (error) {
    console.error('M-Pesa STK Push error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate payment',
    }
  }
}

/**
 * Query STK Push status
 */
export async function querySTKPushStatus(checkoutRequestID: string): Promise<{
  success: boolean
  resultCode?: string
  resultDesc?: string
}> {
  try {
    const accessToken = await getAccessToken()
    const timestamp = getTimestamp()
    const password = generatePassword(timestamp)

    const response = await fetch(
      `${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BusinessShortCode: process.env.MPESA_SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestID,
        }),
      }
    )

    const data = await response.json()

    return {
      success: data.ResultCode === '0',
      resultCode: data.ResultCode,
      resultDesc: data.ResultDesc,
    }
  } catch (error) {
    console.error('M-Pesa query error:', error)
    return {
      success: false,
      resultDesc: 'Failed to query payment status',
    }
  }
}

/**
 * Format phone number to M-Pesa format (254XXXXXXXXX)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove spaces, dashes, and plus sign
  let cleaned = phone.replace(/[\s\-\+]/g, '')

  // Handle different formats
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1)
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    cleaned = '254' + cleaned
  }

  return cleaned
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone)
  return /^254[0-9]{9}$/.test(formatted)
}
