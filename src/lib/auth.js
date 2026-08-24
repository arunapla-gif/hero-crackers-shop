import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error('JWT_SECRET is not set in environment variables');
}
const key = new TextEncoder().encode(secretKey);

// 24 hours expiry
const COOKIE_NAME = 'admin_session';

export async function encrypt(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function decrypt(input) {
  try {
    const { payload } = await jwtVerify(input, key, {
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
