import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/apiAuth';
import { sanitizeString, isValidPrice } from '@/lib/validation';

export async function PATCH(request, { params }) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    
    const dataToUpdate = {};
    if (body.name !== undefined) dataToUpdate.name = sanitizeString(body.name, 200);
    if (body.description !== undefined) dataToUpdate.description = sanitizeString(body.description, 1000);
    if (body.basePrice !== undefined && isValidPrice(body.basePrice)) dataToUpdate.basePrice = parseFloat(body.basePrice);
    if (body.price !== undefined && isValidPrice(body.price)) dataToUpdate.price = parseFloat(body.price);
    if (body.discount !== undefined && isValidPrice(body.discount)) dataToUpdate.discount = Math.min(100, Math.max(0, parseFloat(body.discount)));
    if (body.categoryId !== undefined) dataToUpdate.categoryId = body.categoryId;
    if (body.stockShop !== undefined) dataToUpdate.stockShop = Math.max(0, parseInt(body.stockShop) || 0);
    if (body.stockGodown !== undefined) dataToUpdate.stockGodown = Math.max(0, parseInt(body.stockGodown) || 0);
    if (body.stockShop !== undefined || body.stockGodown !== undefined) {
      dataToUpdate.stock = (dataToUpdate.stockShop ?? body.stockShop ?? 0) + (dataToUpdate.stockGodown ?? body.stockGodown ?? 0);
    }
    if (body.sequence !== undefined && body.sequence !== '') dataToUpdate.sequence = parseInt(body.sequence);
    if (body.imageUrls !== undefined && Array.isArray(body.imageUrls)) {
      dataToUpdate.imageUrls = body.imageUrls.filter(u => typeof u === 'string').slice(0, 10);
    }

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

export async function DELETE(request, { params }) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    await prisma.product.delete({
      where: { id }
    });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
