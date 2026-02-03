import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/budgets/[id] - Get a single budget
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const budget = await prisma.budget.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    return NextResponse.json(budget);
  } catch (error) {
    console.error('Failed to fetch budget:', error);
    return NextResponse.json({ error: 'Failed to fetch budget' }, { status: 500 });
  }
}

// PATCH /api/budgets/[id] - Update a budget
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount } = await request.json();

    const budget = await prisma.budget.updateMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        amount: Math.round(amount),
      },
    });

    if (budget.count === 0) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    const updated = await prisma.budget.findUnique({
      where: { id: params.id },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update budget:', error);
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 });
  }
}

// DELETE /api/budgets/[id] - Delete a budget
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const budget = await prisma.budget.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (budget.count === 0) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete budget:', error);
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
  }
}
