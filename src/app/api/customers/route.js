import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/apiAuth';
import { sanitizeString, cleanPhone, isValidPhone } from '@/lib/validation';

export async function GET(request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const phone = cleanPhone(searchParams.get('phone') || '');
    
    const where = { isActive: true };
    if (phone) {
      where.primaryPhone = { contains: phone };
    }

    const customers = await prisma.customerMaster.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const data = await request.json();
    
    if (!data.primaryPhone || !data.name) {
      return NextResponse.json({ error: 'Phone and Name are required' }, { status: 400 });
    }

    if (!isValidPhone(data.primaryPhone)) {
      return NextResponse.json({ error: 'Valid 10-digit primary phone is required' }, { status: 400 });
    }

    const phone = cleanPhone(data.primaryPhone);

    const existing = await prisma.customerMaster.findUnique({
      where: { primaryPhone: phone }
    });

    if (existing) {
      return NextResponse.json({ error: 'Customer with this phone already exists' }, { status: 400 });
    }

    const customer = await prisma.customerMaster.create({
      data: {
        primaryPhone: phone,
        alternatePhone: data.alternatePhone ? sanitizeString(data.alternatePhone, 20) : null,
        name: sanitizeString(data.name, 100),
        fullAddress: sanitizeString(data.fullAddress || '', 500),
        city: sanitizeString(data.city || '', 100),
      }
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Failed to create customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
