import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { godownId, productId, quantity } = await request.json();

    if (!godownId || !productId || quantity === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const stock = await prisma.godownStock.upsert({
      where: {
        godownId_productId: {
          godownId,
          productId
        }
      },
      update: { quantity: parseInt(quantity) },
      create: {
        godownId,
        productId,
        quantity: parseInt(quantity)
      }
    });

    return NextResponse.json(stock);
  } catch (error) {
    console.error('Failed to update stock:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}
