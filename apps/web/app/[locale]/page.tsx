import { prisma } from "@wow/database";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HomeClient } from "./home-client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
    alternates: {
      canonical: "/",
      languages: { en: "/", fr: "/fr" },
    },
    openGraph: {
      title: t("homeTitle"),
      description: t("homeDescription"),
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [guilds, totalMembers, activeMembers, recentSyncJobs, recentGuilds] =
    await Promise.all([
      prisma.guild.findMany({
        orderBy: { updatedAt: "desc" },
        select: { id: true },
      }),
      prisma.guildMember.count(),
      prisma.guildMember.count({
        where: {
          lastLoginTimestamp: {
            gte: BigInt(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.syncJob.findMany({
        where: { status: "completed" },
        orderBy: { completedAt: "desc" },
        take: 20,
        select: {
          id: true,
          type: true,
          totalItems: true,
          processedItems: true,
          completedAt: true,
          duration: true,
          guild: {
            select: {
              name: true,
              id: true,
              realm: true,
              region: true,
              crestEmblemId: true,
              crestEmblemColor: true,
              crestBorderId: true,
              crestBorderColor: true,
              crestBgColor: true,
            },
          },
        },
      }),
      prisma.guild.findMany({
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: {
          id: true,
          name: true,
          realm: true,
          region: true,
          memberCount: true,
          updatedAt: true,
          crestEmblemId: true,
          crestEmblemColor: true,
          crestBorderId: true,
          crestBorderColor: true,
          crestBgColor: true,
        },
      }),
    ]);

  // Deduplicate: keep only the latest sync job per guild
  const seenGuilds = new Set<string>();
  const uniqueSyncJobs = recentSyncJobs.filter((job) => {
    if (seenGuilds.has(job.guild.id)) return false;
    seenGuilds.add(job.guild.id);
    return true;
  }).slice(0, 5);

  const recentActivity = uniqueSyncJobs.map((job) => ({
    id: job.id,
    type: job.type,
    totalItems: job.totalItems,
    processedItems: job.processedItems,
    completedAt: job.completedAt?.toISOString() ?? null,
    duration: job.duration,
    guildName: job.guild.name,
    guildId: job.guild.id,
    guildRealm: job.guild.realm,
    guildRegion: job.guild.region,
    crestEmblemId: job.guild.crestEmblemId,
    crestEmblemColor: job.guild.crestEmblemColor,
    crestBorderId: job.guild.crestBorderId,
    crestBorderColor: job.guild.crestBorderColor,
    crestBgColor: job.guild.crestBgColor,
  }));

  const recentGuildsData = recentGuilds.map((g) => ({
    id: g.id,
    name: g.name,
    realm: g.realm,
    region: g.region,
    memberCount: g.memberCount,
    updatedAt: g.updatedAt.toISOString(),
    crestEmblemId: g.crestEmblemId,
    crestEmblemColor: g.crestEmblemColor,
    crestBorderId: g.crestBorderId,
    crestBorderColor: g.crestBorderColor,
    crestBgColor: g.crestBgColor,
  }));

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "WoW Guilds",
    url: "https://wowguilds.com",
    description: "Search any World of Warcraft guild and view the full roster with item levels, M+ scores, PvP ratings, and raid progress.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://wowguilds.com/g/{region}/{realm}/{guild_name}",
      },
      "query-input": "required name=guild_name",
    },
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "WoW Guilds",
    url: "https://wowguilds.com",
    logo: "https://wowguilds.com/logomark.svg",
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Safe: content is hardcoded, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        // Safe: content is hardcoded, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <HomeClient
        guilds={guilds}
        totalMembers={totalMembers}
        activeMembers={activeMembers}
        recentActivity={recentActivity}
        recentGuilds={recentGuildsData}
      />
    </>
  );
}
