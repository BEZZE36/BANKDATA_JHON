import { requireAuth } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Dashboard — Bank Data',
    template: '%s — Bank Data',
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <SidebarProvider>
      <Sidebar user={user} />
      <SidebarInset>
        <main className="min-h-screen bg-slate-50">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
