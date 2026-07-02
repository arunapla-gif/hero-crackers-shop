import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true }
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        basePrice: body.basePrice ? parseFloat(body.basePrice) : 0,
        price: parseFloat(body.price),
        discount: body.discount ? parseFloat(body.discount) : 0,
        stockShop: body.stockShop ? parseInt(body.stockShop) : 0,
        stockGodown: body.stockGodown ? parseInt(body.stockGodown) : 0,
        stock: (body.stockShop ? parseInt(body.stockShop) : 0) + (body.stockGodown ? parseInt(body.stockGodown) : 0),
        categoryId: body.categoryId,
        imageUrls: body.imageUrls || []
      }
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
