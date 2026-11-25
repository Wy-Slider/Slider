'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Play,
  RotateCcw,
  FileText,
} from 'lucide-react';
import type { WySliderApp } from '@/lib/types';
import { WySliderMark } from './WySliderLogo';
import AppLogoImage from './AppLogoImage';

interface WorkspaceClientProps {
  app: WySliderApp;
}

type OutputMode = 'concise' | 'detailed' | 'action-plan';

function buildSampleInput(app: WySliderApp): string {
  const lower = `${app.name} ${app.description}`.toLowerCase();
  if (lower.includes('mail') || lower.includes('email') || lower.includes('reply')) {
    return `From: Nadia Patel (Operations)\nSubject: Q4 Vendor Renewal & Onboarding Delay\n\nHi team,\nWe still haven't received the finalized SLA schedule from Northstar Logistics. Finance needs the revised unit pricing by Thursday 3 PM or the PO rolls over into next month. Also, please confirm whether their API sandbox access is included in the base tier or billed separately.\n\nCan someone send a clear update before noon tomorrow?`;
  }
  if (lower.includes('sheet') || lower.includes('csv') || lower.includes('data')) {
    return `Region,Month,Orders,Returns,Revenue_USD,Notes\nNorth,Oct,412,18,48920,promo week\nnorth,oct,18,1,2140,late sync\nSouth,Oct,305,29,34100,carrier delay\nWest,Oct,519,11,64800,\nEast,Oct,288,14,31900,missing invoice tag`;
  }
  if (lower.includes('doc') || lower.includes('contract') || lower.includes('clause') || lower.includes('pdf')) {
    return `Master Services Addendum — Section 4 & 7:\n4.2 Delivery milestones must be submitted within 10 business days of kick-off. Late submissions incur a 2% weekly service credit capped at 10% of monthly fees.\n7.1 Either party may terminate for convenience with 45 days written notice prior to the annual renewal date (March 15). Auto-renewal applies for 12 months unless notice is received.\n7.4 Vendor liability is capped at fees paid in the preceding 6 months, excluding confidentiality breaches.`;
  }
  return `Raw sync notes — Product & Ops Tuesday check-in:\n- Checkout latency spiked 40% after Monday banner deploy, rollback fixed it by 11:20.\n- Customer onboarding checklist still requires 6 manual copy-paste steps in CRM.\n- Sara to audit top 15 support tickets by Friday.\n- Need crisp summary for leadership + 3 immediate owners to cut manual triage time in half.`;
}

