import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // 1. Guest Checkout Logic: Find or create a user based on the phone number
    // We generate a dummy email since the User model requires a unique email.
    const dummyEmail = `${body.customerPhone.replace(/[^0-9]/g, '')}@guest.local`;
    
    let user = await prisma.user.findUnique({
      where: { email: dummyEmail }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: body.customerName,
          email: dummyEmail,
          password: 'guest-checkout-no-password', // Not used for actual login
          role: 'USER'
        }
      });
    }

    // 2. Create the Order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: parseFloat(body.totalAmount),
        shippingAddress: body.shippingAddress,
        customerPhone: body.customerPhone,
        status: 'PENDING',
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
    console.error('Failed to submit estimate:', error);
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
