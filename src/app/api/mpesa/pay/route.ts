import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { initiateSTKPush, formatPhoneNumber, isValidPhoneNumber } from '@/lib/mpesa'
import { SUBSCRIPTION_TIERS, getSubscriptionEndDate } from '@/lib/subscription'

/**
 * POST /api/mpesa/pay - Initiate M-Pesa STK Push for subscription payment
 * Body: { tier: 'BASIC' | 'MEDIUM' | 'PREMIUM', phoneNumber: string }
 */
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tier, phoneNumber } = body

    // Validate tier
    if (!tier || !['BASIC', 'MEDIUM', 'PREMIUM'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 })
    }

    // Validate phone
    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Use format: 07XXXXXXXX or 254XXXXXXXXX' },
        { status: 400 }
      )
    }

    const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]
    const formattedPhone = formatPhoneNumber(phoneNumber)

    // Create a pending payment record
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: tierConfig.priceKES,
        currency: 'KES',
        method: 'MPESA',
        status: 'PENDING',
        tier,
        phoneNumber: formattedPhone,
        description: `OrahFinance ${tierConfig.name} Plan - KSh ${tierConfig.priceKES}/month`,
      },
    })

    // Initiate STK Push
    const stkResult = await initiateSTKPush({
      phoneNumber: formattedPhone,
      amount: tierConfig.priceKES,
      accountReference: `ORAH-${payment.id.slice(-8).toUpperCase()}`,
      description: `OrahFinance ${tierConfig.name} Subscription`,
    })

    if (!stkResult.success) {
      // Update payment as failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', metadata: { error: stkResult.error } },
      })
      return NextResponse.json(
        { error: stkResult.error || 'Failed to initiate M-Pesa payment' },
        { status: 400 }
      )
    }

    // Store the checkout request ID for callback matching
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionRef: stkResult.checkoutRequestID,
        metadata: {
          merchantRequestID: stkResult.merchantRequestID,
          checkoutRequestID: stkResult.checkoutRequestID,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'STK Push sent. Check your phone to complete payment.',
      paymentId: payment.id,
      checkoutRequestID: stkResult.checkoutRequestID,
    })
  } catch (error) {
    console.error('M-Pesa payment error:', error)
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
  }
}
