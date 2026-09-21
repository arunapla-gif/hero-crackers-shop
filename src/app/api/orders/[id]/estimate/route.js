import prisma from '@/lib/prisma';
import { generateInvoicePDFBuffer } from '@/lib/pdfGenerator';
import { NextResponse } from 'next/server';
import { formatOrderNumber } from '@/lib/utils';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { 
        items: true, 
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const products = await prisma.product.findMany();
    
    // Generate the PDF buffer
    const pdfBuffer = await generateInvoicePDFBuffer(order, products);

    const customerName = order.user?.name || 'Customer';
    const last3 = order.customerPhone ? String(order.customerPhone).replace(/[^0-9]/g, '').slice(-3) : '000';
    const cleanName = customerName.replace(/[^a-zA-Z0-9\s]/g, "").trim().substring(0, 15).replace(/\s+/g, "_");
    
    let city = 'City';
    if (order.shippingAddress) {
      city = order.shippingAddress.includes(',') ? order.shippingAddress.split(',').pop().trim() : order.shippingAddress.trim();
    }
    const cleanCity = city.replace(/[^a-zA-Z0-9\s]/g, "").trim().substring(0, 15).replace(/\s+/g, "_");
    
    const displayOrderNo = order.orderNumber ? String(order.orderNumber) : String(order.id).substring(0, 5);
    const displayString = `Estimate-${displayOrderNo}(${last3})-${cleanName}-${cleanCity}`;

    // Return the native PDF file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${displayString}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Failed to generate PDF invoice:', error);
    return NextResponse.json({ error: 'Failed to generate PDF invoice' }, { status: 500 });
  }
}
