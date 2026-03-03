import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/api-auth'
import { NextResponse } from 'next/server'
import { getUserSubscription, createDefaultSubscription } from '@/lib/feature-gate'
import { SUBSCRIPTION_TIERS, getSubscriptionEndDate } from '@/lib/subscription'

/**
 * GET /api/subscription - Get current user's subscription
 */
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await getUserSubscription(session.user.id)
    const tiers = Object.values(SUBSCRIPTION_TIERS).filter(t => t.tier !== 'FREE')

    return NextResponse.json({
      subscription,
      availableTiers: tiers,
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}

/**
 * POST /api/subscription - Create or upgrade subscription
 * Body: { tier: 'BASIC' | 'MEDIUM' | 'PREMIUM', paymentMethod: 'MPESA' | 'GOOGLE_PLAY' }
 */
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tier, paymentMethod, transactionRef, phoneNumber } = body

    if (!tier || !['BASIC', 'MEDIUM', 'PREMIUM'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 })
    }

    if (!paymentMethod || !['MPESA', 'GOOGLE_PLAY'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
    }

    const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]
    const endDate = getSubscriptionEndDate()

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: tierConfig.priceKES,
        currency: 'KES',
        method: paymentMethod,
        status: 'PENDING',
        tier,
        transactionRef: transactionRef || null,
        phoneNumber: phoneNumber || null,
        description: `${tierConfig.name} subscription - KSh ${tierConfig.priceKES}/month`,
      },
    })

    // Update or create subscription
    const subscription = await prisma.subscription.upsert({
      where: { userId: session.user.id },
      update: {
        tier,
        status: 'ACTIVE',
        priceKES: tierConfig.priceKES,
        startDate: new Date(),
        endDate,
        autoRenew: true,
      },
      create: {
        userId: session.user.id,
        tier,
        status: 'ACTIVE',
        priceKES: tierConfig.priceKES,
        startDate: new Date(),
        endDate,
        autoRenew: true,
      },
    })

    // Mark payment as completed
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'COMPLETED', paidAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      subscription,
      payment,
      message: `Successfully subscribed to ${tierConfig.name} plan`,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}

/**
 * PATCH /api/subscription - Cancel or modify subscription
 * Body: { action: 'cancel' | 'resume' | 'toggle_auto_renew' }
 */
export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    const existing = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    let updateData: any = {}

    switch (action) {
      case 'cancel':
        updateData = {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          autoRenew: false,
        }
        break
      case 'resume':
        if (existing.status !== 'CANCELLED') {
          return NextResponse.json({ error: 'Subscription is not cancelled' }, { status: 400 })
        }
        updateData = {
          status: 'ACTIVE',
          cancelledAt: null,
          autoRenew: true,
          endDate: getSubscriptionEndDate(),
        }
        break
      case 'toggle_auto_renew':
        updateData = { autoRenew: !existing.autoRenew }
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const subscription = await prisma.subscription.update({
      where: { userId: session.user.id },
      data: updateData,
    })

    return NextResponse.json({ success: true, subscription })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
  }
}
