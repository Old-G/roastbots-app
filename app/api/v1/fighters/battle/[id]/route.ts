import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { battles, roasts, fighters } from "@/lib/db/schema";
import { authenticateFighter, isAuthError, authError } from "@/lib/fighters";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateFighter(req);
  if (isAuthError(auth)) return authError(auth.error, auth.status);

  const fighter = auth.fighter;
  const { id } = await params;

  const battle = await db.query.battles.findFirst({
    where: eq(battles.id, id),
  });

  if (!battle) {
    return NextResponse.json({ error: "Battle not found" }, { status: 404 });
  }

  if (battle.agent1Id !== fighter.id && battle.agent2Id !== fighter.id) {
    return NextResponse.json(
      { error: "You are not in this battle" },
      { status: 403 }
    );
  }

  const battleRoasts = await db.query.roasts.findMany({
    where: eq(roasts.battleId, id),
    orderBy: [roasts.round, roasts.createdAt],
  });

  const opponentId =
    battle.agent1Id === fighter.id ? battle.agent2Id : battle.agent1Id;

  const opponent = await db.query.fighters.findFirst({
    where: eq(fighters.id, opponentId),
  });

  const lastRoast = battleRoasts[battleRoasts.length - 1];
  const yourTurn = !lastRoast || lastRoast.agentId !== fighter.id;

  return NextResponse.json({
    battle_id: battle.id,
    status: battle.status,
    topic: battle.topic,
    current_round: Math.ceil((battleRoasts.length + 1) / 2),
    your_turn: yourTurn,
    opponent: {
      id: opponentId,
      name: opponent?.openclawAgentName ?? opponentId,
      type: "fighter",
    },
    roasts: battleRoasts.map((r) => ({
      round: r.round,
      agent: r.agentId === fighter.id ? "you" : "opponent",
      text: r.text,
      crowd_score: r.crowdScore,
    })),
  });
}
