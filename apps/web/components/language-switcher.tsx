"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const locales = [
    { code: "en", label: "EN" },
    { code: "fr", label: "FR" },
  ] as const;

  return (
    <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
      {locales.map((l) => (
        <button
          key={l.code}
          onClick={() => {
            if (locale !== l.code) {
              router.replace(pathname, { locale: l.code });
            }
          }}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            locale === l.code
              ? "bg-violet-600 text-white"
              : "text-gray-500 hover:text-white"
          }`}
          title={l.code === "fr" ? "Français" : "English"}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
