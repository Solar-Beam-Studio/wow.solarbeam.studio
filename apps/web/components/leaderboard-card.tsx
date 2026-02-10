"use client";

import { CLASS_COLORS } from "@wow/database/constants";
import { ShieldCheck } from "lucide-react";
import type { LeaderboardCategory } from "@/lib/leaderboard";

export function LeaderboardCard({
  category,
  translatedName,
  showGuild,
}: {
  category: LeaderboardCategory;
  translatedName: string;
  showGuild?: boolean;
}) {
  return (
    <div className="glass rounded-3xl p-6 border border-white/5 hover:border-violet-500/20 transition-all relative overflow-hidden group">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-lg">{category.icon}</span>
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">{translatedName}</h3>
      </div>

      <div className="space-y-3">
        {category.entries.map((entry, i) => (
          <div key={`${entry.name}-${i}`} className="flex items-center gap-3">
            <span
              className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold border ${
                i === 0
                  ? "bg-violet-500 border-violet-400 text-white"
                  : "bg-white/5 border-white/10 text-gray-500"
              }`}
            >
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold truncate"
                style={{
                  color:
                    (entry.characterClass &&
                      CLASS_COLORS[entry.characterClass]) ||
                    "var(--text)",
                }}
              >
                {entry.name}
              </p>
              {showGuild && entry.guildName && (
                <p className="text-[10px] text-gray-500 truncate">
                  {entry.guildName}
                </p>
              )}
            </div>
            <span className="text-sm font-black italic tracking-tighter text-white tabular-nums">
              {entry.value}
            </span>
          </div>
        ))}
      </div>

      {/* Decorative shield */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
        <ShieldCheck className="w-24 h-24" />
      </div>
    </div>
  );
}
