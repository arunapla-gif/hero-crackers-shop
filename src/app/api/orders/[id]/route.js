import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const dataToUpdate = {};
    if (body.status !== undefined) dataToUpdate.status = body.status;
    if (body.transportName !== undefined) dataToUpdate.transportName = body.transportName;
    if (body.trackingNumber !== undefined) dataToUpdate.trackingNumber = body.trackingNumber;
    if (body.shippingAddress !== undefined) dataToUpdate.shippingAddress = body.shippingAddress;
    if (body.customerPhone !== undefined) dataToUpdate.customerPhone = body.customerPhone;
    if (body.referredBy !== undefined) dataToUpdate.referredBy = body.referredBy;
    if (body.totalAmount !== undefined) dataToUpdate.totalAmount = parseFloat(body.totalAmount);
    if (body.paymentStatus !== undefined) dataToUpdate.paymentStatus = body.paymentStatus;
    if (body.paymentMethod !== undefined) dataToUpdate.paymentMethod = body.paymentMethod;
    if (body.paymentDetails !== undefined) dataToUpdate.paymentDetails = body.paymentDetails;

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
      data: dataToUpdate
    });
    
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
