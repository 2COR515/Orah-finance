import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [totalExpenses, totalSavings, totalBudgets, totalTransactions] = await Promise.all([
      prisma.expense.count({
        where: { userId: session.user.id },
      }),
      prisma.savings.count({
        where: { userId: session.user.id },
      }),
      prisma.budget.count({
        where: { userId: session.user.id },
      }),
      prisma.transaction.count({
        where: { userId: session.user.id },
      }),
    ])

    return NextResponse.json({
      totalExpenses,
      totalSavings,
      totalBudgets,
      totalTransactions,
    })
  } catch (error) {
    console.error('Error fetching profile stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
