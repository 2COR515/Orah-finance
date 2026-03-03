import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/api-auth'
import { NextResponse } from 'next/server'

// DELETE a deposit from a savings goal
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; depositId: string } }
) {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify savings goal ownership
    const savingsGoal = await prisma.savings.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!savingsGoal) {
      return NextResponse.json({ error: 'Savings not found' }, { status: 404 })
    }

    // Get the deposit to know the amount to subtract
    const deposit = await prisma.savingsDeposit.findFirst({
      where: { id: params.depositId, savingsId: params.id },
    })

    if (!deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 })
    }

    // Delete the deposit and update the savings balance in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete the deposit
      await tx.savingsDeposit.delete({
        where: { id: params.depositId },
      })

      // Update savings total (subtract the deposit amount)
      await tx.savings.update({
        where: { id: params.id },
        data: {
          amountSaved: {
            decrement: deposit.amount,
          },
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting deposit:', error)
    return NextResponse.json({ error: 'Failed to delete deposit' }, { status: 500 })
  }
}
