import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminApi } from '@/lib/apiAuth';

export async function POST(req) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const updates = await req.json();

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: 'Expected an array of updates' }, { status: 400 });
    }

    const updatePromises = updates.map((update) =>
      prisma.product.update({
        where: { id: update.id },
        data: { sequence: parseInt(update.sequence) || 0 },
      })
    );

    await prisma.$transaction(updatePromises);

    return NextResponse.json({ success: true, count: updates.length });
  } catch (error) {
    console.error('Bulk sequence update error:', error);
    return NextResponse.json({ error: 'Failed to update sequences' }, { status: 500 });
  }
}
