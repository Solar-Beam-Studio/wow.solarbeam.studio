import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@wow/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const { guildId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
    const before = searchParams.get("before");

    const guild = await prisma.guild.findUnique({
      where: { id: guildId },
      select: { id: true },
    });
    if (!guild) {
      return NextResponse.json({ error: "Guild not found" }, { status: 404 });
    }

    const events = await prisma.guildEvent.findMany({
      where: {
        guildId,
        ...(before ? { id: { lt: Number(before) } } : {}),
      },
      orderBy: { id: "desc" },
      take: limit,
    });

    return NextResponse.json({
      events,
      nextCursor: events.length === limit ? events[events.length - 1].id : null,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
