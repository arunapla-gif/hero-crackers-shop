import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { generateInvoicePDFBuffer, uploadMediaToWhatsApp, sendWhatsAppTemplate } from '@/lib/whatsapp.js';
import { formatOrderNumber } from '@/lib/utils';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    
    // Fetch the order with items and user
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, user: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.customerPhone) {
      return NextResponse.json({ error: 'Customer phone number is missing' }, { status: 400 });
    }

    // Update lastSentVersion to match current editVersion
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { lastSentVersion: order.editVersion }
    });

    // Run the WhatsApp sending logic (must await in Vercel serverless)
    let waResult = { success: false, error: 'Unknown error' };
    await (async () => {
      try {
        const products = await prisma.product.findMany();
        
        // Truncate name and city for the PDF filename (max 8 chars)
        const name = (order.user?.name || order.customerName || 'Cust').replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
        const city = (order.shippingAddress || 'City').replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
        const shortId = formatOrderNumber(order.orderNumber, order.createdAt);
        const version = order.editVersion;
        
        const fileName = `${shortId}-${name}-${city}-v${version}.pdf`;
        
        // 1. Build PDF
        const pdfBuffer = await generateInvoicePDFBuffer(order, products);
        
        // 2. Upload to Meta
        const mediaId = await uploadMediaToWhatsApp(pdfBuffer, fileName);
        
        // 3. Send Template
        // NOTE: During testing, we must use 'hello_world' because custom templates aren't approved yet.
        // 'hello_world' DOES NOT support media (documents). 
        // When you move to production, change 'hello_world' to your custom template name (e.g. 'order_estimate')
        // and pass `mediaId` as the 4th argument.
        waResult = await sendWhatsAppTemplate(order.customerPhone, 'hello_world', []);
        
        console.log(`Successfully sent WhatsApp manual bill for order ${formatOrderNumber(order.orderNumber, order.createdAt)} with filename ${fileName}`);
      } catch (err) {
        console.error('Failed background WhatsApp task:', err);
        waResult = { success: false, error: err.message };
      }
    })();

    if (!waResult?.success) {
      // Revert the lastSentVersion since it failed
      await prisma.order.update({
        where: { id },
        data: { lastSentVersion: order.lastSentVersion }
      });
      return NextResponse.json({ error: waResult?.error || 'Failed to send WhatsApp message' }, { status: 400 });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Failed to trigger WhatsApp manual send:', error);
    return NextResponse.json({ error: 'Failed to send WhatsApp message' }, { status: 500 });
  }
}
