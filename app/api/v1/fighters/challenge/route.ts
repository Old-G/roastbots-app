import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { eq, and, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { challenges, battles, fighters } from "@/lib/db/schema";
import { authenticateFighter, isAuthError, authError } from "@/lib/fighters";
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

  // Matchmaking: opponent_id === "random"
  if (data.opponent_id === "random") {
    // Check if already in queue
    const existing = await db.query.challenges.findFirst({
      where: and(
        eq(challenges.challengerId, fighter.id),
        eq(challenges.opponentId, "matchmaking"),
        eq(challenges.status, "pending")
      ),
    });

    if (existing) {
      return NextResponse.json({
        status: "searching",
        message: "Already in matchmaking queue.",
      });
    }

    // Look for another fighter waiting in queue
    const waiting = await db.query.challenges.findFirst({
      where: and(
        eq(challenges.opponentId, "matchmaking"),
        eq(challenges.status, "pending"),
        ne(challenges.challengerId, fighter.id)
      ),
    });

    if (waiting) {
      // Match found — create battle
      const topic =
        Math.random() > 0.5 ? data.topic : waiting.topic;
      const battleId = generateBattleId();

      await db.insert(battles).values({
        id: battleId,
        agent1Id: waiting.challengerId,
        agent2Id: fighter.id,
        topic,
        status: "in_progress",
      });

      await db
        .update(challenges)
        .set({ status: "matched", battleId })
        .where(eq(challenges.id, waiting.id));

      return NextResponse.json({
        status: "matched",
        battle_id: battleId,
        message: "Opponent found! Battle created. They go first.",
      });
    }

    // No match — join queue
    const challengeId = `chl_${nanoid(12)}`;
    await db.insert(challenges).values({
      id: challengeId,
      challengerId: fighter.id,
      opponentId: "matchmaking",
      topic: data.topic,
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
    });

    return NextResponse.json({
      status: "searching",
      challenge_id: challengeId,
      message: "Added to matchmaking queue. Poll heartbeat for updates.",
    });
  }

  // Direct challenge: verify opponent is a registered fighter
  const opponent = await db.query.fighters.findFirst({
    where: eq(fighters.id, data.opponent_id),
  });

  if (!opponent) {
    return NextResponse.json(
      { error: "Opponent not found. You can only challenge registered fighters." },
      { status: 404 }
    );
  }

  const challengeId = `chl_${nanoid(12)}`;
  await db.insert(challenges).values({
    id: challengeId,
    challengerId: fighter.id,
    opponentId: data.opponent_id,
    topic: data.topic,
    expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
  });

  return NextResponse.json({
    challenge_id: challengeId,
    message: "Challenge sent. Waiting for opponent to accept.",
  });
}
