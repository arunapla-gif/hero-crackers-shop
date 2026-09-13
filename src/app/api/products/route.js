import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/apiAuth';
import { sanitizeString, isValidPrice } from '@/lib/validation';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: [
        { sequence: 'asc' },
        { name: 'asc' }
      ]
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    
    if (!body.name || !body.price || !body.categoryId) {
      return NextResponse.json({ error: 'Name, price, and category are required' }, { status: 400 });
    }

    if (!isValidPrice(body.price)) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }

    const price = parseFloat(body.price);
    const basePrice = body.basePrice && isValidPrice(body.basePrice) ? parseFloat(body.basePrice) : price;
    const discount = body.discount && isValidPrice(body.discount) ? Math.min(100, Math.max(0, parseFloat(body.discount))) : 0;
    const stockShop = Math.max(0, parseInt(body.stockShop) || 0);
    const stockGodown = Math.max(0, parseInt(body.stockGodown) || 0);
    const sequence = parseInt(body.sequence) || 0;

    const product = await prisma.product.create({
      data: {
        name: sanitizeString(body.name, 200),
        description: sanitizeString(body.description || '', 1000),
        basePrice,
        price,
        discount,
        stockShop,
        stockGodown,
        stock: stockShop + stockGodown,
        sequence,
        categoryId: body.categoryId,
        imageUrls: Array.isArray(body.imageUrls) ? body.imageUrls.filter(u => typeof u === 'string').slice(0, 10) : []
      }
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
