import { decrypt } from '@/lib/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Validates that the request has an active, valid admin session.
 * Returns { authorized: true, user } if valid, or { authorized: false, response } for immediate return.
 */
export async function requireAdminApi() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;

    if (!token) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Unauthorized: Authentication required.' },
          { status: 401 }
        )
      };
    }

    const payload = await decrypt(token);

    if (!payload || !payload.user || payload.user.role !== 'ADMIN') {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Forbidden: Administrator privileges required.' },
          { status: 403 }
        )
      };
    }

    return {
      authorized: true,
      user: payload.user
    };
  } catch (error) {
    console.error('API Auth verification error:', error);
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Unauthorized: Invalid or expired session.' },
        { status: 401 }
      )
    };
  }
}
