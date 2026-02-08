"use client";

import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { DataTable, type Column } from "@/components/data-table";
import { Zap, Trophy, Activity, Users, ArrowRight, BarChart3, Globe2, Plus } from "lucide-react";
import { CLASS_COLORS, getItemLevelColor, getMythicPlusColor } from "@wow/database/constants";

interface Guild {
  id: string;
  name: string;
  realm: string;
  region: string;
  memberCount: number;
  lastActiveSyncAt: Date | null;
}

interface TopCharacter {
  characterName: string;
  realm: string;
  characterClass: string | null;
  itemLevel: number | null;
  mythicPlusScore: number | null;
  guild: { name: string; id: string };
}

interface HomeClientProps {
  guilds: Guild[];
  totalMembers: number;
  topCharacters: TopCharacter[];
  lastSyncAt: string | null;
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function HomeClient({ guilds, totalMembers, topCharacters, lastSyncAt }: HomeClientProps) {
  const topCharacterColumns: Column<TopCharacter>[] = [
    {
      key: "characterName",
      label: "Character",
      sortValue: (c) => c.characterName.toLowerCase(),
      render: (c) => (
        <>
          <span
            className="text-sm font-bold"
            style={{ color: (c.characterClass && CLASS_COLORS[c.characterClass]) || undefined }}
          >
            {c.characterName}
          </span>
          <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50 ml-2">{c.realm}</span>
        </>
      ),
    },
    {
      key: "guild",
      label: "Guild",
      render: (c) => (
        <Link
          href={`/g/${c.guild.id}`}
          className="text-xs text-[var(--text-secondary)] hover:text-accent font-bold transition-colors"
        >
          {c.guild.name}
        </Link>
      ),
    },
    {
      key: "itemLevel",
      label: "iLvl",
      align: "right",
      sortValue: (c) => c.itemLevel ?? 0,
      render: (c) =>
        c.itemLevel ? (
          <span className="font-mono font-bold" style={{ color: getItemLevelColor(c.itemLevel) }}>
            {Math.round(c.itemLevel)}
          </span>
        ) : <span>-</span>,
    },
    {
      key: "mythicPlusScore",
      label: "M+",
      align: "right",
      sortValue: (c) => c.mythicPlusScore ?? 0,
      render: (c) =>
        c.mythicPlusScore ? (
          <span className="font-mono font-bold" style={{ color: getMythicPlusColor(c.mythicPlusScore) }}>
            {Math.round(c.mythicPlusScore)}
          </span>
        ) : <span>-</span>,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] p-1.5 flex flex-col md:flex-row gap-1.5 overflow-hidden max-h-screen">
      <Sidebar>
        <section className="flex flex-col gap-1.5">
          <p className="px-4 text-[10px] font-display font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Network Stats</p>
          <div className="mx-2 p-4 bg-[var(--bg-tertiary)] rounded-2xl grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-0.5">
              <p className="text-xl font-mono font-bold tracking-tight">{guilds.length}</p>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Guilds</p>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-xl font-mono font-bold tracking-tight">{totalMembers.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Members</p>
            </div>
            {lastSyncAt && (
              <div className="col-span-2 pt-3 mt-1 border-t border-[var(--text-secondary)]/10">
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 opacity-60">Global Update</p>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Zap className="w-3.5 h-3.5 text-accent fill-accent/20" />
                  <span>{timeAgo(lastSyncAt)}</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </Sidebar>

      <main className="grow bg-[var(--bg-secondary)] rounded-2xl overflow-y-auto relative scroll-smooth scrollbar-hide">
        {/* Welcome Hero Card */}
        <div className="p-4 md:p-6 lg:p-8">
          <div className="relative overflow-hidden bg-accent rounded-[2rem] p-8 md:p-12 text-white mb-6 shadow-2xl shadow-accent/20">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest mb-6">
                Next-Gen Sync
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-4 leading-tight">
                The Real-Time Home for WoW Guilds.
              </h1>
              <p className="text-lg text-white/80 mb-8 font-medium">
                Sync your entire roster in seconds. Track M+ scores, PvP ratings, and raid progress with zero manual effort.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link href="/signup" className="btn bg-white text-accent h-12 px-8 font-bold hover:bg-white/90 transition-all shadow-lg w-full sm:w-auto">
                  Get Started
                </Link>
                <Link href="/login" className="btn bg-white/10 text-white h-12 px-8 font-bold border border-white/20 hover:bg-white/20 transition-all w-full sm:w-auto">
                  Sign In
                </Link>
              </div>
            </div>
            {/* Background Decorative Element */}
            <div className="absolute right-[-10%] bottom-[-20%] opacity-10 pointer-events-none">
              <Activity className="w-[400px] h-[400px]" />
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              { label: "Automated Sync", icon: <Zap className="w-5 h-5" />, value: "Hourly Updates" },
              { label: "Data Source", icon: <Globe2 className="w-5 h-5" />, value: "Raider.IO + Blizzard" },
              { label: "Live Tracking", icon: <BarChart3 className="w-5 h-5" />, value: "M+ & PvP" },
            ].map((stat, i) => (
              <div key={i} className="bg-[var(--bg-tertiary)] p-6 rounded-[1.5rem] border border-[var(--border)] group hover:border-accent/20 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center mb-4 text-accent shadow-sm group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-lg font-display font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Guilds List */}
            <div>
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-[10px] font-display font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Active Guilds</h2>
                <Link href="/guilds/new" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Yours
                </Link>
              </div>
              <div className="space-y-2">
                {guilds.length === 0 ? (
                  <div className="bg-[var(--bg-tertiary)] rounded-2xl p-12 text-center border-2 border-dashed border-[var(--border)]">
                    <p className="text-sm text-[var(--text-secondary)] font-medium">No guilds tracked yet.</p>
                  </div>
                ) : (
                  guilds.slice(0, 8).map((guild) => (
                    <Link
                      key={guild.id}
                      href={`/g/${guild.id}`}
                      className="flex items-center justify-between p-4 hover:bg-[var(--bg-tertiary)] bg-[var(--bg-secondary)] border border-[var(--border)] transition-all rounded-2xl group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent font-bold">
                          {guild.name[0]}
                        </div>
                        <div>
                          <h3 className="font-display font-bold leading-tight">{guild.name}</h3>
                          <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider mt-0.5">
                            {guild.realm} — {guild.region.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-[var(--text-secondary)]">
                        <span>{guild.memberCount} members</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))
                )}
                {guilds.length > 8 && (
                   <div className="text-center py-2">
                      <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-40">And {guilds.length - 8} more guilds...</p>
                   </div>
                )}
              </div>
            </div>

            {/* Top Performers */}
            <div>
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-[10px] font-display font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Top Performers</h2>
              </div>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
                <DataTable
                  columns={topCharacterColumns}
                  data={topCharacters.slice(0, 10)}
                  rowKey={(c) => `${c.characterName}-${c.realm}`}
                  defaultSortKey="itemLevel"
                  defaultSortDirection="desc"
                  maxHeight="none"
                />
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="mt-12 py-12 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase">Guild Sync</span>
            </div>
            <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.1em]">
              <span>© 2025 Sync</span>
              <a href="https://raider.io" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Data by Raider.IO</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}



