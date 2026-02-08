# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WoW Guild Sync is a **multi-tenant SaaS** for syncing World of Warcraft guild data. Users sign up, add their guild(s), and get a real-time sync dashboard showing item levels, M+ scores, PvP ratings, raid progress, and activity status for all guild members.

**Architecture**: Turborepo monorepo with three main packages:
- **`apps/web`**: Next.js 16 app (auth, dashboard UI, API routes, SSE real-time)
- **`apps/worker`**: BullMQ worker service (guild discovery, character sync, activity checks)
- **`packages/database`**: Shared Prisma 7 schema + PostgreSQL client (`@wow/database`)

**Stack**: Bun, Next.js 16, React 19, TanStack Query v5, Zustand, Better Auth, Prisma 7 + PostgreSQL + PgBouncer, BullMQ + Redis, SSE (replaces Socket.io), Tailwind CSS v4.

## Project Structure

```
├── packages/database/          # @wow/database — Prisma schema, client, WoW constants
│   ├── prisma/schema.prisma    # User, Session, Account, Guild, GuildMember, SyncJob, SyncError, SyncLog
│   ├── src/client.ts           # PrismaClient singleton with PgBouncer adapter
│   ├── src/wow-constants.ts    # Class colors, raid names, rating tier functions
│   └── src/index.ts            # Re-exports
├── apps/web/                   # Next.js 16 app
│   ├── app/                    # App router pages
│   │   ├── (auth)/             # Login & signup pages
│   │   ├── (dashboard)/        # Auth-protected guild management
│   │   └── api/                # REST + SSE API routes
│   ├── lib/                    # Auth config, queue client, session helpers
│   ├── hooks/                  # TanStack Query hooks (useGuilds, useMembers, useSyncEvents)
│   ├── stores/                 # Zustand (guild-store)
│   ├── components/             # React components (member-table, class-badge, rating-cell)
│   └── proxy.ts                # Next.js 16 auth guard (replaces middleware.ts)
├── apps/worker/                # BullMQ worker service
│   ├── src/workers/            # guild-discovery, character-sync, activity-check, sync-scheduler
│   ├── src/services/           # external-api (ported from JS), blizzard-token (Redis cache), event-publisher (Redis pub/sub)
│   └── src/lib/                # register-guild-jobs
└── _legacy/                    # Original single-tenant codebase (reference only)
```

## Development Commands

```bash
# Install all dependencies
bun install

# Generate Prisma client
cd packages/database && bunx prisma generate

# Push schema to database
cd packages/database && bunx prisma db push

# Start all services (web + worker need Redis running)
bun turbo dev

# Start just web
cd apps/web && bun dev

# Start just worker
cd apps/worker && bun dev

# Docker (includes Redis)
docker compose up

# Production deploy
./deploy.sh
```

## Configuration

Required environment variables (`.env`):
- `DATABASE_URL` — PostgreSQL connection string (PgBouncer port 6432)
- `DIRECT_URL` — Direct PostgreSQL connection (port 5432, for migrations)
- `REDIS_HOST`, `REDIS_PORT` — Redis for BullMQ and pub/sub
- `BETTER_AUTH_SECRET` — Auth session secret
- `BLIZZARD_CLIENT_ID`, `BLIZZARD_CLIENT_SECRET` — Blizzard API OAuth
- `NEXT_PUBLIC_APP_URL` — Public app URL for auth
- `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `CONTACT_EMAIL` — Optional email notifications

## Key Implementation Details

**Authentication**: Better Auth with email/password. Cookie prefix: `wow-sync`. `proxy.ts` guards `/guilds/*` and `/account/*` routes.

**Multi-tenant data isolation**: All data models include `guildId` foreign key. API routes verify `guild.userId === session.userId` before any operation.

**Two-tier sync (per guild)**:
1. **Guild Discovery** (repeatable BullMQ job): Fetches roster, upserts members, bulk checks activity, removes departed members
2. **Sync Scheduler** (repeatable BullMQ job): Reads active characters, splits into batches of 40, enqueues character-sync jobs
3. **Character Sync** (BullMQ worker): Deep sync — item level, M+, PvP, raids, achievements from Raider.IO + Blizzard
4. **Activity Check** (BullMQ worker): Batch login timestamp checks

**Real-time updates**: Worker publishes to Redis channel `guild:{guildId}:sync`. Next.js SSE route (`/api/guilds/[guildId]/events`) subscribes and streams to browser. Frontend `useSyncEvents(guildId)` hook auto-invalidates TanStack Query on events.

**Blizzard token**: Redis-backed with NX lock to prevent thundering herd. Cached for 55 minutes.

**Data sources**: Guild roster from Blizzard API, M+ scores from Raider.IO (faster), PvP ratings from Blizzard (current season filtering), achievements from Blizzard.

## Database Schema

**Auth models**: User, Session, Account, Verification (Better Auth managed)

**Guild**: name, realm, region, syncEnabled, intervals, userId. Unique on `[name, realm, region]`.

**GuildMember**: guildId, characterName, realm, characterClass, level, itemLevel, mythicPlusScore, pvp ratings (2v2, 3v3, RBG, solo shuffle, RBG blitz), achievementPoints, raidProgress, activityStatus, lastLoginTimestamp. Unique on `[guildId, characterName, realm]`.

**SyncJob**: guildId, type (discovery/active_sync), status, progress tracking, bullmqJobId, duration.

**SyncError**: guildId, characterName, errorType, service, urlAttempted.

## Common Patterns

**Adding a new API data field**:
1. Add column to `GuildMember` in `packages/database/prisma/schema.prisma`
2. Run `cd packages/database && bunx prisma migrate dev`
3. Update `ExternalApiService` in `apps/worker/src/services/external-api.service.ts`
4. Update `character-sync.worker.ts` to store the new field
5. Update `MemberTable` in `apps/web/components/member-table.tsx`

**Adding a new BullMQ worker**:
1. Create worker in `apps/worker/src/workers/`
2. Register in `apps/worker/src/index.ts`
3. Add queue name to `apps/worker/src/queues.ts`

**Debugging sync issues**:
1. `docker compose logs -f worker`
2. Check sync jobs: `GET /api/guilds/{id}/sync`
3. Check Redis: `redis-cli monitor`
4. Check health: `GET /api/health`
