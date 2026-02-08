"use client";

import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { AppLogo } from "@/components/app-logo";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon, LogIn, UserPlus, LayoutGrid, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { data: session } = useSession();
  const { dark, toggle } = useTheme();
  const router = useRouter();
  const isLoggedIn = !!session?.user;

  return (
    <nav className="sticky top-0 z-50 w-full bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <AppLogo className="px-0 py-0 scale-90 -ml-2" />
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-bold hover:text-accent transition-colors">Explore</Link>
            {isLoggedIn && (
              <Link href="/guilds" className="text-sm font-bold hover:text-accent transition-colors">My Guilds</Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-4 ml-2">
                <Link href="/guilds" className="btn btn-primary h-10 px-4 font-bold">
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    await signOut();
                    router.refresh();
                  }}
                  className="p-2 text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn btn-ghost h-10 px-4 font-bold hidden sm:flex">
                  Sign In
                </Link>
                <Link href="/signup" className="btn btn-primary h-10 px-6 font-bold">
                  Join Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
