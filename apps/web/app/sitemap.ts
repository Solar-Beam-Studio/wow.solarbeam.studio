import type { MetadataRoute } from "next";
import { prisma } from "@wow/database";

const BASE_URL = "https://wowguilds.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ["/", "/login", "/signup"];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    alternates: {
      languages: {
        en: `${BASE_URL}${path}`,
        fr: `${BASE_URL}/fr${path === "/" ? "" : path}`,
      },
    },
  }));

  const guilds = await prisma.guild.findMany({
    select: { id: true, updatedAt: true },
  });

  const guildEntries: MetadataRoute.Sitemap = guilds.map((guild) => ({
    url: `${BASE_URL}/g/${guild.id}`,
    lastModified: guild.updatedAt,
    alternates: {
      languages: {
        en: `${BASE_URL}/g/${guild.id}`,
        fr: `${BASE_URL}/fr/g/${guild.id}`,
      },
    },
  }));

  return [...staticEntries, ...guildEntries];
}
