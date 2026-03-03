import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * Middleware to check if user is admin
 */
async function isAdmin(request: NextRequest): Promise<{ isAdmin: boolean; userId?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { isAdmin: false };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  return { isAdmin: user?.role === 'ADMIN', userId: session.user.id };
}

// GET - Admin dashboard stats
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await isAdmin(request);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'overview';

    if (view === 'overview') {
      // Get overall stats
      const [
        totalUsers,
        verifiedUsers,
        activeSubscriptions,
        totalRevenue,
        recentPayments,
        tierBreakdown,
        recentUsers,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { emailVerified: { not: null } } }),
        prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        prisma.payment.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        prisma.payment.findMany({
          where: { status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { user: { select: { name: true, email: true } } },
        }),
        prisma.subscription.groupBy({
          by: ['tier'],
          _count: true,
          where: { status: { in: ['ACTIVE', 'TRIAL'] } },
        }),
        prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            role: true,
            createdAt: true,
            subscription: {
              select: { tier: true, status: true, endDate: true },
            },
          },
        }),
      ]);

      // Monthly revenue for the current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthlyRevenue = await prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
        _count: true,
      });

      return NextResponse.json({
        stats: {
          totalUsers,
          verifiedUsers,
          activeSubscriptions,
          totalRevenue: totalRevenue._sum.amount || 0,
          monthlyRevenue: monthlyRevenue._sum.amount || 0,
          monthlyPayments: monthlyRevenue._count || 0,
        },
        tierBreakdown,
        recentPayments,
        recentUsers,
      });
    }

    if (view === 'users') {
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const search = searchParams.get('search') || '';

      const where = search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' as const } },
              { name: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            role: true,
            createdAt: true,
            subscription: {
              select: { tier: true, status: true, endDate: true, priceKES: true },
            },
            _count: {
              select: { expenses: true, incomes: true, savings: true },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      return NextResponse.json({
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    if (view === 'payments') {
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            user: { select: { name: true, email: true } },
          },
        }),
        prisma.payment.count(),
      ]);

      return NextResponse.json({
        payments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
