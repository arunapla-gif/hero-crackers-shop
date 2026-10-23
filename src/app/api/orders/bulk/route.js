import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/apiAuth';
import { sanitizeString } from '@/lib/validation';

export async function PATCH(request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { orderIds, status, paymentStatus, paymentMethod, paymentDetails } = body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'orderIds array is required and must not be empty' }, { status: 400 });
    }

    if (orderIds.length > 100) {
      return NextResponse.json({ error: 'Maximum 100 orders can be updated in a single batch' }, { status: 400 });
    }

    const dataToUpdate = {};
    if (status) {
      const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
      }
      dataToUpdate.status = status;
    }

    if (paymentStatus) {
      const validPaymentStatuses = ['UNPAID', 'PAID', 'CREDIT'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json({ error: `Invalid paymentStatus: ${paymentStatus}` }, { status: 400 });
      }
      dataToUpdate.paymentStatus = paymentStatus;
    }

    if (paymentMethod !== undefined) {
      dataToUpdate.paymentMethod = sanitizeString(paymentMethod, 50);
    }

    if (paymentDetails !== undefined) {
      dataToUpdate.paymentDetails = sanitizeString(paymentDetails, 255);
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: 'No valid update fields provided' }, { status: 400 });
    }

    // Atomic update of all matching orders
    const result = await prisma.order.updateMany({
      where: {
        id: { in: orderIds }
      },
      data: dataToUpdate
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count
    });
  } catch (error) {
    console.error('Failed to perform bulk order update:', error);
    return NextResponse.json({ error: 'Failed to update orders' }, { status: 500 });
  }
}
