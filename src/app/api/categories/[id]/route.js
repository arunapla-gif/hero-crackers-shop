import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const dataToUpdate = {};
    if (body.name !== undefined) dataToUpdate.name = body.name;

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
