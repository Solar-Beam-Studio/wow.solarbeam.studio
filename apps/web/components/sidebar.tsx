"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { AppLogo } from "@/components/app-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Zap, LogOut } from "lucide-react";
import type { ReactNode } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const t = useTranslations("sidebar");

  const navLink = (href: string, label: string, icon: ReactNode, active: boolean) => (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
        active
          ? "bg-accent text-white shadow-xl shadow-accent/20"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text)]"
      }`}
    >
      {icon}
      {label}
    </Link>
  );

  return (
    <aside className="w-full md:w-64 flex flex-col gap-1.5 shrink-0">
      <div className="bg-[var(--bg-secondary)] rounded-2xl p-3 flex flex-col h-full overflow-y-auto border border-[var(--border)] shadow-sm">
        <div className="flex items-center mb-8">
          <AppLogo href="/" className="px-1" />
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-8 grow">
          <section className="flex flex-col gap-1.5">
            <p className="px-3 text-[10px] font-display font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 opacity-50">{t("navigation")}</p>
            {navLink("/", t("explore"), <Zap className="w-4 h-4" />, pathname === "/")}
          </section>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 flex flex-col gap-4">
          <div className="px-1">
            <LanguageSwitcher />
          </div>
          
          {isLoggedIn ? (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] group">
              <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white font-bold shrink-0 text-sm shadow-sm shadow-accent/20">
                {session.user.name?.[0] || session.user.email?.[0].toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-xs font-bold truncate text-[var(--text)] leading-tight">
                  {session.user.name || session.user.email.split("@")[0]}
                </p>
                <p className="text-[10px] text-[var(--text-secondary)] truncate leading-tight">
                  {session.user.email}
                </p>
              </div>
              <button
                onClick={async () => {
                  await signOut();
                  router.push("/");
                }}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                title={t("signOut")}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
