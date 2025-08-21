import { cookies } from 'next/headers';
import { verifyToken, type AuthUser, generateToken as signToken } from './auth';

const SESSION_COOKIE_NAME = 'construction-auth-token';

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  return verifyToken(token);
}

export async function setSession(user: AuthUser): Promise<void> {
  const cookieStore = await cookies();
  const token = signToken(user);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
