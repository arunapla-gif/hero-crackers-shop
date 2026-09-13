import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/apiAuth';

export async function POST(req) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { discount } = await req.json();
    
    if (typeof discount !== 'number' || discount < 0 || discount >= 100) {
      return NextResponse.json({ error: 'Invalid discount percentage (must be between 0 and 99)' }, { status: 400 });
    }

    const products = await prisma.product.findMany();
    
    const transactionOps = products.map(product => {
      const factor = 1 - (discount / 100);
      let newBasePrice = product.price;
      
      if (factor > 0 && discount > 0) {
         newBasePrice = Math.round(product.price / factor);
      }
      
      return prisma.product.update({
        where: { id: product.id },
        data: { 
          basePrice: newBasePrice,
          discount: discount
        }
      });
    });

    await prisma.$transaction(transactionOps);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully applied ${discount}% discount to ${products.length} products.` 
    });

  } catch (error) {
    console.error('Bulk discount error:', error);
    return NextResponse.json({ error: 'Failed to update bulk discount' }, { status: 500 });
  }
}
