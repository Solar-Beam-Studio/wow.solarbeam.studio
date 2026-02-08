import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@wow/database";
import { requireSession } from "@/lib/session";
import { removeGuildSchedules } from "@/lib/queue";

async function getOwnedGuild(guildId: string, userId: string) {
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
  });
  if (!guild || guild.userId !== userId) return null;
  return guild;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const session = await requireSession();
    const { guildId } = await params;
    const guild = await getOwnedGuild(guildId, session.user.id);

    if (!guild) {
      return NextResponse.json({ error: "Guild not found" }, { status: 404 });
    }

    return NextResponse.json(guild);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch guild" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const session = await requireSession();
    const { guildId } = await params;
    const guild = await getOwnedGuild(guildId, session.user.id);

    if (!guild) {
      return NextResponse.json({ error: "Guild not found" }, { status: 404 });
    }

    const body = await request.json();
    const allowedFields = [
      "syncEnabled",
      "discoveryIntervalHours",
      "activeSyncIntervalMin",
      "activityWindowDays",
    ];
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) updateData[field] = body[field];
    }

    const updated = await prisma.guild.update({
      where: { id: guildId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update guild" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const session = await requireSession();
    const { guildId } = await params;
    const guild = await getOwnedGuild(guildId, session.user.id);

    if (!guild) {
      return NextResponse.json({ error: "Guild not found" }, { status: 404 });
    }

    // Remove scheduled jobs
    await removeGuildSchedules(guildId);

    // Cascade delete via Prisma relations
    await prisma.guild.delete({ where: { id: guildId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete guild" },
      { status: 500 }
    );
  }
}
