import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/apiAuth';

export async function POST(request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { godownId, productId, quantity } = await request.json();

    if (!godownId || !productId || quantity === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const qty = Math.max(0, parseInt(quantity) || 0);

    const stock = await prisma.godownStock.upsert({
      where: {
        godownId_productId: {
          godownId,
          productId
        }
      },
      update: { quantity: qty },
      create: {
        godownId,
        productId,
        quantity: qty
      }
    });

    return NextResponse.json(stock);
  } catch (error) {
    console.error('Failed to update stock:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}
