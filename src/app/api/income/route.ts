import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')

    const where: any = { userId: session.user.id }
    
    if (category) where.category = category
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const incomes = await prisma.income.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    return NextResponse.json(incomes)
  } catch (error) {
    console.error('Error fetching income:', error)
    return NextResponse.json(
      { error: 'Failed to fetch income' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, category, source, description, date, isRecurring, currency } = body

    if (!amount || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, category' },
        { status: 400 }
      )
    }

    const income = await prisma.income.create({
      data: {
        userId: session.user.id,
        amount: Math.round(amount),
        currency: currency || 'KES',
        category,
        source: source || null,
        description: description || null,
        date: date ? new Date(date) : new Date(),
        isRecurring: isRecurring || false,
      },
    })

    return NextResponse.json(income, { status: 201 })
  } catch (error) {
    console.error('Error creating income:', error)
    return NextResponse.json(
      { error: 'Failed to create income' },
      { status: 500 }
    )
  }
}
