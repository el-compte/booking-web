import 'server-only';
import { cookies } from 'next/headers';

/**
 * Guests don't have accounts in this demo, so the browser remembers which
 * bookings it made in an http-only cookie.
 */
const COOKIE = 'hourstay_trips';
const MAX_TRIPS = 30;

export async function getTripIds(): Promise<string[]> {
  const value = (await cookies()).get(COOKIE)?.value ?? '';
  return value.split('.').filter((id) => /^[a-f\d]{24}$/i.test(id));
}

export async function addTripId(id: string): Promise<void> {
  const ids = [id, ...(await getTripIds()).filter((existing) => existing !== id)];
  (await cookies()).set(COOKIE, ids.slice(0, MAX_TRIPS).join('.'), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
}
