import { prisma } from "@wow/database";
import { HomeClient } from "./home-client";

export const revalidate = 60;

export default async function HomePage() {
  const [guilds, totalMembers, topCharacters, recentSync] = await Promise.all([
    prisma.guild.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        realm: true,
        region: true,
        memberCount: true,
        lastActiveSyncAt: true,
      },
    }),
    prisma.guildMember.count(),
    prisma.guildMember.findMany({
      where: { itemLevel: { not: null } },
      orderBy: { itemLevel: "desc" },
      take: 10,
      select: {
        characterName: true,
        realm: true,
        characterClass: true,
        itemLevel: true,
        mythicPlusScore: true,
        guild: { select: { name: true, id: true } },
      },
    }),
    prisma.syncJob.findFirst({
      where: { status: "completed" },
      orderBy: { completedAt: "desc" },
      select: { completedAt: true },
    }),
  ]);

  return (
    <HomeClient
      guilds={guilds}
      totalMembers={totalMembers}
      topCharacters={topCharacters}
      lastSyncAt={recentSync?.completedAt?.toISOString() ?? null}
    />
  );
}
