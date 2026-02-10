import { notFound } from "next/navigation";
import { prisma } from "@wow/database";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PublicGuildClient } from "./client";
import { GuildCrest } from "@/components/guild-crest";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ guildId: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { guildId, locale } = await params;
  const t = await getTranslations({ locale, namespace: "guildDetail" });
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { name: true, realm: true, region: true },
  });

  if (!guild) return { title: t("notFound") };

  return {
    title: `${guild.name} — ${guild.realm} (${guild.region.toUpperCase()})`,
    description: `View ${guild.name}'s roster on ${guild.realm}-${guild.region.toUpperCase()}`,
  };
}

export default async function PublicGuildPage({ params }: Props) {
  const { guildId, locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("guildDetail");

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: {
      name: true, realm: true, region: true,
      crestEmblemId: true, crestEmblemColor: true,
      crestBorderId: true, crestBorderColor: true, crestBgColor: true,
    },
  });

  if (!guild) notFound();

  const members = await prisma.guildMember.findMany({
    where: { guildId },
    orderBy: [{ itemLevel: "desc" }, { characterName: "asc" }],
  });

  // Serialize for client component (BigInt -> number, Date -> string)
  const serialized = members.map((m) => ({
    ...m,
    lastLoginTimestamp: m.lastLoginTimestamp
      ? Number(m.lastLoginTimestamp)
      : null,
    lastUpdated: m.lastUpdated.toISOString(),
  }));

  return (
    <div className="w-full px-4 py-6">
      <div className="mb-8 flex items-center gap-4">
        <GuildCrest
          emblemId={guild.crestEmblemId}
          emblemColor={guild.crestEmblemColor}
          borderId={guild.crestBorderId}
          borderColor={guild.crestBorderColor}
          bgColor={guild.crestBgColor}
          size={56}
        />
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-bold tracking-tight">{guild.name}</h1>
            <a
              href={`https://worldofwarcraft.blizzard.com/en-${guild.region}/guild/${guild.region}/${guild.realm}/${encodeURIComponent(guild.name.toLowerCase().replace(/\s+/g, "-"))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text)] bg-[var(--bg-tertiary)] hover:bg-[var(--border)] border border-[var(--border)] transition-all"
            >
              <ExternalLink className="w-3 h-3" />
              Armory
            </a>
          </div>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {guild.realm} — {guild.region.toUpperCase()} · {serialized.length} {t("members")}
          </p>
        </div>
      </div>

      <PublicGuildClient members={serialized} region={guild.region} />
    </div>
  );
}
