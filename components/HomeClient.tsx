'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Info, RotateCcw } from 'lucide-react';
import type { WySliderApp } from '@/lib/types';
import WySliderLogo from './WySliderLogo';
import AppLogoImage from './AppLogoImage';
import SplashScreen from './SplashScreen';

interface HomeClientProps {
  initialApps: WySliderApp[];
}

export default function HomeClient({ initialApps }: HomeClientProps) {
  const router = useRouter();
  const [apps] = useState<WySliderApp[]>(initialApps);
  const [hoveredApp, setHoveredApp] = useState<WySliderApp | null>(null);
  const [replayActive, setReplayActive] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0B1120]">
      <SplashScreen
        forceShow={replayActive}
        onFinish={() => setReplayActive(false)}
      />

      {/* Centered Main Architectural Stage */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:py-16">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
          {/* 1.1 Center Brand & About… */}
          <div className="flex flex-col items-center text-center mb-12 sm:mb-14">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <WySliderLogo size="lg" />
              <span className="hidden sm:inline-block h-6 w-px bg-slate-200" aria-hidden="true" />
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#1D4ED8] transition-colors px-3 py-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Info className="w-4 h-4" />
                <span>About…</span>
              </Link>
            </div>

            <h1 className="mt-6 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#0B1120] max-w-2xl text-balance">
              Think Less, Create More
            </h1>
            <p className="mt-3 text-base text-slate-600 max-w-xl leading-relaxed">
              Focused AI tools crafted to eliminate repetitive manual work and restore your time.
            </p>
          </div>

          {/* 1.1 Center WySlider Apps */}
          <section
            aria-labelledby="wyslider-apps-heading"
            className="w-full"
          >
            <div className="flex items-baseline justify-between border-b border-slate-200/80 pb-3 mb-6">
              <h2
                id="wyslider-apps-heading"
                className="font-display text-lg font-semibold tracking-tight text-[#0B1120]"
              >
                WySlider apps
              </h2>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {apps.length} {apps.length === 1 ? 'tool' : 'tools'}
              </span>
            </div>

            {apps.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No WySlider apps have been registered yet.
                </p>
                <p className="mt-1.5 text-sm text-slate-500">
                  Add your first tool from the Admin console to launch it here.
                </p>
                <Link
                  href="/Admin2WySlider"
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1D4ED8] rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open Admin Console
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {apps.map((app) => {
                    const isHovered = hoveredApp?.id === app.id;
                    return (
                      <motion.button
                        key={app.id}
                        type="button"
                        onMouseOver={() => setHoveredApp(app)}
                        onMouseEnter={() => setHoveredApp(app)}
                        onFocus={() => setHoveredApp(app)}
                        onMouseLeave={() =>
                          setHoveredApp((prev) =>
                            prev?.id === app.id ? null : prev
                          )
                        }
                        onBlur={() =>
                          setHoveredApp((prev) =>
                            prev?.id === app.id ? null : prev
                          )
                        }
                        onClick={() => router.push(`/${app.slug}`)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        className={`group relative text-left bg-white rounded-2xl p-5 border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                          isHovered
                            ? 'border-[#1D4ED8]/60 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <AppLogoImage
                            src={app.logo}
                            name={app.name}
                            sizeClass="w-12 h-12"
                          />
                          <ArrowUpRight
                            className={`w-4 h-4 transition-transform duration-150 ${
                              isHovered
                                ? 'text-[#1D4ED8] translate-x-0.5 -translate-y-0.5'
                                : 'text-slate-300 group-hover:text-slate-500'
                            }`}
                          />
                        </div>

                        <div className="mt-4">
                          <h3 className="font-display text-base font-semibold text-[#0B1120] truncate">
                            {app.name}
                          </h3>
                          <p className="mt-0.5 text-xs font-mono text-slate-400 truncate">
                            /{app.slug}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Stable Description Spotlight (reveals description on onMouseOver) */}
                <div
                  aria-live="polite"
                  className="mt-5 min-h-[108px] bg-white border border-slate-200 rounded-2xl px-6 py-5 flex items-center"
                >
                  <AnimatePresence mode="wait">
                    {hoveredApp ? (
                      <motion.div
                        key={hoveredApp.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start sm:items-center gap-4 min-w-0">
                          <AppLogoImage
                            src={hoveredApp.logo}
                            name={hoveredApp.name}
                            sizeClass="w-10 h-10"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-semibold text-sm text-[#0B1120]">
                                {hoveredApp.name}
                              </span>
                              <span aria-hidden="true" className="text-slate-300">
                                ·
                              </span>
                              <span className="text-xs font-mono text-slate-500">
                                /{hoveredApp.slug}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                              {hoveredApp.description}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-[#1D4ED8] whitespace-nowrap shrink-0">
                          Click to launch
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle-hint"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-slate-500"
                      >
                        <span>
                          Move your cursor over any WySlider app above to preview what it handles.
                        </span>
                        <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                          Select an app to open Workspace
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200/80 bg-white/60">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-[#0B1120]">WySlider</span>
            <span aria-hidden="true">·</span>
            <span>Think Less, Create More</span>
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setReplayActive(true)}
              className="inline-flex items-center gap-1.5 hover:text-[#0B1120] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay intro</span>
            </button>
            <Link
              href="/about"
              className="hover:text-[#0B1120] transition-colors"
            >
              About…
            </Link>
            <Link
              href="/Admin2WySlider"
              className="hover:text-[#0B1120] transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
