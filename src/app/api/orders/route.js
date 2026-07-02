import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // In our Legal Estimate model, this creates a PENDING estimate
    const order = await prisma.order.create({
      data: {
        userId: body.userId,
        totalAmount: parseFloat(body.totalAmount),
        shippingAddress: body.shippingAddress,
        status: 'PENDING', // Waiting for phone confirmation & Axis payment
        items: {
          create: body.items.map(item => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price)
          }))
        }
      },
      include: { items: true }
    });
    
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit estimate' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true, user: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch estimates' }, { status: 500 });
  }
}
