import type { Metadata } from 'next';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Bank Data — Kantor Gubernur Sulawesi Tengah',
    template: '%s | Bank Data Sulawesi Tengah',
  },
  description:
    'Sistem Bank Data internal Kantor Gubernur Sulawesi Tengah. Kelola data kepegawaian, program kerja, aset, dan keuangan secara terpadu.',
  keywords: ['bank data', 'sulawesi tengah', 'kepegawaian', 'aset', 'keuangan'],
  robots: { index: false, follow: false }, // aplikasi internal
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <NextTopLoader color="#059669" showSpinner={false} shadow="0 0 10px #059669,0 0 5px #059669" />
        {children}
      </body>
    </html>
  );
}
