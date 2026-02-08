"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const otherLocale = locale === "en" ? "fr" : "en";
  const label = locale === "en" ? "FR" : "EN";

  return (
    <button
      onClick={() => router.replace(pathname, { locale: otherLocale })}
      className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors text-xs font-bold"
      title={otherLocale === "fr" ? "Passer en français" : "Switch to English"}
    >
      {label}
    </button>
  );
}
