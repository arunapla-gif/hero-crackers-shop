import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
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
  try {
    const body = await request.json();
    if (!body.description || !body.amount) {
      return NextResponse.json({ error: 'Description and amount are required' }, { status: 400 });
    }

    const newExpense = await prisma.expense.create({
      data: {
        description: body.description,
        amount: parseFloat(body.amount),
        category: body.category || 'General',
        date: body.date ? new Date(body.date) : new Date()
      }
    });

    return NextResponse.json(newExpense);
  } catch (error) {
    console.error('Failed to create expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
