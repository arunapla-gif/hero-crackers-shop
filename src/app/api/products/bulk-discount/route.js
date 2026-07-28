import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { discount } = await req.json();
    
    if (typeof discount !== 'number' || discount < 0 || discount >= 100) {
      return NextResponse.json({ error: 'Invalid discount percentage (must be between 0 and 99)' }, { status: 400 });
    }

    // Fetch all products
    const products = await prisma.product.findMany();
    
    // We will do a batch update via individual calls in a transaction since Prisma doesn't natively support 
    // row-level dynamic math like `basePrice = price / factor` in updateMany.
    const transactionOps = products.map(product => {
      // Reverse MRP calculation
      // For 50% discount: factor = 1 - (50/100) = 0.5
      // MRP (basePrice) = Math.round(price / 0.5)
      
      const factor = 1 - (discount / 100);
      let newBasePrice = product.price; // if discount is 0, basePrice equals selling price
      
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
    
    return NextResponse.json({ message: 'Global discount applied successfully', discountApplied: discount });
  } catch (error) {
    console.error('Failed to apply global discount:', error);
    return NextResponse.json({ error: 'Failed to apply global discount' }, { status: 500 });
  }
}
