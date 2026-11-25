import { NextRequest, NextResponse } from 'next/server';
import { getAppBySlug } from '@/lib/store';
import { runWorkspaceTool } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      slug?: string;
      input?: string;
      outputMode?: 'concise' | 'detailed' | 'action-plan';
    };

    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
    const input = typeof body.input === 'string' ? body.input.trim() : '';
    const outputMode = body.outputMode || 'concise';

    if (!slug || !input) {
      return NextResponse.json(
        { error: 'App identifier and input text are required.' },
        { status: 400 }
      );
    }

    const app = await getAppBySlug(slug);
    if (!app) {
      return NextResponse.json({ error: 'App not found.' }, { status: 404 });
    }

    const output = await runWorkspaceTool(app, input, outputMode);
    return NextResponse.json({ output });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unable to execute tool.';
    console.error('POST /api/workspace/run error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
