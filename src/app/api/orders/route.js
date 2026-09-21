import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendWhatsAppOrderConfirmation, sendAdminOrderAlert } from '@/lib/msg91';
import { requireAdminApi } from '@/lib/apiAuth';
import limiter from '@/lib/rateLimit';
import { isValidPhone, cleanPhone, sanitizeString, isValidQuantity } from '@/lib/validation';

export async function POST(request) {
  // 1. Bot honeypot & Rate limiting
  const clientIp = limiter.getClientIp(request);
  const rateLimitKey = `order_create:${clientIp}`;
  const rateLimitStatus = limiter.isRateLimited(rateLimitKey, 15, 10 * 60 * 1000); // max 15 orders / 10 mins

  if (rateLimitStatus.limited) {
    return NextResponse.json(
      { error: 'Order submission rate limit exceeded. Please wait a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(rateLimitStatus.retryAfterSeconds) } }
    );
  }

  try {
    const body = await request.json();

    // Honeypot bot protection: hidden fields should always be empty
    if (body.website || body.fax || body.company_url) {
      return NextResponse.json({ error: 'Bot submission detected.' }, { status: 400 });
    }

    // 2. Strict Input Validation & Sanitization
    const rawPhone = body.customerPhone || '';
    if (!isValidPhone(rawPhone)) {
      return NextResponse.json({ error: 'A valid 10-digit mobile number is required.' }, { status: 400 });
    }

    const phone = cleanPhone(rawPhone);
    const customerName = sanitizeString(body.customerName || 'Customer', 100);
    const shippingAddress = sanitizeString(body.shippingAddress || '', 500);
    const referredBy = sanitizeString(body.referredBy || '', 100);
    const remarks = sanitizeString(body.remarks || '', 500);

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one product.' }, { status: 400 });
    }

    // Validate each item structure and quantities
    for (const item of body.items) {
      if (!item.productId || typeof item.productId !== 'string') {
        return NextResponse.json({ error: 'Invalid product in order items.' }, { status: 400 });
      }
      if (!isValidQuantity(item.quantity)) {
        return NextResponse.json({ error: 'Quantity must be a positive number up to 1000.' }, { status: 400 });
      }
    }

    // 3. Anti-Tampering: Fetch authoritative product prices from DB
    const productIds = body.items.map(i => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, basePrice: true, discount: true }
    });

    const productMap = new Map(dbProducts.map(p => [p.id, p]));

    // Verify all requested products exist in DB
    for (const item of body.items) {
      if (!productMap.has(item.productId)) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }
    }

    // Calculate true item prices and total strictly server-side
    let calculatedTotal = 0;
    const validatedItems = body.items.map(item => {
      const dbProduct = productMap.get(item.productId);
      const qty = parseInt(item.quantity);
      // Authoritative unit price from DB
      const unitPrice = dbProduct.price;
      calculatedTotal += unitPrice * qty;

      return {
        productId: item.productId,
        quantity: qty,
        price: unitPrice
      };
    });

    // 4. Guest Checkout User Creation with Hashed Password
    // Each order is an independent transaction: create a dedicated guest user identity
    // so every order permanently preserves its exact customerName and phone without overwriting past orders.
    const guestId = crypto.randomUUID();
    const uniqueEmail = `guest_${phone}_${guestId.substring(0, 8)}@guest.local`;
    const hashedPassword = await bcrypt.hash(crypto.randomUUID(), 10);
    const user = await prisma.user.create({
      data: {
        name: customerName,
        email: uniqueEmail,
        password: hashedPassword,
        role: 'USER'
      }
    });

    // 5. Create Order with Server-Calculated Total
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: calculatedTotal,
        shippingAddress: shippingAddress,
        customerPhone: phone,
        referredBy: referredBy || null,
        remarks: remarks || null,
        paymentStatus: body.paymentStatus || 'UNPAID',
        paymentMethod: body.paymentMethod || null,
        paymentDetails: body.paymentDetails || null,
        status: 'PENDING',
        source: body.source || 'WEBSITE',
        items: {
          create: validatedItems
        }
      },
      include: { 
        items: true,
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    // 6. Sync with CustomerMaster (Without erasing original registered name)
    const existingCustomer = await prisma.customerMaster.findUnique({
      where: { primaryPhone: phone }
    });
    if (existingCustomer) {
      // Keep existing customer primary name, update address if provided
      await prisma.customerMaster.update({
        where: { primaryPhone: phone },
        data: { 
          fullAddress: shippingAddress || existingCustomer.fullAddress,
          city: existingCustomer.city || (shippingAddress.includes(',') ? shippingAddress.split(',').pop().trim() : undefined)
        }
      });
    } else {
      await prisma.customerMaster.create({
        data: {
          primaryPhone: phone,
          name: customerName || 'Walk-in Customer',
          fullAddress: shippingAddress,
          city: shippingAddress.includes(',') ? shippingAddress.split(',').pop().trim() : null
        }
      });
    }

    // 7. Send WhatsApp Notification via MSG91 (non-blocking)
    if (order.customerPhone && !body.skipWhatsApp) {
      sendWhatsAppOrderConfirmation(
        order.customerPhone,
        customerName || 'Customer',
        order.id,
        order.totalAmount
      ).catch(err => console.error('Error triggering WhatsApp notification:', err));

      sendAdminOrderAlert(
        customerName || 'Customer',
        order.customerPhone,
        order.id,
        order.totalAmount
      ).catch(err => console.error('Error triggering admin WhatsApp alert:', err));
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Failed to submit order:', error);
    return NextResponse.json({ error: 'Failed to submit estimate' }, { status: 500 });
  }
}

export async function GET(request) {
  // Enforce server-side Admin Authentication
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const status = searchParams.get('status') || 'ALL';
    const source = searchParams.get('source') || 'ALL';
    const search = sanitizeString(searchParams.get('search') || '', 100);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;

    const where = {};
    if (status !== 'ALL') {
      where.status = status;
    }
    if (source !== 'ALL') {
      where.source = source;
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
        { referredBy: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Trim user fields to prevent password hash leakage
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { 
          items: true, 
          user: {
            select: { id: true, name: true, email: true, role: true }
          }
        },
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
