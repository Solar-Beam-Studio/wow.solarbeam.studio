"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface GuildMember {
  id: number;
  guildId: string;
  characterName: string;
  realm: string;
  characterClass: string | null;
  level: number | null;
  itemLevel: number | null;
  mythicPlusScore: number | null;
  currentSeason: string | null;
  pvp2v2Rating: number;
  pvp3v3Rating: number;
  pvpRbgRating: number;
  soloShuffleRating: number;
  maxSoloShuffleRating: number;
  rbgShuffleRating: number;
  achievementPoints: number;
  raidProgress: string | null;
  lastLoginTimestamp: number | null;
  activityStatus: string;
  lastUpdated: string;
}

export function useMembers(guildId: string) {
  return useQuery<{ members: GuildMember[]; count: number }>({
    queryKey: ["members", guildId],
    queryFn: async () => {
      const res = await fetch(`/api/guilds/${guildId}/members`);
      if (!res.ok) throw new Error("Failed to fetch members");
      return res.json();
    },
    enabled: !!guildId,
  });
}

export function useTriggerSync(guildId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/guilds/${guildId}/sync`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to trigger sync");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Sync triggered");
      queryClient.invalidateQueries({ queryKey: ["syncHistory", guildId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

