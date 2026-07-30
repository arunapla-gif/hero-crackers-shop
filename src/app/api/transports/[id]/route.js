import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const dataToUpdate = {};
    if (body.name !== undefined) dataToUpdate.name = body.name;
    if (body.phone !== undefined) dataToUpdate.phone = body.phone;
    if (body.isActive !== undefined) dataToUpdate.isActive = body.isActive;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: 'No data to update' }, { status: 400 });
    }

    const updatedTransport = await prisma.transportMaster.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(updatedTransport);
  } catch (error) {
    console.error('Failed to update transport:', error);
    return NextResponse.json({ error: 'Failed to update transport' }, { status: 500 });
  }
}
