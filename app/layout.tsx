import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WySlider — Think Less, Create More',
  description:
    'WySlider AI Tools Suite — Purpose-built AI tools that remove manual work and give you back your time.',
  openGraph: {
    title: 'WySlider — Think Less, Create More',
    description:
      'WySlider AI Tools Suite — Purpose-built AI tools that remove manual work and give you back your time.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WySlider — Think Less, Create More',
    description:
      'WySlider AI Tools Suite — Purpose-built AI tools that remove manual work and give you back your time.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-[#F8FAFC] text-[#0B1120] antialiased selection:bg-blue-600 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
