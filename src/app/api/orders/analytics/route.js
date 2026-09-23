import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/apiAuth';

export async function GET(request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build the query exactly like the main orders API
    const where = {};
    if (status && status !== 'ALL') where.status = status;
    if (source && source !== 'ALL') where.source = source;
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    
    if (startDate && endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = {
        gte: new Date(startDate),
        lte: end
      };
    }

    // Instead of fetching all rows, use aggregate and count
    const [revenueAgg, pendingCount, shippedCount] = await Promise.all([
      prisma.order.aggregate({
        where: {
          ...where,
          status: { notIn: ['PENDING', 'CANCELLED'] } // Only booked revenue
        },
        _sum: { totalAmount: true }
      }),
      prisma.order.count({
        where: { ...where, status: { in: ['PENDING', 'CONFIRMED'] } }
      }),
      prisma.order.count({
        where: { ...where, status: 'SHIPPED' }
      })
    ]);

    return NextResponse.json({
      periodRevenue: revenueAgg._sum.totalAmount || 0,
      periodPendingCount: pendingCount,
      periodShippedCount: shippedCount
    });
  } catch (error) {
    console.error('Failed to fetch order analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
