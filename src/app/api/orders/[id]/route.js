import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/apiAuth';
import { sanitizeString } from '@/lib/validation';

export async function PATCH(request, { params }) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    
    const dataToUpdate = {};
    if (body.status !== undefined) dataToUpdate.status = sanitizeString(body.status, 50);
    if (body.transportName !== undefined) dataToUpdate.transportName = sanitizeString(body.transportName, 100);
    if (body.trackingNumber !== undefined) dataToUpdate.trackingNumber = sanitizeString(body.trackingNumber, 100);
    if (body.shippingAddress !== undefined) dataToUpdate.shippingAddress = sanitizeString(body.shippingAddress, 500);
    if (body.customerPhone !== undefined) dataToUpdate.customerPhone = sanitizeString(body.customerPhone, 20);
    if (body.referredBy !== undefined) dataToUpdate.referredBy = sanitizeString(body.referredBy, 100);
    if (body.totalAmount !== undefined) dataToUpdate.totalAmount = parseFloat(body.totalAmount);
    if (body.paymentStatus !== undefined) dataToUpdate.paymentStatus = sanitizeString(body.paymentStatus, 50);
    if (body.paymentMethod !== undefined) dataToUpdate.paymentMethod = sanitizeString(body.paymentMethod, 50);
    if (body.paymentDetails !== undefined) dataToUpdate.paymentDetails = sanitizeString(body.paymentDetails, 255);

    if (body.customerName !== undefined) {
      const sanitizedName = sanitizeString(body.customerName, 100);
      const existing = await prisma.order.findUnique({ where: { id }, select: { userId: true } });
      if (existing?.userId) {
        await prisma.user.update({
          where: { id: existing.userId },
          data: { name: sanitizedName }
        });
      }
    }

    if (body.items && Array.isArray(body.items)) {
      dataToUpdate.items = {
        deleteMany: {}, // Delete existing items
        create: body.items.map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price)
        }))
      };
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: 'No data provided to update' }, { status: 400 });
    }

    // Increment edit version on every successful edit
    dataToUpdate.editVersion = { increment: 1 };

    const order = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
      include: {
        items: true,
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
