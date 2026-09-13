import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/apiAuth';
import { sanitizeString, isValidPrice } from '@/lib/validation';

export async function GET(request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const whereClause = {};
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    if (!body.description || body.amount === undefined || !isValidPrice(body.amount)) {
      return NextResponse.json({ error: 'Description and a valid amount are required' }, { status: 400 });
    }

    const newExpense = await prisma.expense.create({
      data: {
        description: sanitizeString(body.description, 255),
        amount: parseFloat(body.amount),
        category: sanitizeString(body.category || 'General', 100),
        date: body.date ? new Date(body.date) : new Date()
      }
    });

    return NextResponse.json(newExpense);
  } catch (error) {
    console.error('Failed to create expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
