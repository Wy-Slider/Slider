import crypto from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'wyslider_admin_session';

const EXPECTED_PASSWORD = process.env.WYSLIDER_ADMIN_PASSWORD || 'slider2admin2005';
const SESSION_SECRET = process.env.WYSLIDER_SESSION_SECRET || 'wyslider-admin-hmac-secret-2026';

export function verifyAdminPassword(password: string): boolean {
  const inputBuf = Buffer.from(password, 'utf8');
  const expectedBuf = Buffer.from(EXPECTED_PASSWORD, 'utf8');
  if (inputBuf.length !== expectedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(inputBuf, expectedBuf);
}

export function createSessionToken(): string {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 12; // 12 hours
  const payload = `admin:${expiresAt}`;
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex');
  return `${payload}:${sig}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(':');
  if (parts.length !== 3) return false;
  const [role, expiresStr, sig] = parts;
  if (role !== 'admin') return false;
  const expiresAt = Number(expiresStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const payload = `${role}:${expiresStr}`;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex');

  const sigBuf = Buffer.from(sig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expectedBuf);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
