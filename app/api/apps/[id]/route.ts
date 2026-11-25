import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import {
  removeApp,
  triggerBackgroundCaseRefresh,
  updateApp,
} from '@/lib/store';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json(
      { error: 'Admin authentication required.' },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;
    const body = (await req.json()) as {
      name?: string;
      description?: string;
      logo?: string;
      appUrl?: string;
      slug?: string;
    };

    if (body.name !== undefined && (!body.name.trim() || body.name.trim().length > 80)) {
      return NextResponse.json(
        { error: 'App name must be between 1 and 80 characters.' },
        { status: 400 }
      );
    }

    if (
      body.description !== undefined &&
      (!body.description.trim() || body.description.trim().length > 500)
    ) {
      return NextResponse.json(
        { error: 'Description must be between 1 and 500 characters.' },
        { status: 400 }
      );
    }

    if (body.appUrl && body.appUrl.trim() && !/^https?:\/\/.+/i.test(body.appUrl.trim())) {
      return NextResponse.json(
        { error: 'External URL must begin with http:// or https://.' },
        { status: 400 }
      );
    }

    const updated = await updateApp(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'App not found.' }, { status: 404 });
    }

    triggerBackgroundCaseRefresh();
    return NextResponse.json({ app: updated });
  } catch (err) {
    console.error('PATCH /api/apps/[id] error:', err);
    return NextResponse.json(
      { error: 'Failed to update app.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json(
      { error: 'Admin authentication required.' },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;
    const removed = await removeApp(id);
    if (!removed) {
      return NextResponse.json({ error: 'App not found.' }, { status: 404 });
    }

    triggerBackgroundCaseRefresh();
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/apps/[id] error:', err);
    return NextResponse.json(
      { error: 'Failed to remove app.' },
      { status: 500 }
    );
  }
}
