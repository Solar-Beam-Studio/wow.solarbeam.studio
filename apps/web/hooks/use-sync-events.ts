"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface SyncEvent {
  type: string;
  guildId: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface SyncProgress {
  current: number;
  total: number;
  errors: number;
  character?: string;
  status: string;
}

export function useSyncEvents(guildId: string | null) {
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [connected, setConnected] = useState(false);
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleEvent = useCallback(
    (event: SyncEvent) => {
      switch (event.type) {
        case "sync:progress":
          setProgress(event.data as unknown as SyncProgress);
          break;
        case "sync:complete":
        case "discovery:complete":
          setProgress(null);
          queryClient.invalidateQueries({ queryKey: ["members", guildId] });
          queryClient.invalidateQueries({
            queryKey: ["syncHistory", guildId],
          });
          queryClient.invalidateQueries({ queryKey: ["guild", guildId] });
          break;
        case "sync:error":
        case "discovery:error":
          setProgress(null);
          break;
        case "member:updated":
          queryClient.invalidateQueries({ queryKey: ["members", guildId] });
          break;
      }
    },
    [guildId, queryClient]
  );

  useEffect(() => {
    if (!guildId) return;

    const es = new EventSource(`/api/guilds/${guildId}/events`);
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      try {
        const event: SyncEvent = JSON.parse(e.data);
        handleEvent(event);
      } catch {
        // Ignore parse errors (e.g. initial connection event)
      }
    };

    es.onerror = () => {
      setConnected(false);
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [guildId, handleEvent]);

  return { progress, connected };
}
