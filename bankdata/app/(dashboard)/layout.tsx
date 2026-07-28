import { requireAuth } from "@/lib/auth";
import type { Metadata } from "next";

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
  await requireAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
