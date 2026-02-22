import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getSubscriptionEndDate } from '@/lib/subscription'

/**
 * POST /api/mpesa/callback - M-Pesa STK Push callback handler
 * This is called by Safaricom's servers after payment is processed
 * 
 * IMPORTANT: This endpoint must be publicly accessible (no auth required)
 * Set MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('M-Pesa Callback received:', JSON.stringify(body, null, 2))

    const { Body } = body
    const { stkCallback } = Body

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback

    // Find the payment by checkout request ID
    const payment = await prisma.payment.findFirst({
      where: { transactionRef: CheckoutRequestID },
    })

    if (!payment) {
      console.error('Payment not found for CheckoutRequestID:', CheckoutRequestID)
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    if (ResultCode === 0) {
      // Payment successful — extract M-Pesa receipt number
      let mpesaReceiptNumber = ''
      let amountPaid = 0

      if (CallbackMetadata?.Item) {
        for (const item of CallbackMetadata.Item) {
          if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = item.Value
          if (item.Name === 'Amount') amountPaid = item.Value
        }
      }

      // Update payment record
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          mpesaReceiptNumber,
          paidAt: new Date(),
          metadata: {
            resultCode: ResultCode,
            resultDesc: ResultDesc,
            mpesaReceiptNumber,
            amountPaid,
            merchantRequestID: MerchantRequestID,
          },
        },
      })

      // Activate subscription
      const endDate = getSubscriptionEndDate()

      await prisma.subscription.upsert({
        where: { userId: payment.userId },
        update: {
          tier: payment.tier,
          status: 'ACTIVE',
          priceKES: payment.amount,
          startDate: new Date(),
          endDate,
          autoRenew: true,
          mpesaReceiptNumber,
        },
        create: {
          userId: payment.userId,
          tier: payment.tier,
          status: 'ACTIVE',
          priceKES: payment.amount,
          startDate: new Date(),
          endDate,
          autoRenew: true,
          mpesaReceiptNumber,
        },
      })

      console.log(`Subscription activated for user ${payment.userId}: ${payment.tier}`)
    } else {
      // Payment failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          metadata: {
            resultCode: ResultCode,
            resultDesc: ResultDesc,
          },
        },
      })
      console.log(`Payment failed for user ${payment.userId}: ${ResultDesc}`)
    }

    // Always respond with success to M-Pesa
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  } catch (error) {
    console.error('M-Pesa callback error:', error)
    // Still return success to avoid M-Pesa retries
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }
}
