import { NextRequest, NextResponse } from 'next/server';
import { incrementAppVisit } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { slug?: string };
    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required.' }, { status: 400 });
    }
    const updated = await incrementAppVisit(slug);
    if (!updated) {
      return NextResponse.json({ error: 'App not found.' }, { status: 404 });
    }
    return NextResponse.json({ visitCount: updated.visitCount });
  } catch {
    return NextResponse.json(
      { error: 'Failed to record visit.' },
      { status: 500 }
    );
  }
}
