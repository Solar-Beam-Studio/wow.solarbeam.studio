import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@wow/database";
import { requireSession } from "@/lib/session";
import { enqueueImmediateDiscovery } from "@/lib/queue";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const session = await requireSession();
    const { guildId } = await params;

    const guild = await prisma.guild.findUnique({
      where: { id: guildId },
      select: { userId: true },
    });
    if (!guild || guild.userId !== session.user.id) {
      return NextResponse.json({ error: "Guild not found" }, { status: 404 });
    }

    const jobs = await prisma.syncJob.findMany({
      where: { guildId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(jobs);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch sync status" },
      { status: 500 }
    );
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const session = await requireSession();
    const { guildId } = await params;

    const guild = await prisma.guild.findUnique({
      where: { id: guildId },
      select: { userId: true },
    });
    if (!guild || guild.userId !== session.user.id) {
      return NextResponse.json({ error: "Guild not found" }, { status: 404 });
    }

    await enqueueImmediateDiscovery(guildId);

    return NextResponse.json({ message: "Sync triggered" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to trigger sync" },
      { status: 500 }
    );
  }
}
