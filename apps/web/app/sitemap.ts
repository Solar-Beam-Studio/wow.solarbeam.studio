import type { MetadataRoute } from "next";
import { prisma } from "@wow/database";
import { guildPath } from "@/lib/guild-url";

export const dynamic = "force-dynamic";

const BASE_URL = "https://wowguilds.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: { languages: { en: BASE_URL, fr: `${BASE_URL}/fr` } },
    },
    {
      url: `${BASE_URL}/stats`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
      alternates: { languages: { en: `${BASE_URL}/stats`, fr: `${BASE_URL}/fr/stats` } },
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
      alternates: { languages: { en: `${BASE_URL}/faq`, fr: `${BASE_URL}/fr/faq` } },
    },
  ];

  const guilds = await prisma.guild.findMany({
    select: { name: true, realm: true, region: true, updatedAt: true },
  });

  const guildEntries: MetadataRoute.Sitemap = guilds.map((guild) => {
    const path = guildPath(guild);
    return {
      url: `${BASE_URL}${path}`,
      lastModified: guild.updatedAt,
      changeFrequency: "daily",
      priority: 0.8,
      alternates: {
        languages: {
          en: `${BASE_URL}${path}`,
          fr: `${BASE_URL}/fr${path}`,
        },
      },
    };
  });

  const allPublishedGuides = await prisma.guide.findMany({
    where: { status: "published" },
    select: { slug: true, locale: true, updatedAt: true },
  });

  // Group by slug to know which translations exist
  const guidesBySlug = new Map<string, { locales: Set<string>; updatedAt: Date }>();
  for (const g of allPublishedGuides) {
    const existing = guidesBySlug.get(g.slug);
    if (existing) {
      existing.locales.add(g.locale);
      if (g.updatedAt > existing.updatedAt) existing.updatedAt = g.updatedAt;
    } else {
      guidesBySlug.set(g.slug, { locales: new Set([g.locale]), updatedAt: g.updatedAt });
    }
  }

  const guideEntries: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/guides`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
      alternates: {
        languages: { en: `${BASE_URL}/guides`, fr: `${BASE_URL}/fr/guides` },
      },
    },
    ...Array.from(guidesBySlug.entries()).map(([slug, { locales, updatedAt }]) => {
      const languages: Record<string, string> = {};
      if (locales.has("en")) languages.en = `${BASE_URL}/guides/${slug}`;
      if (locales.has("fr")) languages.fr = `${BASE_URL}/fr/guides/${slug}`;
      return {
        url: `${BASE_URL}/guides/${slug}`,
        lastModified: updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: { languages },
      };
    }),
  ];

  return [...staticEntries, ...guildEntries, ...guideEntries];
}
