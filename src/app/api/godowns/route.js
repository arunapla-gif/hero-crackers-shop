import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const godowns = await prisma.godown.findMany({
      include: {
        stocks: {
          include: { product: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(godowns);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch godowns' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const godown = await prisma.godown.create({
      data: {
        name: body.name,
        location: body.location
      }
    });
    return NextResponse.json(godown);
  } catch (error) {
    console.error('Failed to create godown:', error);
    return NextResponse.json({ error: 'Failed to create godown' }, { status: 500 });
  }
}
