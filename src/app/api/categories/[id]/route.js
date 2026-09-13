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
    if (body.name !== undefined) {
      const name = sanitizeString(body.name, 100);
      dataToUpdate.name = name;
      dataToUpdate.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (body.sequence !== undefined) {
      dataToUpdate.sequence = parseInt(body.sequence) || 0;
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Failed to update category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    await prisma.category.delete({
      where: { id }
    });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Failed to delete category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
