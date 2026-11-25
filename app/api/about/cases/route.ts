import { NextResponse } from 'next/server';
import { getOrRefreshCaseExamples } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await getOrRefreshCaseExamples();
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Unable to generate AI case examples at this time.';
    console.error('GET /api/about/cases error:', err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
