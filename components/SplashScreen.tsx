'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import WySliderLogo, { WySliderMark } from './WySliderLogo';

interface SplashScreenProps {
  forceShow?: boolean;
  onFinish?: () => void;
}

const SPLASH_KEY = 'wyslider_splash_seen';
const SPLASH_EVENT = 'wyslider-splash-change';
const BACKGROUND_TILES = Array.from({ length: 12 }, (_, idx) => idx);

function subscribeSplash(callback: () => void): () => void {
  window.addEventListener(SPLASH_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(SPLASH_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

function getSplashSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(SPLASH_KEY) !== '1';
}

function getServerSplashSnapshot(): boolean {
  return false;
}

function markSplashSeen() {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SPLASH_KEY, '1');
  window.dispatchEvent(new Event(SPLASH_EVENT));
}

export default function SplashScreen({
  forceShow = false,
  onFinish,
}: SplashScreenProps) {
  const sessionUnseen = useSyncExternalStore(
    subscribeSplash,
    getSplashSnapshot,
    getServerSplashSnapshot
  );

  const visible = forceShow || sessionUnseen;

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      markSplashSeen();
      onFinish?.();
    }, 1900);
    return () => clearTimeout(timer);
  }, [visible, onFinish]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="wyslider-splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F8FAFC] overflow-hidden"
          aria-label="WySlider loading"
        >
          {/* Background: Kinetic WySlider logo animation field */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center"
            aria-hidden="true"
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-14 sm:gap-20 opacity-[0.06]">
              {BACKGROUND_TILES.map((idx) => (
                <motion.div
                  key={idx}
                  initial={{
                    opacity: 0.3,
                    y: idx % 2 === 0 ? -18 : 18,
                    scale: 0.92,
                  }}
                  animate={{
                    opacity: [0.35, 0.9, 0.35],
                    y: idx % 2 === 0 ? [18, -18, 18] : [-18, 18, -18],
                    scale: [0.92, 1.04, 0.92],
                  }}
                  transition={{
                    duration: 2.8,
                    delay: (idx % 4) * 0.14,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="flex items-center justify-center"
                >
                  <WySliderMark size="xl" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Foreground: WySlider logo animation, slogan, loading animation */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center px-6"
          >
            <div className="mb-5">
              <WySliderLogo size="xl" animated />
            </div>

            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-display text-base sm:text-lg font-medium tracking-tight text-slate-600"
            >
              Think Less, Create More
            </motion.p>

            {/* Sleek compositor-only loading animation */}
            <div className="mt-8 w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.65, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: '0% 50%' }}
                className="h-full w-full bg-[#1D4ED8] rounded-full"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                markSplashSeen();
                onFinish?.();
              }}
              className="mt-6 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-2 py-1 cursor-pointer"
            >
              Skip intro
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
