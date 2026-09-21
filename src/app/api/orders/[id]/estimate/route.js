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
    const cleanName = customerName.replace(/[^a-zA-Z0-9\s]/g, "").trim().substring(0, 15).replace(/\s+/g, "_");
    
    let city = 'City';
    if (order.shippingAddress) {
      const parts = order.shippingAddress.split(',').map(s => s.trim());
      if (parts.length >= 3) {
        city = parts[parts.length - 2]; // Second to last is City
      } else if (parts.length === 2) {
        city = parts[1]; // Last is City
      } else {
        city = parts[0];
      }
    }
    const cleanCity = city.replace(/[^a-zA-Z0-9\s]/g, "").trim().substring(0, 15).replace(/\s+/g, "_");
    
    const displayOrderNo = order.orderNumber ? String(order.orderNumber).padStart(3, '0').slice(-3) : String(order.id).substring(0, 3);
    const displayString = `Estimate-${displayOrderNo}-${cleanName}-${cleanCity}`;

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
