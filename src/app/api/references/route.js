import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const references = await prisma.referenceMaster.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(references);
  } catch (error) {
    console.error('Failed to fetch references:', error);
    return NextResponse.json({ error: 'Failed to fetch references' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newRef = await prisma.referenceMaster.create({
      data: {
        name: body.name,
        phone: body.phone || null,
        isActive: true
      }
    });

    return NextResponse.json(newRef);
  } catch (error) {
    console.error('Failed to create reference:', error);
    return NextResponse.json({ error: 'Failed to create reference' }, { status: 500 });
  }
}
