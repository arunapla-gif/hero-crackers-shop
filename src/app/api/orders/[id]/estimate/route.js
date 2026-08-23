import prisma from '@/lib/prisma';
import { generateInvoicePDFBuffer } from '@/lib/pdfGenerator';
import { NextResponse } from 'next/server';
import { formatOrderNumber } from '@/lib/utils';


export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, user: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const products = await prisma.product.findMany();
    
    // Generate the PDF buffer
    const pdfBuffer = await generateInvoicePDFBuffer(order, products);

    // Return the native PDF file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Estimate_${formatOrderNumber(order.orderNumber, order.createdAt)}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Failed to generate PDF invoice:', error);
    return NextResponse.json({ error: 'Failed to generate PDF invoice' }, { status: 500 });
  }
}
