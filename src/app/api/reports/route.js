import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dateFilter = {};
    if (startDate && endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date

      dateFilter.gte = new Date(startDate);
      dateFilter.lte = end;
    }

    // Fetch Orders
    const ordersWhere = startDate && endDate ? { createdAt: dateFilter } : {};
    const orders = await prisma.order.findMany({
      where: ordersWhere,
      include: {
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch Expenses
    const expensesWhere = startDate && endDate ? { date: dateFilter } : {};
    const expenses = await prisma.expense.findMany({
      where: expensesWhere,
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({ orders, expenses });
  } catch (error) {
    console.error('Failed to fetch report data:', error);
    return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 });
  }
}
