"use client";

import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg)] p-1.5 flex flex-col md:flex-row gap-1.5 overflow-hidden max-h-screen">
      <Sidebar />
      <main className="grow bg-[var(--bg-secondary)] rounded-2xl overflow-y-auto relative scroll-smooth">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
