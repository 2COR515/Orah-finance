import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { checkResourceLimit, checkFeatureAccess } from '@/lib/feature-gate'
import { getTierLimits } from '@/lib/subscription'

export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where: any = { userId: session.user.id }
    if (type) where.type = type

    const savings = await prisma.savings.findMany({
      where,
      include: {
        deposits: {
          orderBy: { dateSaved: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(savings)
  } catch (error) {
    console.error('Error fetching savings:', error)
    return NextResponse.json({ error: 'Failed to fetch savings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, goalAmount, targetDate } = body

    if (!name || !type || !goalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, goalAmount' },
        { status: 400 }
      )
    }

    // Check savings goal limit
    const limitCheck = await checkResourceLimit(session.user.id, 'savings')
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: limitCheck.message, tier: limitCheck.tier, remaining: limitCheck.remaining },
        { status: 403 }
      )
    }

    // Check if savings type is allowed for this tier
    const featureCheck = await checkFeatureAccess(session.user.id, 'allowedSavingsTypes')
    const limits = getTierLimits(featureCheck.tier)
    if (!limits.allowedSavingsTypes.includes(type)) {
      return NextResponse.json(
        { error: `${type} savings is not available on your ${featureCheck.tier} plan. Upgrade to access it.` },
        { status: 403 }
      )
    }

    const savings = await prisma.savings.create({
      data: {
        userId: session.user.id,
        name,
        type,
        goalAmount: Math.round(goalAmount),
        targetDate: targetDate ? new Date(targetDate) : null,
      },
    })

    return NextResponse.json(savings, { status: 201 })
  } catch (error) {
    console.error('Error creating savings:', error)
    return NextResponse.json({ error: 'Failed to create savings' }, { status: 500 })
  }
}
