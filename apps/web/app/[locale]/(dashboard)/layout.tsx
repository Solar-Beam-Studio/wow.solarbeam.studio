"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-white relative z-10">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
