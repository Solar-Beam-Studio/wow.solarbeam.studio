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

  return [...staticEntries, ...guildEntries];
}
