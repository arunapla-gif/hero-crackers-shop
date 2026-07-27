import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const updates = await req.json();

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: 'Expected an array of updates' }, { status: 400 });
    }

    // Run all updates in a single transaction
    const updatePromises = updates.map((update) =>
      prisma.product.update({
        where: { id: update.id },
        data: { sequence: update.sequence },
      })
    );

    await prisma.$transaction(updatePromises);

    return NextResponse.json({ success: true, count: updates.length });
  } catch (error) {
    console.error('Bulk sequence update error:', error);
    return NextResponse.json({ error: 'Failed to update sequences' }, { status: 500 });
  }
}
