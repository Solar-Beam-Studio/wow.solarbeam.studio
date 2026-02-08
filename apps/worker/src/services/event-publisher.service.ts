import type Redis from "ioredis";

export interface SyncEvent {
  type:
    | "sync:progress"
    | "sync:complete"
    | "sync:error"
    | "discovery:complete"
    | "discovery:error"
    | "member:updated";
  guildId: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export class EventPublisher {
  constructor(private redis: Redis) {}

  async publish(guildId: string, event: Omit<SyncEvent, "timestamp">) {
    const fullEvent: SyncEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };
    await this.redis.publish(
      `guild:${guildId}:sync`,
      JSON.stringify(fullEvent)
    );
  }

  async publishProgress(
    guildId: string,
    current: number,
    total: number,
    errors: number,
    character?: string
  ) {
    await this.publish(guildId, {
      type: "sync:progress",
      guildId,
      data: { current, total, errors, character, status: "syncing" },
    });
  }

  async publishComplete(
    guildId: string,
    synced: number,
    errors: number,
    duration: number,
    jobType: string
  ) {
    await this.publish(guildId, {
      type: "sync:complete",
      guildId,
      data: { synced, errors, duration, jobType, status: "complete" },
    });
  }

  async publishError(guildId: string, message: string) {
    await this.publish(guildId, {
      type: "sync:error",
      guildId,
      data: { message },
    });
  }

  async publishDiscoveryComplete(
    guildId: string,
    total: number,
    updated: number,
    errors: number,
    duration: number
  ) {
    await this.publish(guildId, {
      type: "discovery:complete",
      guildId,
      data: { total, updated, errors, duration },
    });
  }

  async publishMemberUpdated(
    guildId: string,
    characterName: string,
    realm: string,
    data: Record<string, unknown>
  ) {
    await this.publish(guildId, {
      type: "member:updated",
      guildId,
      data: { characterName, realm, ...data },
    });
  }
}
