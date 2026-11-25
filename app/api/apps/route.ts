import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import {
  addApp,
  getAllApps,
  triggerBackgroundCaseRefresh,
} from '@/lib/store';

export async function GET() {
  try {
    const data = await getAllApps();
    return NextResponse.json(data);
  } catch (err) {
    console.error('GET /api/apps error:', err);
    return NextResponse.json(
      { error: 'Unable to load WySlider applications.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json(
      { error: 'Admin authentication required.' },
      { status: 401 }
    );
  }

  try {
    const body = (await req.json()) as {
      name?: string;
      description?: string;
      logo?: string;
      appUrl?: string;
      slug?: string;
    };

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const description =
      typeof body.description === 'string' ? body.description.trim() : '';
    const logo = typeof body.logo === 'string' ? body.logo.trim() : '';
    const appUrl = typeof body.appUrl === 'string' ? body.appUrl.trim() : '';
    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';

    if (!name || name.length > 80) {
      return NextResponse.json(
        { error: 'App name is required and must be under 80 characters.' },
        { status: 400 }
      );
    }

    if (!description || description.length > 500) {
      return NextResponse.json(
        { error: 'Description is required and must be under 500 characters.' },
        { status: 400 }
      );
    }

    if (!logo) {
      return NextResponse.json(
        { error: 'Please import an app logo image.' },
        { status: 400 }
      );
    }

    if (appUrl && !/^https?:\/\/.+/i.test(appUrl)) {
      return NextResponse.json(
        { error: 'External URL must begin with http:// or https://.' },
        { status: 400 }
      );
    }

    const created = await addApp({ name, description, logo, appUrl, slug });
    triggerBackgroundCaseRefresh();

    return NextResponse.json({ app: created }, { status: 201 });
  } catch (err) {
    console.error('POST /api/apps error:', err);
    return NextResponse.json(
      { error: 'Failed to create app.' },
      { status: 500 }
    );
  }
}
