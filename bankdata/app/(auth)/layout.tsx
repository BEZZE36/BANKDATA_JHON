import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Masuk — Bank Data Sulawesi Tengah',
  description: 'Login ke sistem Bank Data Kantor Gubernur Sulawesi Tengah',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
