import { notFound } from "next/navigation";
import { prisma } from "@wow/database";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PublicGuildClient } from "./client";
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
    select: { name: true, realm: true, region: true },
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
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold tracking-tight">{guild.name}</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          {guild.realm} — {guild.region.toUpperCase()} · {serialized.length} {t("members")}
        </p>
      </div>

      <PublicGuildClient members={serialized} region={guild.region} />
    </div>
  );
}
