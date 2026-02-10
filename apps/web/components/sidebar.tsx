"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { AppLogo } from "@/components/app-logo";
import { Zap, LogOut } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const t = useTranslations("sidebar");

  const isActive = pathname === "/";

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 flex-col items-center py-8 bg-[#0b0b0d]/80 backdrop-blur-2xl border-r border-white/5 z-50 hidden md:flex">
      {/* Logo */}
      <AppLogo href="/" mode="icon" className="mb-12" />

      {/* Navigation */}
      <nav className="flex flex-col items-center gap-2 flex-1">
        <Link
          href="/"
          className={`relative w-12 h-12 flex items-center justify-center rounded-xl transition-all group ${
            isActive
              ? "bg-violet-500/10 text-violet-500"
              : "text-gray-500 hover:bg-white/5 hover:text-white"
          }`}
          title={t("explore")}
        >
          <Zap className="w-5 h-5" />
          {isActive && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-violet-500 rounded-l-full" />
          )}
        </Link>
      </nav>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-4 mt-auto">
        {isLoggedIn && (
          <>
            <div
              className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm cursor-default"
              title={session.user.name || session.user.email}
            >
              {session.user.name?.[0] || session.user.email?.[0].toUpperCase()}
            </div>
            <button
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              title={t("signOut")}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
