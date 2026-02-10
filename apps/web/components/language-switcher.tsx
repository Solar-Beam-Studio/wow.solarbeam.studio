"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const locales = [
    { code: "en", label: "EN" },
    { code: "fr", label: "FR" },
  ] as const;

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-3.5 h-3.5 text-[var(--text-secondary)] opacity-60" />
      <div className="flex items-center p-0.5 bg-[var(--bg-tertiary)] rounded-full border border-[var(--border)] relative h-7 shrink-0">
        {/* Background slider */}
        <div 
          className={`absolute inset-y-0.5 w-[calc(50%-2px)] bg-[var(--bg-secondary)] rounded-full shadow-sm transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            locale === "fr" ? "left-[calc(50%+1px)]" : "left-0.5"
          }`}
        />
        
        {locales.map((l) => (
          <button
            key={l.code}
            onClick={() => {
              if (locale !== l.code) {
                router.replace(pathname, { locale: l.code });
              }
            }}
            className={`
              relative z-10 px-2.5 h-full flex items-center justify-center min-w-[32px] text-[9px] font-black tracking-widest transition-colors duration-200
              ${locale === l.code 
                ? "text-[var(--text)]" 
                : "text-[var(--text-secondary)] hover:text-[var(--text)]"
              }
            `}
            title={l.code === "fr" ? "Français" : "English"}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
