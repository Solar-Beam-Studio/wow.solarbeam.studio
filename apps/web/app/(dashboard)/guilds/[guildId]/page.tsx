"use client";

import { use, useState } from "react";
import { useGuild } from "@/hooks/use-guilds";
import { useMembers, useTriggerSync } from "@/hooks/use-members";
import { useSyncEvents } from "@/hooks/use-sync-events";
import { MemberTable } from "@/components/member-table";
import { SyncProgress } from "@/components/sync-progress";
import { RefreshCw, Search } from "lucide-react";

function timeAgo(date: string | null): string | null {
  if (!date) return null;
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function GuildDashboardPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = use(params);
  const { data: guild, isLoading: guildLoading } = useGuild(guildId);
  const { data: membersData, isLoading: membersLoading } = useMembers(guildId);
  const { progress, connected } = useSyncEvents(guildId);
  const triggerSync = useTriggerSync(guildId);
  const [search, setSearch] = useState("");

  if (guildLoading || membersLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--text)]" />
      </div>
    );
  }

  if (!guild) {
    return <div className="text-center py-20 text-[var(--text-secondary)]">Guild not found.</div>;
  }

  const members = membersData?.members || [];
  const lastSynced = timeAgo(guild.lastActiveSyncAt);

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">{guild.name}</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              {guild.realm} — {guild.region.toUpperCase()} · {members.length} members
              {lastSynced && (
                <span className="ml-2">· Last synced {lastSynced}</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SyncProgress progress={progress} />

            {connected && (
              <span className="w-2 h-2 rounded-full bg-green-500" title="Live" />
            )}

            <button
              onClick={() => triggerSync.mutate()}
              disabled={triggerSync.isPending}
              className="btn btn-primary"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${triggerSync.isPending ? "animate-spin" : ""}`}
              />
              Sync
            </button>
          </div>
        </div>

        <div className="mt-5 relative max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            className="w-full h-10 pl-11 pr-4 bg-[var(--input)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--text)]"
          />
        </div>
      </div>

      <MemberTable members={members} region={guild.region} search={search} />
    </div>
  );
}
