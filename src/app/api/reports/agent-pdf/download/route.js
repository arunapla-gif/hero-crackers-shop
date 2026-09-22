import prisma from '@/lib/prisma';
import { generateAgentSpecificPDFBuffer } from '@/lib/pdfGenerator';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentName = searchParams.get('agentName');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!agentName) {
      return NextResponse.json({ error: 'agentName is required' }, { status: 400 });
    }

    const dateFilter = {};
    if (startDate && endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.gte = new Date(startDate);
      dateFilter.lte = end;
    }

    const ordersWhere = {
      referredBy: agentName === 'Direct (No Agent)' ? null : agentName,
      status: { not: 'CANCELLED' }
    };
    if (startDate && endDate) {
      ordersWhere.createdAt = dateFilter;
    }

    const orders = await prisma.order.findMany({
      where: ordersWhere,
      include: {
        items: true,
        user: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const agentDetails = {
      name: agentName,
      orders
    };

    const pdfBuffer = await generateAgentSpecificPDFBuffer(agentDetails);
    const cleanName = agentName.replace(/[^a-zA-Z0-9]/g, '_');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Report_${cleanName}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Failed to generate Agent PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
