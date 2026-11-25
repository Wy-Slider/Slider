import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAppBySlug } from '@/lib/store';
import WorkspaceClient from '@/components/WorkspaceClient';
import WySliderLogo from '@/components/WySliderLogo';

export const dynamic = 'force-dynamic';

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = await getAppBySlug(slug);

  if (!app) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#0B1120] flex flex-col items-center justify-center px-6 text-center">
        <WySliderLogo size="md" />
        <h1 className="mt-8 font-display text-2xl font-semibold tracking-tight">
          Workspace not found
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-md">
          No WySlider app is currently registered at{' '}
          <span className="font-mono text-slate-800">/{slug}</span>.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1D4ED8] rounded-xl hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  return <WorkspaceClient app={app} />;
}
