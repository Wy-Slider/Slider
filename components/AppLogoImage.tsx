'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Layers } from 'lucide-react';

interface AppLogoImageProps {
  src: string;
  name: string;
  sizeClass?: string;
}

export default function AppLogoImage({
  src,
  name,
  sizeClass = 'w-12 h-12',
}: AppLogoImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    const initials = name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');

    return (
      <div
        className={`${sizeClass} rounded-xl bg-gradient-to-br from-slate-100 to-blue-50 border border-slate-200 flex flex-col items-center justify-center text-[#1D4ED8] shrink-0 select-none`}
        aria-label={`${name} logo`}
      >
        {initials ? (
          <span className="font-display font-bold text-sm tracking-tight">
            {initials}
          </span>
        ) : (
          <Layers className="w-5 h-5" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-xl bg-white border border-slate-200/90 overflow-hidden flex items-center justify-center shrink-0 p-1.5`}
    >
      <div className="relative w-full h-full">
        <Image
          src={src}
          alt={`${name} logo`}
          fill
          sizes="64px"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="object-contain rounded-lg"
        />
      </div>
    </div>
  );
}
