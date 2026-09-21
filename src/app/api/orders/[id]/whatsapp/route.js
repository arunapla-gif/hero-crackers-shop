import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { sendWhatsAppOrderConfirmation } from '@/lib/msg91';
import { requireAdminApi } from '@/lib/apiAuth';

export async function POST(request, { params }) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    
    // 1. Fetch the order details (trimming user password)
    const order = await prisma.order.findUnique({
      where: { id },
      include: { 
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 2. Trigger MSG91 API (Sent to fixed group/staff number instead of customer)
    const fixedNumber = '918870904994';
    
    const result = await sendWhatsAppOrderConfirmation(
      fixedNumber,
      order.user?.name || 'Customer',
      order.id,
      order.totalAmount,
      order.customerPhone, // Pass original phone for formatting
      order.orderNumber,
      order.shippingAddress
    );

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to trigger MSG91 WhatsApp notification.', details: result.error }, { status: 500 });
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
    console.error('Error in WhatsApp trigger API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
