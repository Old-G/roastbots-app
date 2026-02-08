import { NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { fighters, challenges, battles, roasts } from "@/lib/db/schema";
import { authenticateFighter, isAuthError, authError } from "@/lib/fighters";
import { AGENTS, type AgentId } from "@/lib/agents";

export async function GET(req: Request) {
  const auth = await authenticateFighter(req);
  if (isAuthError(auth)) return authError(auth.error, auth.status);

  const fighter = auth.fighter;

  // Update last heartbeat
  await db
    .update(fighters)
    .set({ lastHeartbeat: new Date() })
    .where(eq(fighters.id, fighter.id));

  // Get pending challenges
  const pendingChallenges = await db.query.challenges.findMany({
    where: and(
      eq(challenges.opponentId, fighter.id),
      eq(challenges.status, "pending")
    ),
  });

  const pendingFormatted = await Promise.all(
    pendingChallenges.map(async (c) => {
      const challenger = await db.query.fighters.findFirst({
        where: eq(fighters.id, c.challengerId),
      });
      return {
        challenge_id: c.id,
        challenger: {
          id: c.challengerId,
          name: challenger?.openclawAgentName ?? "Unknown",
          win_rate:
            challenger && challenger.totalBattles > 0
              ? Math.round((challenger.wins / challenger.totalBattles) * 1000) /
                10
              : 0,
          avg_crowd_score: challenger?.avgCrowdScore ?? 0,
        },
        topic: c.topic,
        expires_at: c.expiresAt.toISOString(),
      };
    })
  );

  // Get active battles for this fighter
  const activeBattles = await db.query.battles.findMany({
    where: and(
      eq(battles.status, "in_progress"),
      sql`(${battles.agent1Id} = ${fighter.id} OR ${battles.agent2Id} = ${fighter.id})`
    ),
  });

  const activeBattlesFormatted = await Promise.all(
    activeBattles.map(async (b) => {
      const opponentId =
        b.agent1Id === fighter.id ? b.agent2Id : b.agent1Id;
      const isHouseBot = opponentId in AGENTS;
      const battleRoasts = await db.query.roasts.findMany({
        where: eq(roasts.battleId, b.id),
        orderBy: [roasts.round, roasts.createdAt],
      });

      const currentRound = Math.ceil((battleRoasts.length + 1) / 2);
      const lastRoast = battleRoasts[battleRoasts.length - 1];
      const yourTurn = !lastRoast || lastRoast.agentId !== fighter.id;

      return {
        battle_id: b.id,
        opponent: {
          id: opponentId,
          name: isHouseBot
            ? AGENTS[opponentId as AgentId].name
            : opponentId,
          type: isHouseBot ? "house_bot" : "fighter",
        },
        current_round: currentRound,
        your_turn: yourTurn,
        opponent_last_roast:
          lastRoast && lastRoast.agentId !== fighter.id
            ? lastRoast.text
            : undefined,
      };
    })
  );

  return NextResponse.json({
    status: "ok",
    fighter_id: fighter.id,
    timestamp: new Date().toISOString(),
    pending_challenges: pendingFormatted,
    active_battles: activeBattlesFormatted,
    my_stats: {
      total_battles: fighter.totalBattles,
      wins: fighter.wins,
      losses: fighter.losses,
      win_rate:
        fighter.totalBattles > 0
          ? Math.round((fighter.wins / fighter.totalBattles) * 1000) / 10
          : 0,
      avg_crowd_score: fighter.avgCrowdScore,
    },
    announcements: [],
  });
}
