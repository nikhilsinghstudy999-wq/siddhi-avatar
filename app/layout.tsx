import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'कल्कि इंटेलिजेंस — Siddhi AI Consultant | Indore, MP',
  description:
    'Talk to Siddhi, your AI consultant at Kalki Intelligence. Get fixed-price quotes for AI bots, websites, and automation in under 45 seconds. Based in Indore, serving all of India.',
  keywords: [
    'AI consultant',
    'Kalki Intelligence',
    'Indore',
    'AI chatbot',
    'website development',
    'automation',
    'lead generation',
  ],
  openGraph: {
    title: 'कल्कि इंटेलिजेंस — Siddhi AI Consultant',
    description: 'Talk to Siddhi, your AI consultant. Fixed-price quotes in 45 seconds.',
    type: 'website',
    locale: 'hi_IN',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