export default function WorkspaceClient({ app }: WorkspaceClientProps) {
  const router = useRouter();
  const visitRecorded = useRef(false);

  const [input, setInput] = useState('');
  const [outputMode, setOutputMode] = useState<OutputMode>('concise');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (visitRecorded.current) return;
    visitRecorded.current = true;
    void fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: app.slug }),
    }).catch(() => undefined);
  }, [app.slug]);

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isRunning) return;

    setIsRunning(true);
    setError(null);
    setCopied(false);

    try {
      const res = await fetch('/api/workspace/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: app.slug,
          input: input.trim(),
          outputMode,
        }),
      });
      const data = (await res.json()) as { output?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to run tool.');
      }
      setOutput(data.output || '');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to process request.'
      );
    } finally {
      setIsRunning(false);
    }
  }

  async function handleCopy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable
    }
  }

  const hasExternalUrl = Boolean(app.appUrl && app.appUrl.trim().length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0B1120]">
      {/* 2.1 Active App Route Header */}
      <header className="h-12 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <WySliderMark size="sm" />
          <span className="text-slate-300" aria-hidden="true">
            /
          </span>
          <span className="font-display font-semibold text-sm text-[#0B1120] truncate">
            {app.name}
          </span>
          <span
            className="hidden sm:inline-block text-slate-300"
            aria-hidden="true"
          >
            ·
          </span>
          <span className="hidden sm:inline-block text-xs font-mono text-slate-500 truncate">
            /{app.slug}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {hasExternalUrl && (
            <a
              href={app.appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#1D4ED8] transition-colors whitespace-nowrap shrink-0"
            >
              <span>Open source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </header>

      {/* 2.2 Center: App Display */}
      <main className="flex-1 flex flex-col relative">
        {hasExternalUrl ? (
          <div className="flex-1 w-full bg-white relative min-h-[calc(100vh-3rem)]">
            <iframe
              src={app.appUrl}
              title={app.name}
              className="w-full h-[calc(100vh-3rem)] border-0 block"
              allow="clipboard-read; clipboard-write; microphone; camera"
            />
          </div>
        ) : (
          <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 pb-24 flex flex-col gap-6">
            {/* Tool Identity Strip */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <AppLogoImage
                  src={app.logo}
                  name={app.name}
                  sizeClass="w-14 h-14"
                />
                <div>
                  <h1 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-[#0B1120]">
                    {app.name}
                  </h1>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed max-w-2xl">
                    {app.description}
                  </p>
                </div>
              </div>

              {/* Output Depth Segmented Control */}
              <div
                role="group"
                aria-label="Output format"
                className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-center shrink-0"
              >
                {(
                  [
                    { id: 'concise', label: 'Concise' },
                    { id: 'detailed', label: 'Detailed' },
                    { id: 'action-plan', label: 'Action Plan' },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setOutputMode(mode.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      outputMode === mode.id
                        ? 'bg-white text-[#0B1120] shadow-sm'
                        : 'text-slate-600 hover:text-[#0B1120]'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Workspace Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch flex-1">
              {/* Input Panel */}
              <form
                onSubmit={handleRun}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <label
                    htmlFor="workspace-input"
                    className="text-sm font-medium text-[#0B1120]"
                  >
                    Input material
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInput(buildSampleInput(app))}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#1D4ED8] px-2.5 py-1 rounded-md hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Load sample</span>
                    </button>
                    {input && (
                      <button
                        type="button"
                        onClick={() => {
                          setInput('');
                          setOutput('');
                          setError(null);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  id="workspace-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Paste raw notes, text, or data for ${app.name} to handle…`}
                  rows={11}
                  className="flex-1 w-full resize-y rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm text-[#0B1120] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors leading-relaxed"
                />

                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="text-xs font-mono tabular-nums text-slate-400">
                    {input.length} chars
                  </span>
                  <button
                    type="submit"
                    disabled={!input.trim() || isRunning}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1D4ED8] rounded-xl hover:bg-blue-700 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing…</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Run {app.name}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Output Panel */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-sm font-medium text-[#0B1120]">
                    Result
                  </span>
                  {output && (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#0B1120] px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex-1 rounded-xl border border-slate-200/80 bg-[#F8FAFC] p-4 overflow-y-auto min-h-[260px]">
                  {isRunning ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                      <div className="h-3 bg-slate-200 rounded w-full" />
                      <div className="h-3 bg-slate-200 rounded w-11/12" />
                      <div className="h-3 bg-slate-200 rounded w-4/5" />
                      <div className="h-4 bg-slate-200 rounded w-2/5 mt-4" />
                      <div className="h-3 bg-slate-200 rounded w-5/6" />
                    </div>
                  ) : error ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  ) : output ? (
                    <div className="text-sm text-[#0B1120] whitespace-pre-wrap leading-relaxed">
                      {output}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4 py-10 text-slate-400">
                      <p className="text-sm font-medium text-slate-500">
                        Ready for input
                      </p>
                      <p className="mt-1 text-xs text-slate-400 max-w-xs">
                        Add your material on the left or click Load sample, then run {app.name}.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 2.3 Bottom Float Button: hides app's bottom watermark & returns to home page */}
      <motion.button
        type="button"
        onClick={() => router.push('/')}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        aria-label="Back to WySlider home page"
        className="fixed bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-40 h-11 min-w-[216px] px-5 rounded-xl bg-[#0B1120] text-white border border-slate-700/90 shadow-xl flex items-center justify-center gap-3 hover:bg-slate-900 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <ArrowLeft className="w-4 h-4 text-blue-400 shrink-0" />
        <WySliderMark size="sm" inverted />
        <span className="text-xs font-medium tracking-tight">
          Back to Home
        </span>
      </motion.button>
    </div>
  );
}
