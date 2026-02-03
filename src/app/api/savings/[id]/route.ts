import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const savings = await prisma.savings.findFirst({
      where: { id: params.id, userId: session.user.id },
      include: {
        deposits: {
          orderBy: { dateSaved: 'desc' },
        },
      },
    })

    if (!savings) {
      return NextResponse.json({ error: 'Savings not found' }, { status: 404 })
    }

    return NextResponse.json(savings)
  } catch (error) {
    console.error('Error fetching savings:', error)
    return NextResponse.json({ error: 'Failed to fetch savings' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, goalAmount, targetDate, isActive } = body

    const savings = await prisma.savings.updateMany({
      where: { id: params.id, userId: session.user.id },
      data: {
        ...(name && { name }),
        ...(goalAmount !== undefined && { goalAmount: Math.round(goalAmount) }),
        ...(targetDate !== undefined && { targetDate: targetDate ? new Date(targetDate) : null }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    if (savings.count === 0) {
      return NextResponse.json({ error: 'Savings not found' }, { status: 404 })
    }

    const updated = await prisma.savings.findUnique({ where: { id: params.id } })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating savings:', error)
    return NextResponse.json({ error: 'Failed to update savings' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const savings = await prisma.savings.deleteMany({
      where: { id: params.id, userId: session.user.id },
    })

    if (savings.count === 0) {
      return NextResponse.json({ error: 'Savings not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting savings:', error)
    return NextResponse.json({ error: 'Failed to delete savings' }, { status: 500 })
  }
}
