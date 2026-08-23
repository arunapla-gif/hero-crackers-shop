import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { sendWhatsAppOrderConfirmation } from '@/lib/msg91';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    
    // 1. Fetch the order details
    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.customerPhone) {
      return NextResponse.json({ error: 'Customer phone number is missing' }, { status: 400 });
    }

    // 2. Trigger MSG91 API
    const success = await sendWhatsAppOrderConfirmation(
      order.customerPhone,
      order.user?.name || 'Customer',
      order.id,
      order.totalAmount
    );

    if (!success) {
      return NextResponse.json({ error: 'Failed to trigger MSG91 WhatsApp notification.' }, { status: 500 });
    }

    // 3. Update lastSentVersion to match editVersion
    await prisma.order.update({
      where: { id },
      data: {
        lastSentVersion: order.editVersion
      }
    });

    return NextResponse.json({ success: true, message: 'WhatsApp message triggered successfully.' });

  } catch (error) {
    console.error('Failed to trigger WhatsApp manually:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
