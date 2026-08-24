import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { setSessionCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.role !== 'ADMIN') {
      // Return generic error for security (don't reveal if email exists)
      return NextResponse.json({ error: 'Invalid credentials or unauthorized' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials or unauthorized' }, { status: 401 });
    }

    // Passwords match, user is admin
    await setSessionCookie({ id: user.id, email: user.email, role: user.role, name: user.name });

    return NextResponse.json({ success: true, user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
