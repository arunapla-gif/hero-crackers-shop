import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const transports = await prisma.transportMaster.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(transports);
  } catch (error) {
    console.error('Failed to fetch transports:', error);
    return NextResponse.json({ error: 'Failed to fetch transports' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newTransport = await prisma.transportMaster.create({
      data: {
        name: body.name,
        phone: body.phone || null,
        isActive: true
      }
    });

    return NextResponse.json(newTransport);
  } catch (error) {
    console.error('Failed to create transport:', error);
    return NextResponse.json({ error: 'Failed to create transport' }, { status: 500 });
  }
}
