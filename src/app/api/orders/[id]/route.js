import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const dataToUpdate = {};
    if (body.status) dataToUpdate.status = body.status;
    if (body.transportName) dataToUpdate.transportName = body.transportName;
    if (body.trackingNumber) dataToUpdate.trackingNumber = body.trackingNumber;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: 'No data provided to update' }, { status: 400 });
    }

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
