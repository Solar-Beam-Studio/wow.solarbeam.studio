"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ChevronDown } from "lucide-react";
import {
  CLASS_COLORS,
  getItemLevelColor,
  getMythicPlusColor,
  getAchievementColor,
  getPvpRatingColor,
} from "@wow/database/constants";
import type { GuildMember } from "@/hooks/use-members";

const MEDALS = ["gold", "silver", "bronze"] as const;
const MEDAL_STYLES: Record<(typeof MEDALS)[number], string> = {
  gold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  silver: "bg-zinc-400/15 text-zinc-300 border-zinc-400/30",
  bronze: "bg-amber-700/20 text-amber-500 border-amber-700/30",
};

function raidSortValue(raidProgress: string | null): number {
  if (!raidProgress) return 0;
  const diffOrder: Record<string, number> = { M: 4, H: 3, N: 2 };
  const diff = diffOrder[raidProgress.charAt(raidProgress.length - 1)] || 1;
  const num = parseInt(raidProgress.match(/\d+/)?.[0] || "0");
  return diff * 100 + num;
}

interface LeaderboardEntry {
  name: string;
  characterClass: string | null;
  value: string;
  colorClass: string;
}

interface Category {
  key: string;
  entries: LeaderboardEntry[];
}

function getTop3(
  members: GuildMember[],
  getValue: (m: GuildMember) => number,
  formatValue: (m: GuildMember) => string,
  colorFn: (value: number) => string
): LeaderboardEntry[] {
  return members
    .filter((m) => getValue(m) > 0)
    .sort((a, b) => getValue(b) - getValue(a))
    .slice(0, 3)
    .map((m) => ({
      name: m.characterName,
      characterClass: m.characterClass,
      value: formatValue(m),
      colorClass: colorFn(getValue(m)),
    }));
}

function Section({
  title,
  icon,
  categories,
  defaultOpen,
}: {
  title: string;
  icon: string;
  categories: Category[];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const visibleCategories = categories.filter((c) => c.entries.length > 0);
  if (visibleCategories.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left group"
      >
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
          {icon} {title}
        </h3>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[var(--text-secondary)] transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>

      {open && (
        <div className="mt-3 space-y-4">
          {visibleCategories.map((cat) => (
            <div key={cat.key}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] opacity-60 mb-1.5">
                {cat.key}
              </p>
              <div className="space-y-1">
                {cat.entries.map((entry, i) => (
                  <div
                    key={entry.name}
                    className="flex items-center gap-2.5 py-1"
                  >
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold border ${MEDAL_STYLES[MEDALS[i]]}`}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="text-sm font-medium truncate flex-1"
                      style={{
                        color:
                          (entry.characterClass &&
                            CLASS_COLORS[entry.characterClass]) ||
                          "var(--text)",
                      }}
                    >
                      {entry.name}
                    </span>
                    <span
                      className={`text-xs font-mono font-semibold tabular-nums ${entry.colorClass}`}
                    >
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function HallOfFame({ members }: { members: GuildMember[] }) {
  const t = useTranslations("hallOfFame");
  const locale = useLocale();

  const { pveCategories, pvpCategories } = useMemo(() => {
    const pve: Category[] = [
      {
        key: t("itemLevel"),
        entries: getTop3(
          members,
          (m) => m.itemLevel ?? 0,
          (m) => String(Math.round(m.itemLevel!)),
          getItemLevelColor
        ),
      },
      {
        key: t("mythicPlus"),
        entries: getTop3(
          members,
          (m) => m.mythicPlusScore ?? 0,
          (m) => (m.mythicPlusScore! % 1 === 0 ? String(m.mythicPlusScore) : m.mythicPlusScore!.toFixed(1)),
          getMythicPlusColor
        ),
      },
      {
        key: t("raids"),
        entries: getTop3(
          members,
          (m) => raidSortValue(m.raidProgress),
          (m) => m.raidProgress!,
          () => "text-amber-500"
        ),
      },
      {
        key: t("achievements"),
        entries: getTop3(
          members,
          (m) => m.achievementPoints ?? 0,
          (m) => m.achievementPoints.toLocaleString(locale),
          getAchievementColor
        ),
      },
    ];

    const pvp: Category[] = [
      {
        key: t("pvp2v2"),
        entries: getTop3(members, (m) => m.pvp2v2Rating, (m) => String(m.pvp2v2Rating), getPvpRatingColor),
      },
      {
        key: t("pvp3v3"),
        entries: getTop3(members, (m) => m.pvp3v3Rating, (m) => String(m.pvp3v3Rating), getPvpRatingColor),
      },
      {
        key: t("pvpSolo"),
        entries: getTop3(members, (m) => m.soloShuffleRating, (m) => String(m.soloShuffleRating), getPvpRatingColor),
      },
      {
        key: t("pvpRbg"),
        entries: getTop3(members, (m) => m.pvpRbgRating, (m) => String(m.pvpRbgRating), getPvpRatingColor),
      },
      {
        key: t("pvpBlitz"),
        entries: getTop3(members, (m) => m.rbgShuffleRating, (m) => String(m.rbgShuffleRating), getPvpRatingColor),
      },
    ];

    return { pveCategories: pve, pvpCategories: pvp };
  }, [members, t, locale]);

  const hasPve = pveCategories.some((c) => c.entries.length > 0);
  const hasPvp = pvpCategories.some((c) => c.entries.length > 0);

  if (!hasPve && !hasPvp) return null;

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-5 space-y-5 xl:sticky xl:top-6">
      <h2 className="text-base font-bold tracking-tight">{t("title")}</h2>

      {hasPve && (
        <Section
          title={t("pveKings")}
          icon="🏰"
          categories={pveCategories}
          defaultOpen
        />
      )}

      {hasPve && hasPvp && (
        <div className="border-t border-[var(--border)]" />
      )}

      {hasPvp && (
        <Section
          title={t("pvpKings")}
          icon="⚔️"
          categories={pvpCategories}
          defaultOpen={false}
        />
      )}
    </div>
  );
}
