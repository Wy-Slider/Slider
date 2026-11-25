'use client';

import { motion } from 'motion/react';

interface WySliderLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  animated?: boolean;
  inverted?: boolean;
}

export function WySliderMark({
  size = 'md',
  animated = false,
  inverted = false,
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  inverted?: boolean;
}) {
  const dims = {
    sm: { box: 'w-7 h-7', barW: 'w-1.5', gap: 'gap-0.5', r: 'rounded-[2px]' },
    md: { box: 'w-9 h-9', barW: 'w-2', gap: 'gap-1', r: 'rounded-[3px]' },
    lg: { box: 'w-12 h-12', barW: 'w-2.5', gap: 'gap-1', r: 'rounded-[3px]' },
    xl: { box: 'w-16 h-16', barW: 'w-3.5', gap: 'gap-1.5', r: 'rounded-sm' },
  }[size];

  const primaryBar = inverted ? 'bg-white' : 'bg-[#0B1120]';
  const accentBar = inverted ? 'bg-blue-400' : 'bg-[#1D4ED8]';

  if (!animated) {
    return (
      <div
        className={`${dims.box} inline-flex items-center justify-center ${dims.gap} shrink-0 select-none`}
        aria-hidden="true"
      >
        <span className={`${dims.barW} h-[72%] ${primaryBar} ${dims.r} -skew-x-12 translate-y-[-6%]`} />
        <span className={`${dims.barW} h-[88%] ${accentBar} ${dims.r} skew-x-12 translate-y-[4%]`} />
        <span className={`${dims.barW} h-[72%] ${primaryBar} ${dims.r} -skew-x-12 translate-y-[-6%]`} />
      </div>
    );
  }

  return (
    <div
      className={`${dims.box} inline-flex items-center justify-center ${dims.gap} shrink-0 select-none`}
      aria-hidden="true"
    >
      <motion.span
        initial={{ opacity: 0, y: -14, skewX: -12 }}
        animate={{ opacity: 1, y: -2, skewX: -12 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className={`${dims.barW} h-[72%] ${primaryBar} ${dims.r}`}
      />
      <motion.span
        initial={{ opacity: 0, y: 16, skewX: 12 }}
        animate={{ opacity: 1, y: 2, skewX: 12 }}
        transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className={`${dims.barW} h-[88%] ${accentBar} ${dims.r}`}
      />
      <motion.span
        initial={{ opacity: 0, y: -14, skewX: -12 }}
        animate={{ opacity: 1, y: -2, skewX: -12 }}
        transition={{ duration: 0.45, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className={`${dims.barW} h-[72%] ${primaryBar} ${dims.r}`}
      />
    </div>
  );
}

export default function WySliderLogo({
  size = 'md',
  showWordmark = true,
  animated = false,
  inverted = false,
}: WySliderLogoProps) {
  const textSize = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  }[size];

  return (
    <div className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <WySliderMark size={size} animated={animated} inverted={inverted} />
      {showWordmark && (
        <span
          className={`font-display font-bold tracking-tight ${textSize} ${
            inverted ? 'text-white' : 'text-[#0B1120]'
          }`}
        >
          Wy<span className={inverted ? 'text-blue-400' : 'text-[#1D4ED8]'}>Slider</span>
        </span>
      )}
    </div>
  );
}
