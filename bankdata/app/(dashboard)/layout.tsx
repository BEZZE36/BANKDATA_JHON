import { requireAuth } from "@/lib/auth";
import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: {
    default: "Dashboard — Bank Data",
    template: "%s — Bank Data",
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar user={user} />
      <SidebarInset className="bg-slate-50 flex flex-col w-full min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-11 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4">
          <SidebarTrigger className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md p-1.5 transition-colors shrink-0" />
          <div className="h-4 w-px bg-slate-200 shrink-0" />
          <span className="text-xs font-medium text-slate-500 truncate">
            BPKAD Provinsi Sulawesi Tengah
          </span>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
