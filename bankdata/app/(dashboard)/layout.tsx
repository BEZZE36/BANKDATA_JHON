import { requireAuth } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
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
      <SidebarInset className="bg-slate-50">
        {/* Topbar with toggle */}
        <header className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b border-slate-200 bg-white px-4">
          <SidebarTrigger className="text-slate-500 hover:text-slate-700" />
          <div className="h-4 w-px bg-slate-200" />
          <span className="text-xs text-slate-400 select-none">Bank Data Sulawesi Tengah</span>
        </header>
        <main className="flex-1 min-h-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
