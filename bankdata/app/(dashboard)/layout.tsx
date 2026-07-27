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
      <SidebarInset className="bg-slate-50 flex flex-col min-h-screen">
        {/* Topbar — shown only when sidebar is collapsed so user can re-open */}
        <header className="sticky top-0 z-20 flex h-11 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4">
          <SidebarTrigger className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md p-1.5 transition-colors" />
          <div className="h-4 w-px bg-slate-200" />
          <span className="text-xs font-medium text-slate-500">Bank Data Sulawesi Tengah</span>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
