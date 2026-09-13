import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/apiAuth';
import { sanitizeString } from '@/lib/validation';

export async function PATCH(request, { params }) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    const data = await request.json();

    const dataToUpdate = {};
    if (data.name !== undefined) dataToUpdate.name = sanitizeString(data.name, 100);
    if (data.alternatePhone !== undefined) dataToUpdate.alternatePhone = sanitizeString(data.alternatePhone, 20);
    if (data.fullAddress !== undefined) dataToUpdate.fullAddress = sanitizeString(data.fullAddress, 500);
    if (data.city !== undefined) dataToUpdate.city = sanitizeString(data.city, 100);
    if (data.isActive !== undefined) dataToUpdate.isActive = Boolean(data.isActive);

    const customer = await prisma.customerMaster.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Failed to update customer:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}
