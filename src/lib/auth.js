import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const getSecretKey = () => {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('JWT_SECRET is not set in environment variables. Auth will fail at runtime.');
    }
    // Return a dummy key for build-time evaluation if missing
    return new TextEncoder().encode('fallback-secret-for-build-time-only-123456');
  }
  return new TextEncoder().encode(secretKey);
};

// 24 hours expiry
const COOKIE_NAME = 'admin_session';

export async function encrypt(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecretKey());
}

export async function decrypt(input) {
  try {
    const { payload } = await jwtVerify(input, getSecretKey(), {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function setSessionCookie(user) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const session = await encrypt({ user, expires });

  cookies().set(COOKIE_NAME, session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export async function getSession() {
  const session = cookies().get(COOKIE_NAME)?.value;
  if (!session) return null;
  return await decrypt(session);
}
