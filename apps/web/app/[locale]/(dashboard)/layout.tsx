"use client";

import { AppLogo } from "@/components/app-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Footer } from "@/components/footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-white relative z-10">
      <header className="w-full px-8 py-5 flex items-center justify-between">
        <AppLogo href="/" mode="full" />
        <LanguageSwitcher />
      </header>
      {children}
      <Footer />
    </div>
  );
}
