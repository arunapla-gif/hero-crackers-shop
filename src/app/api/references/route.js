import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/apiAuth';
import { sanitizeString } from '@/lib/validation';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

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
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newRef = await prisma.referenceMaster.create({
      data: {
        name: sanitizeString(body.name, 100),
        phone: body.phone ? sanitizeString(body.phone, 20) : null,
        isActive: true
      }
    });

    return NextResponse.json(newRef);
  } catch (error) {
    console.error('Failed to create reference:', error);
    return NextResponse.json({ error: 'Failed to create reference' }, { status: 500 });
  }
}
