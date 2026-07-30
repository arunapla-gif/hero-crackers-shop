import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    const customer = await prisma.customerMaster.update({
      where: { id },
      data: {
        alternatePhone: data.alternatePhone,
        name: data.name,
        fullAddress: data.fullAddress,
        city: data.city,
        isActive: data.isActive !== undefined ? data.isActive : undefined
      }
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Failed to update customer:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}
