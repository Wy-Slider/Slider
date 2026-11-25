import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createSessionToken,
  isAdminAuthenticated,
  verifyAdminPassword,
} from '@/lib/admin-auth';

function isHttpsRequest(req: NextRequest): boolean {
  const proto = req.headers.get('x-forwarded-proto');
  if (proto) return proto.split(',')[0].trim() === 'https';
  return req.nextUrl.protocol === 'https:';
}

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  return NextResponse.json({ authenticated });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { password?: string };
    const password = typeof body.password === 'string' ? body.password : '';

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { authenticated: false, error: 'Incorrect admin password.' },
        { status: 401 }
      );
    }

    const token = createSessionToken();
    const res = NextResponse.json({ authenticated: true });
    const secure = isHttpsRequest(req);

    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 12,
      sameSite: secure ? 'none' : 'lax',
      secure,
    });

    return res;
  } catch {
    return NextResponse.json(
      { authenticated: false, error: 'Invalid request payload.' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ authenticated: false });
  const secure = isHttpsRequest(req);
  res.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: secure ? 'none' : 'lax',
    secure,
  });
  return res;
}
