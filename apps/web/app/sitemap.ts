import type { MetadataRoute } from "next";
import { prisma } from "@wow/database";
import { guildPath } from "@/lib/guild-url";

export const dynamic = "force-dynamic";

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
    select: { name: true, realm: true, region: true, updatedAt: true },
  });

  const guildEntries: MetadataRoute.Sitemap = guilds.map((guild) => {
    const path = guildPath(guild);
    return {
      url: `${BASE_URL}${path}`,
      lastModified: guild.updatedAt,
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
