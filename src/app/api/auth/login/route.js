import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { setSessionCookie } from '@/lib/auth';
import limiter from '@/lib/rateLimit';
import { sanitizeString } from '@/lib/validation';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request) {
  const clientIp = limiter.getClientIp(request);
  const rateLimitKey = `login_fail:${clientIp}`;

  // Check if IP is currently locked out
  const limitStatus = limiter.getFailures(rateLimitKey, MAX_LOGIN_ATTEMPTS, LOCKOUT_WINDOW_MS);
  if (limitStatus.limited) {
    return NextResponse.json(
      { 
        error: `Too many failed login attempts. Please try again in ${limitStatus.retryAfterSeconds} seconds.` 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(limitStatus.retryAfterSeconds)
        }
      }
    );
  }

  try {
    const body = await request.json();
    const email = sanitizeString(body.email, 100).toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.role !== 'ADMIN') {
      limiter.recordFailure(rateLimitKey, LOCKOUT_WINDOW_MS);
      return NextResponse.json({ error: 'Invalid credentials or unauthorized' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      limiter.recordFailure(rateLimitKey, LOCKOUT_WINDOW_MS);
      return NextResponse.json({ error: 'Invalid credentials or unauthorized' }, { status: 401 });
    }

    // Passwords match - clear rate limit on success
    limiter.reset(rateLimitKey);

    // Set secure HTTP-only session cookie
    await setSessionCookie({ id: user.id, email: user.email, role: user.role, name: user.name });

    return NextResponse.json({ 
      success: true, 
      user: { name: user.name, email: user.email } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
