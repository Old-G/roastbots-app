import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { challenges, battles } from "@/lib/db/schema";
import { authenticateFighter, isAuthError, authError } from "@/lib/fighters";
import { AGENTS } from "@/lib/agents";
import { generateBattleId } from "@/lib/utils";
import { nanoid } from "nanoid";

const challengeSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("accept"),
    challenge_id: z.string(),
  }),
  z.object({
    action: z.literal("decline"),
    challenge_id: z.string(),
  }),
  z.object({
    action: z.literal("create"),
    opponent_id: z.string(),
    topic: z.string().min(1).max(500),
  }),
]);

export async function POST(req: Request) {
  const auth = await authenticateFighter(req);
  if (isAuthError(auth)) return authError(auth.error, auth.status);

  const fighter = auth.fighter;
  const body = await req.json();
  const parsed = challengeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (data.action === "decline") {
    await db
      .update(challenges)
      .set({ status: "declined" })
      .where(eq(challenges.id, data.challenge_id));

    return NextResponse.json({ message: "Challenge declined." });
  }

  if (data.action === "accept") {
    const challenge = await db.query.challenges.findFirst({
      where: eq(challenges.id, data.challenge_id),
    });

    if (!challenge || challenge.status !== "pending") {
      return NextResponse.json(
        { error: "Challenge not found or expired" },
        { status: 404 }
      );
    }

    if (challenge.expiresAt < new Date()) {
      await db
        .update(challenges)
        .set({ status: "expired" })
        .where(eq(challenges.id, challenge.id));

      return NextResponse.json(
        { error: "Challenge has expired" },
        { status: 410 }
      );
    }

    const battleId = generateBattleId();
    await db.insert(battles).values({
      id: battleId,
      agent1Id: challenge.challengerId,
      agent2Id: fighter.id,
      topic: challenge.topic,
      status: "in_progress",
    });

    await db
      .update(challenges)
      .set({ status: "accepted", battleId })
      .where(eq(challenges.id, challenge.id));

    return NextResponse.json({
      battle_id: battleId,
      message: "Battle created. Challenger goes first.",
    });
  }

  // action === "create"
  if (data.opponent_id === fighter.id) {
    return NextResponse.json(
      { error: "You cannot challenge yourself" },
      { status: 400 }
    );
  }

  const opponentId =
    data.opponent_id === "random"
      ? Object.keys(AGENTS)[
          Math.floor(Math.random() * Object.keys(AGENTS).length)
        ]
      : data.opponent_id;

  const isHouseBot = opponentId in AGENTS;

  if (isHouseBot) {
    // Instant battle vs house bot
    const battleId = generateBattleId();
    await db.insert(battles).values({
      id: battleId,
      agent1Id: fighter.id,
      agent2Id: opponentId,
      topic: data.topic,
      status: "in_progress",
    });

    return NextResponse.json({
      battle_id: battleId,
      message: "Battle created. You go first.",
    });
  }

  // Challenge another fighter
  const challengeId = `chl_${nanoid(12)}`;
  await db.insert(challenges).values({
    id: challengeId,
    challengerId: fighter.id,
    opponentId,
    topic: data.topic,
    expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
  });

  return NextResponse.json({
    challenge_id: challengeId,
    message: "Challenge sent. Waiting for opponent to accept.",
  });
}
