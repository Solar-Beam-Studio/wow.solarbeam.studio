import { prisma } from "@wow/database";

export const dynamic = "force-dynamic";

export async function GET() {
  const guides = await prisma.guide.findMany({
    where: { status: "published", locale: "en" },
    orderBy: { publishedAt: "desc" },
    take: 20,
    select: {
      slug: true,
      title: true,
      metaDescription: true,
      publishedAt: true,
    },
  });

  const items = guides
    .map(
      (g) => `    <item>
      <title>${escapeXml(g.title)}</title>
      <link>https://wowguilds.com/guides/${g.slug}</link>
      <description>${escapeXml(g.metaDescription || "")}</description>
      <pubDate>${g.publishedAt?.toUTCString() || ""}</pubDate>
      <guid>https://wowguilds.com/guides/${g.slug}</guid>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>WoW Guilds — Guides</title>
    <link>https://wowguilds.com/guides</link>
    <description>Data-backed World of Warcraft guides and analysis</description>
    <language>en</language>
    <atom:link href="https://wowguilds.com/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
