import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@wow/database";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const { guildId } = await params;
    const guild = await prisma.guild.findUnique({
      where: { id: guildId },
    });

    if (!guild) {
      return NextResponse.json({ error: "Guild not found" }, { status: 404 });
    }

    return NextResponse.json(guild);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch guild" },
      { status: 500 }
    );
  }
}
