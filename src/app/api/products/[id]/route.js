import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // We only expect sequence updates for now, but we could expand this to other fields
    const dataToUpdate = {};
    if (body.sequence !== undefined) {
      dataToUpdate.sequence = parseInt(body.sequence);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
