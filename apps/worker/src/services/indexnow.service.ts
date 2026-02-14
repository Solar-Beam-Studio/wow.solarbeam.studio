const INDEXNOW_KEY = "5bfd689e5caf4648bb41898ead04913e";
const HOST = "wowguilds.com";

export class IndexNowService {
  async submitUrls(urls: string[]): Promise<void> {
    if (!urls.length) return;

    try {
      const res = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: HOST,
          key: INDEXNOW_KEY,
          keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
          urlList: urls.map((u) =>
            u.startsWith("http") ? u : `https://${HOST}${u}`
          ),
        }),
      });

      if (res.ok || res.status === 202) {
        console.log(`[IndexNow] Submitted ${urls.length} URLs`);
      } else {
        console.warn(`[IndexNow] ${res.status}: ${await res.text().catch(() => "")}`);
      }
    } catch (e) {
      // Non-critical — don't throw
      console.warn("[IndexNow] Failed:", e instanceof Error ? e.message : e);
    }
  }

  async submitGuide(slug: string, locale: string): Promise<void> {
    const prefix = locale === "en" ? "" : `/${locale}`;
    await this.submitUrls([
      `${prefix}/guides/${slug}`,
      `${prefix}/guides`, // re-index the listing too
    ]);
  }

  async submitGuild(guildPath: string): Promise<void> {
    await this.submitUrls([
      guildPath,
      `/fr${guildPath}`,
    ]);
  }
}
