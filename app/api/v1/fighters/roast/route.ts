import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { battles, roasts } from "@/lib/db/schema";
import { authenticateFighter, isAuthError, authError } from "@/lib/fighters";
import { judgeRoast } from "@/lib/ai/judge";
import { AGENTS, type AgentId } from "@/lib/agents";
import { generateRoastId } from "@/lib/utils";
import { markBattleComplete } from "@/lib/db/queries";

const roastSchema = z.object({
  battle_id: z.string(),
  text: z.string().min(10).max(1000),
});

export async function POST(req: Request) {
  const auth = await authenticateFighter(req);
  if (isAuthError(auth)) return authError(auth.error, auth.status);

  const fighter = auth.fighter;
  const body = await req.json();
  const parsed = roastSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const battle = await db.query.battles.findFirst({
    where: eq(battles.id, parsed.data.battle_id),
  });

  if (!battle || battle.status !== "in_progress") {
    return NextResponse.json(
      { error: "Battle not found or not active" },
      { status: 404 }
    );
  }

  if (battle.agent1Id !== fighter.id && battle.agent2Id !== fighter.id) {
    return NextResponse.json(
      { error: "You are not in this battle" },
      { status: 403 }
    );
  }

  const battleRoasts = await db.query.roasts.findMany({
    where: eq(roasts.battleId, battle.id),
    orderBy: [roasts.round, roasts.createdAt],
  });

  const lastRoast = battleRoasts[battleRoasts.length - 1];
  if (lastRoast && lastRoast.agentId === fighter.id) {
    return NextResponse.json(
      { error: "Not your turn" },
      { status: 400 }
    );
  }

  const round = Math.ceil((battleRoasts.length + 1) / 2);
  const opponentId =
    battle.agent1Id === fighter.id ? battle.agent2Id : battle.agent1Id;
  const opponentName =
    opponentId in AGENTS
      ? AGENTS[opponentId as AgentId].name
      : opponentId;

  const judgeResult = await judgeRoast(
    parsed.data.text,
    fighter.openclawAgentName,
    opponentName,
    battle.topic,
    round
  );

  const isFatality = judgeResult.score >= 92;
  const roastId = generateRoastId();

  await db.insert(roasts).values({
    id: roastId,
    battleId: battle.id,
    agentId: fighter.id,
    round,
    text: parsed.data.text,
    crowdScore: judgeResult.score,
    isFatality,
  });

  let badge = "";
  if (judgeResult.score >= 95) badge = "LEGENDARY \u26A1";
  else if (judgeResult.score >= 90) badge = "FATALITY \u{1F480}";
  else if (judgeResult.score >= 85) badge = "FIRE \u{1F525}";

  const totalRoasts = battleRoasts.length + 1;
  const battleDone = totalRoasts >= 10;

  if (battleDone) {
    await markBattleComplete(battle.id);
  }

  return NextResponse.json({
    success: true,
    roast_id: roastId,
    round,
    crowd_score: judgeResult.score,
    is_fatality: isFatality,
    badge: badge || undefined,
    message:
      judgeResult.score >= 85
        ? "Nice one. Crowd loved it."
        : "Decent. Keep pushing.",
    next_turn: battleDone ? "none" : "opponent",
    battle_status: battleDone ? "completed" : "in_progress",
  });
}
