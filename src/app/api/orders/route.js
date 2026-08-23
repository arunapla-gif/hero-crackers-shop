import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { sendWhatsAppOrderConfirmation } from '@/lib/msg91';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // 1. Guest Checkout Logic: Find or create a user based on the phone number
    // We generate a dummy email since the User model requires a unique email.
    const dummyEmail = `${body.customerPhone.replace(/[^0-9]/g, '')}@guest.local`;
    
    let user = await prisma.user.findUnique({
      where: { email: dummyEmail }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: body.customerName,
          email: dummyEmail,
          password: 'guest-checkout-no-password', // Not used for actual login
          role: 'USER'
        }
      });
    }

    // 2. Create the Order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: parseFloat(body.totalAmount),
        shippingAddress: body.shippingAddress,
        customerPhone: body.customerPhone,
        referredBy: body.referredBy,
        paymentStatus: body.paymentStatus || 'UNPAID',
        paymentMethod: body.paymentMethod || null,
        paymentDetails: body.paymentDetails || null,
        status: 'PENDING',
        items: {
          create: body.items.map(item => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price)
          }))
        }
      },
      include: { items: true }
    });

    // 3. Sync with CustomerMaster
    if (body.customerPhone) {
      const phone = body.customerPhone.replace(/[^0-9]/g, '').slice(-10);
      if (phone.length === 10) {
        const existingCustomer = await prisma.customerMaster.findUnique({
          where: { primaryPhone: phone }
        });
        if (existingCustomer) {
          // Update address if it exists
          await prisma.customerMaster.update({
            where: { primaryPhone: phone },
            data: { fullAddress: body.shippingAddress, name: body.customerName || existingCustomer.name }
          });
        } else {
          // Create new customer profile
          await prisma.customerMaster.create({
            data: {
              primaryPhone: phone,
              name: body.customerName || 'Walk-in Customer',
              fullAddress: body.shippingAddress
            }
          });
        }
      }
    }
    

    // 4. Send WhatsApp Notification via MSG91
    if (order.customerPhone) {
      // Fire and forget (don't await) so it doesn't block the API response
      sendWhatsAppOrderConfirmation(
        order.customerPhone,
        body.customerName || 'Customer',
        order.id,
        order.totalAmount
      ).catch(err => console.error('Error triggering WhatsApp notification:', err));
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Failed to submit estimate:', error);
    return NextResponse.json({ error: 'Failed to submit estimate' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || 'ALL';
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;

    const where = {};
    if (status !== 'ALL') {
      where.status = status;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        where.createdAt.lt = end;
      }
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { shippingAddress: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { referredBy: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true, user: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where })
    ]);

    return NextResponse.json({ orders, totalCount });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
