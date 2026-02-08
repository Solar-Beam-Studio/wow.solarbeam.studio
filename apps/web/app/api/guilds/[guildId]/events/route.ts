import { NextRequest } from "next/server";
import Redis from "ioredis";
import { prisma } from "@wow/database";
import { requireSession } from "@/lib/session";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const session = await requireSession();
    const { guildId } = await params;

    // Verify ownership
    const guild = await prisma.guild.findUnique({
      where: { id: guildId },
      select: { userId: true },
    });
    if (!guild || guild.userId !== session.user.id) {
      return new Response("Guild not found", { status: 404 });
    }

    const redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
    });

    const channel = `guild:${guildId}:sync`;

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        // Send initial connection event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`));

        redis.subscribe(channel).catch((err) => {
          console.error("Redis subscribe error:", err);
          controller.close();
        });

        redis.on("message", (_ch: string, message: string) => {
          controller.enqueue(encoder.encode(`data: ${message}\n\n`));
        });

        redis.on("error", () => {
          controller.close();
        });
      },
      cancel() {
        redis.unsubscribe(channel).catch(() => {});
        redis.quit().catch(() => {});
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return new Response("Unauthorized", { status: 401 });
    }
    return new Response("Internal error", { status: 500 });
  }
}
