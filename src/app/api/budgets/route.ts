import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/budgets - Get all budgets for a user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
        ...(month && year ? { month: parseInt(month), year: parseInt(year) } : {}),
      },
      orderBy: { category: 'asc' },
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Failed to fetch budgets:', error);
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

// POST /api/budgets - Create a new budget
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category, amount, month, year, currency = 'KES' } = await request.json();

    // Check if budget already exists for this category/month/year
    const existing = await prisma.budget.findUnique({
      where: {
        userId_category_month_year: {
          userId: session.user.id,
          category,
          month,
          year,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Budget already exists for this category and period' },
        { status: 409 }
      );
    }

    const budget = await prisma.budget.create({
      data: {
        category,
        amount: Math.round(amount),
        currency,
        month,
        year,
        userId: session.user.id,
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error('Failed to create budget:', error);
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}
