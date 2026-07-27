import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const dataToUpdate = {};
    if (body.name !== undefined) dataToUpdate.name = body.name;
    if (body.description !== undefined) dataToUpdate.description = body.description;
    if (body.basePrice !== undefined) dataToUpdate.basePrice = parseFloat(body.basePrice);
    if (body.price !== undefined) dataToUpdate.price = parseFloat(body.price);
    if (body.discount !== undefined) dataToUpdate.discount = parseFloat(body.discount) || 0;
    if (body.categoryId !== undefined) dataToUpdate.categoryId = body.categoryId;
    if (body.stockShop !== undefined) dataToUpdate.stockShop = parseInt(body.stockShop) || 0;
    if (body.sequence !== undefined && body.sequence !== '') dataToUpdate.sequence = parseInt(body.sequence);
    if (body.imageUrls !== undefined) dataToUpdate.imageUrls = body.imageUrls;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
      include: { category: true }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
