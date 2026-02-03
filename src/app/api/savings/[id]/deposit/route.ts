import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

// Add a deposit to a savings goal
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, note, dateSaved } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    // Verify ownership
    const savingsGoal = await prisma.savings.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!savingsGoal) {
      return NextResponse.json({ error: 'Savings not found' }, { status: 404 })
    }

    // Create the deposit and update the savings balance in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create deposit
      const deposit = await tx.savingsDeposit.create({
        data: {
          savingsId: params.id,
          amount: Math.round(amount),
          note: note || null,
          dateSaved: dateSaved ? new Date(dateSaved) : new Date(),
        },
      })

      // Update savings total
      const savings = await tx.savings.update({
        where: { id: params.id },
        data: {
          amountSaved: {
            increment: Math.round(amount),
          },
        },
      })

      return { deposit, savings }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating deposit:', error)
    return NextResponse.json({ error: 'Failed to create deposit' }, { status: 500 })
  }
}
