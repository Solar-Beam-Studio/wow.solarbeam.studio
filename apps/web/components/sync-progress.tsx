import type { SyncProgress as SyncProgressData } from "@/hooks/use-sync-events";

export function SyncProgress({ progress }: { progress: SyncProgressData | null }) {
  if (!progress) return null;

  return (
    <span className="inline-flex items-center gap-2 h-8 px-4 bg-accent/10 rounded-full text-xs font-bold text-accent">
      <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
      <span>
        {progress.current}/{progress.total}
      </span>
      {progress.character && (
        <span className="opacity-70">{progress.character}</span>
      )}
      {progress.errors > 0 && (
        <span className="text-red-400 ml-1">({progress.errors} err)</span>
      )}
    </span>
  );
}
