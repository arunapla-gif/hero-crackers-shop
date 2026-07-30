import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    
    // We want to fetch all active customers or search by phone
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
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.primaryPhone || !data.name) {
      return NextResponse.json({ error: 'Phone and Name are required' }, { status: 400 });
    }

    const phone = data.primaryPhone.replace(/[^0-9]/g, '').slice(-10);

    // Check existing
    const existing = await prisma.customerMaster.findUnique({
      where: { primaryPhone: phone }
    });

    if (existing) {
      return NextResponse.json({ error: 'Customer with this phone already exists' }, { status: 400 });
    }

    const customer = await prisma.customerMaster.create({
      data: {
        primaryPhone: phone,
        alternatePhone: data.alternatePhone,
        name: data.name,
        fullAddress: data.fullAddress,
        city: data.city,
      }
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Failed to create customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
