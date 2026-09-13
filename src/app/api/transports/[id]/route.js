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
    if (body.name !== undefined) dataToUpdate.name = sanitizeString(body.name, 100);
    if (body.phone !== undefined) dataToUpdate.phone = sanitizeString(body.phone, 20);
    if (body.isActive !== undefined) dataToUpdate.isActive = Boolean(body.isActive);

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
