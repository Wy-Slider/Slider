'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { CaseExample } from '@/lib/types';
import WySliderLogo from './WySliderLogo';

interface AboutClientProps {
  initialCases: CaseExample[];
  needsRefresh: boolean;
  appCount: number;
}

export default function AboutClient({
  initialCases,
  needsRefresh,
  appCount,
}: AboutClientProps) {
  const [cases, setCases] = useState<CaseExample[]>(initialCases);
  const [loading, setLoading] = useState(needsRefresh && appCount > 0);
  const [error, setError] = useState<string | null>(null);
  const [heroImgError, setHeroImgError] = useState(false);

  useEffect(() => {
    if (!needsRefresh || appCount === 0) return;

    let cancelled = false;

    fetch('/api/about/cases', { cache: 'no-store' })
      .then(async (res) => {
        const data = (await res.json()) as {
          caseExamples?: CaseExample[];
          error?: string;
        };
        if (!res.ok) {
          throw new Error(data.error || 'Unable to generate case examples.');
        }
        if (!cancelled) {
          setError(null);
          setCases(data.caseExamples || []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load case examples.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [needsRefresh, appCount]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0B1120]">
      {/* Top Bar Contract (3 zones) */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-8">
          <Link href="/" className="whitespace-nowrap shrink-0">
            <WySliderLogo size="sm" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link
              href="/"
              className="hover:text-[#0B1120] transition-colors whitespace-nowrap shrink-0"
            >
              Apps
            </Link>
            <Link
              href="/about"
              className="text-[#1D4ED8] whitespace-nowrap shrink-0"
            >
              About
            </Link>
            <a
              href="#case-examples"
              className="hover:text-[#0B1120] transition-colors whitespace-nowrap shrink-0"
            >
              Case Examples
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1D4ED8] rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Open Apps</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Welcoming & Presentation Hero */}
        <section className="max-w-5xl mx-auto px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 flex flex-col justify-center"
            >
              <p className="text-sm font-medium text-[#1D4ED8]">
                Welcome to WySlider
              </p>
              <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight text-[#0B1120] leading-[1.15] text-balance">
                Software built to give your hours back.
              </h1>
              <p className="mt-5 text-base text-slate-600 leading-relaxed max-w-xl">
                WySlider brings together focused, single-purpose AI tools inside one calm workspace. Instead of wrestling with complex prompts or fragmented tabs, you open the tool built for the job, hand it the raw work, and move on with your day.
              </p>

              {/* Role */}
              <div className="mt-7 pt-6 border-t border-slate-200">
                <h2 className="text-xs font-medium text-slate-500">
                  Our Role
                </h2>
                <p className="mt-2 text-base sm:text-lg font-display font-medium text-[#0B1120] leading-relaxed">
                  We aim on human time freedom by creating powerful and efficient AI tools that remove manual work and give you all the time you need to focus on what really worth for you…
                </p>
              </div>
            </motion.div>

            {/* Studio Visual */}
            <div className="lg:col-span-5">
              <div className="h-full min-h-[280px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                {!heroImgError ? (
                  <Image
                    src="/images/wyslider_about_hero.jpg"
                    alt="Minimalist WySlider architectural studio workspace"
                    fill
                    sizes="(max-width: 1024px) 100vw, 420px"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgError(true)}
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 via-white to-blue-50 flex flex-col items-center justify-center p-8 text-center">
                    <WySliderLogo size="lg" />
                    <p className="mt-3 text-xs text-slate-500">
                      Human time freedom through focused AI tools
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Tagline Section */}
        <section className="bg-white border-y border-slate-200">
          <div className="max-w-5xl mx-auto px-6 py-12 sm:py-14 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-medium text-slate-500">
                Why WySlider
              </p>
              <p className="mt-2 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#0B1120] text-balance">
                You have a Manual and tedious work to do? You need a WySlider tool
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-[#1D4ED8] rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 self-start md:self-center"
            >
              <span>Browse WySlider apps</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Case Examples */}
        <section
          id="case-examples"
          className="max-w-5xl mx-auto px-6 py-14 sm:py-16"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4 mb-8">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-[#0B1120]">
                Case examples
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Practical workflows generated directly from the tools currently registered in WySlider.
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-500 whitespace-nowrap shrink-0">
              {appCount} active {appCount === 1 ? 'app' : 'apps'}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: Math.min(Math.max(appCount, 2), 4) }).map(
                (_, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 animate-pulse"
                  >
                    <div className="h-3 bg-slate-200 rounded w-1/4" />
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-full" />
                    <div className="h-3 bg-slate-200 rounded w-5/6" />
                    <div className="h-3 bg-slate-200 rounded w-2/3 pt-2" />
                  </div>
                )
              )}
            </div>
          ) : error ? (
            <div className="bg-white border border-red-200 rounded-2xl p-6 text-sm text-red-700">
              {error}
            </div>
          ) : cases.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
              <p className="text-sm font-medium text-slate-700">
                No case examples available yet.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Register apps in the Admin console and case examples will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {cases.map((item, idx) => (
                <article
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between gap-5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                      <span className="font-medium text-[#1D4ED8]">
                        0{idx + 1}. {item.appName}
                      </span>
                      <span className="font-mono text-slate-400">
                        /{item.appSlug}
                      </span>
                    </div>

                    <h3 className="mt-2.5 font-display text-lg font-semibold text-[#0B1120] leading-snug">
                      {item.scenarioTitle}
                    </h3>

                    <div className="mt-4 space-y-3 text-sm text-slate-600 leading-relaxed">
                      <div>
                        <span className="font-medium text-[#0B1120]">
                          Manual bottleneck:{' '}
                        </span>
                        <span>{item.manualChallenge}</span>
                      </div>
                      <div>
                        <span className="font-medium text-[#0B1120]">
                          With {item.appName}:{' '}
                        </span>
                        <span>{item.wysliderSolution}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <span className="text-xs font-medium text-slate-700">
                      {item.outcomeSummary}
                    </span>
                    <Link
                      href={`/${item.appSlug}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#1D4ED8] hover:underline whitespace-nowrap shrink-0"
                    >
                      <span>Open tool</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Slogan Anchor */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="bg-[#0B1120] text-white rounded-2xl px-8 py-12 sm:py-14 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-medium text-blue-400">
                WySlider
              </p>
              <p className="mt-2 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Think Less, Create More
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-[#0B1120] bg-white rounded-xl hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-slate-500">
          <span>WySlider — Think Less, Create More</span>
          <Link href="/" className="hover:text-[#0B1120] transition-colors">
            Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
