"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCreateGuild } from "@/hooks/use-guilds";
import { toast } from "sonner";

export default function NewGuildPage() {
  const router = useRouter();
  const createGuild = useCreateGuild();
  const t = useTranslations("newGuild");

  const [name, setName] = useState("");
  const [realm, setRealm] = useState("");
  const [region, setRegion] = useState("eu");

  const REGIONS = [
    { value: "eu", label: t("regionEurope") },
    { value: "us", label: t("regionAmericas") },
    { value: "kr", label: t("regionKorea") },
    { value: "tw", label: t("regionTaiwan") },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    createGuild.mutate(
      { name, realm, region },
      {
        onSuccess: (guild) => {
          toast.success(t("successToast", { name }));
          router.push(`/g/${guild.id}`);
        },
      }
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-light tracking-tight mb-8">{t("heading")}</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-widest mb-2">
            {t("guildNameLabel")}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("guildNamePlaceholder")}
            required
            className="w-full h-11 px-4 bg-[var(--input)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--text)]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-widest mb-2">{t("realmLabel")}</label>
          <input
            type="text"
            value={realm}
            onChange={(e) => setRealm(e.target.value)}
            placeholder={t("realmPlaceholder")}
            required
            className="w-full h-11 px-4 bg-[var(--input)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--text)]"
          />
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            {t("realmHint")}
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-widest mb-2">{t("regionLabel")}</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full h-11 px-4 bg-[var(--input)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--text)]"
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label} ({r.value.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={createGuild.isPending}
          className="w-full h-11 bg-[var(--text)] text-[var(--bg)] hover:opacity-80 disabled:opacity-50 rounded-xl text-sm font-medium tracking-wide transition-opacity"
        >
          {createGuild.isPending ? t("submitLoading") : t("submit")}
        </button>
      </form>
    </div>
  );
}
