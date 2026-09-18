import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/apiAuth';
import { sanitizeString, isValidPrice } from '@/lib/validation';

export async function POST(request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    
    if (!body.name || !body.price) {
      return NextResponse.json({ error: 'Name and price are required for a custom item' }, { status: 400 });
    }

    if (!isValidPrice(body.price)) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }

    const price = parseFloat(body.price);

    // Ensure Custom Items category exists
    let customCategory = await prisma.category.findUnique({
      where: { slug: 'custom-items' }
    });

    if (!customCategory) {
      customCategory = await prisma.category.create({
        data: {
          name: 'Custom Items',
          slug: 'custom-items',
          sequence: 9999
        }
      });
    }

    const product = await prisma.product.create({
      data: {
        name: sanitizeString(body.name, 200),
        description: 'Miscellaneous / Custom POS Item',
        basePrice: price,
        price: price,
        discount: 0,
        stockShop: 9999, // infinite stock for custom items
        stockGodown: 0,
        stock: 9999,
        sequence: 9999,
        categoryId: customCategory.id,
        imageUrls: []
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to create custom item:', error);
    return NextResponse.json({ error: 'Failed to create custom item' }, { status: 500 });
  }
}
