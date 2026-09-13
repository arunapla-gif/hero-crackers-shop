import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/apiAuth';
import { sanitizeString } from '@/lib/validation';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

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
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const godown = await prisma.godown.create({
      data: {
        name: sanitizeString(body.name, 100),
        location: sanitizeString(body.location || '', 200)
      }
    });
    return NextResponse.json(godown);
  } catch (error) {
    console.error('Failed to create godown:', error);
    return NextResponse.json({ error: 'Failed to create godown' }, { status: 500 });
  }
}
