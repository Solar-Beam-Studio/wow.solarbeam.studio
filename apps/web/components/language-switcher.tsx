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
    <div className="flex items-center rounded-lg p-0.5 gap-0.5">
      {locales.map((l) => (
        <button
          key={l.code}
          onClick={() => {
            if (locale !== l.code) {
              router.replace(pathname, { locale: l.code });
            }
          }}
          className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
            locale === l.code
              ? "text-white bg-white/[0.08]"
              : "text-zinc-500 hover:text-white"
          }`}
          title={l.code === "fr" ? "Français" : "English"}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
