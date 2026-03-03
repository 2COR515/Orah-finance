import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/api-auth';

async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session?.user?.id) return false;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  return user?.role === 'ADMIN';
}

// GET - Get specific user details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        subscription: true,
        payments: { orderBy: { createdAt: 'desc' }, take: 20 },
        _count: {
          select: {
            expenses: true,
            incomes: true,
            savings: true,
            budgets: true,
            transactions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Admin user fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update user (change role, disable, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { action, tier, status } = body;

    if (action === 'make-admin') {
      await prisma.user.update({
        where: { id: params.id },
        data: { role: 'ADMIN' },
      });
      return NextResponse.json({ message: 'User promoted to admin' });
    }

    if (action === 'remove-admin') {
      await prisma.user.update({
        where: { id: params.id },
        data: { role: 'USER' },
      });
      return NextResponse.json({ message: 'Admin role removed' });
    }

    if (action === 'update-subscription' && tier) {
      await prisma.subscription.upsert({
        where: { userId: params.id },
        update: {
          tier,
          status: status || 'ACTIVE',
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        create: {
          userId: params.id,
          tier,
          status: 'ACTIVE',
          priceKES: tier === 'BASIC' ? 50 : tier === 'MEDIUM' ? 100 : tier === 'PREMIUM' ? 200 : 0,
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      return NextResponse.json({ message: `Subscription updated to ${tier}` });
    }

    if (action === 'verify-email') {
      await prisma.user.update({
        where: { id: params.id },
        data: { emailVerified: new Date() },
      });
      return NextResponse.json({ message: 'Email verified manually' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
