"use client";

import Link from "next/link";
import { useGuilds, useDeleteGuild, useToggleSync } from "@/hooks/use-guilds";
import { Plus, Trash2 } from "lucide-react";

export default function GuildsPage() {
  const { data: guilds, isLoading } = useGuilds();
  const deleteGuild = useDeleteGuild();
  const toggleSync = useToggleSync();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--text)]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold tracking-tight">My Guilds</h1>
        <Link href="/guilds/new" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Add Guild
        </Link>
      </div>

      {!guilds || guilds.length === 0 ? (
        <div className="text-center py-24 bg-[var(--bg-tertiary)] rounded-2xl">
          <p className="text-[var(--text-secondary)] mb-6 font-medium">No guilds added yet.</p>
          <Link href="/guilds/new" className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Add your first guild
          </Link>
        </div>
      ) : (
        <div className="flex flex-col">
          {guilds.map((guild) => (
            <div
              key={guild.id}
              className="flex items-center justify-between py-5 hover:bg-[var(--bg-tertiary)] px-4 -mx-4 transition-colors rounded-xl group"
            >
              <Link
                href={`/guilds/${guild.id}`}
                className="flex-1"
              >
                <div className="flex items-center gap-6">
                  <div>
                    <h2 className="font-display font-bold text-lg group-hover:text-accent transition-colors">{guild.name}</h2>
                    <p className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">
                      {guild.realm} — {guild.region.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex gap-6 text-sm text-[var(--text-secondary)] font-medium">
                    <span>
                      <span className="font-mono tabular-nums text-[var(--text)] font-bold">{guild._count?.members ?? guild.memberCount}</span> members
                    </span>
                    {guild.lastDiscoveryAt && (
                      <span className="opacity-60 italic">
                        {new Date(guild.lastDiscoveryAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              <div className="flex items-center gap-4">
                <button
                  onClick={() =>
                    toggleSync.mutate({
                      guildId: guild.id,
                      syncEnabled: !guild.syncEnabled,
                    })
                  }
                  className="cursor-pointer p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                  title={guild.syncEnabled ? "Disable sync" : "Enable sync"}
                >
                  <div
                    className={`w-2 h-2 rounded-full transition-colors ${guild.syncEnabled ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-zinc-500/30"}`}
                  />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete guild "${guild.name}"?`)) {
                      deleteGuild.mutate(guild.id);
                    }
                  }}
                  className="btn btn-ghost w-9 h-9 px-0 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
