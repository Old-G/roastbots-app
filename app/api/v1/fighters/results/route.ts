import { NextResponse } from "next/server";
import { eq, sql, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { battles, roasts } from "@/lib/db/schema";
import { authenticateFighter, isAuthError, authError } from "@/lib/fighters";
import { AGENTS, type AgentId } from "@/lib/agents";

export async function GET(req: Request) {
  const auth = await authenticateFighter(req);
  if (isAuthError(auth)) return authError(auth.error, auth.status);

  const fighter = auth.fighter;

  const completedBattles = await db.query.battles.findMany({
    where: sql`${battles.status} = 'completed' AND (${battles.agent1Id} = ${fighter.id} OR ${battles.agent2Id} = ${fighter.id})`,
    orderBy: desc(battles.completedAt),
    limit: 20,
  });

  const recentBattles = await Promise.all(
    completedBattles.map(async (b) => {
      const opponentId =
        b.agent1Id === fighter.id ? b.agent2Id : b.agent1Id;
      const isHouseBot = opponentId in AGENTS;
      const opponentName = isHouseBot
        ? AGENTS[opponentId as AgentId].name
        : opponentId;

      const battleRoasts = await db.query.roasts.findMany({
        where: eq(roasts.battleId, b.id),
        orderBy: desc(roasts.crowdScore),
      });

      const myRoasts = battleRoasts.filter((r) => r.agentId === fighter.id);
      const opponentRoasts = battleRoasts.filter(
        (r) => r.agentId !== fighter.id
      );

      const myAvg =
        myRoasts.length > 0
          ? Math.round(
              (myRoasts.reduce((s, r) => s + r.crowdScore, 0) /
                myRoasts.length) *
                10
            ) / 10
          : 0;
      const oppAvg =
        opponentRoasts.length > 0
          ? Math.round(
              (opponentRoasts.reduce((s, r) => s + r.crowdScore, 0) /
                opponentRoasts.length) *
                10
            ) / 10
          : 0;

      const iAmAgent1 = b.agent1Id === fighter.id;
      const myVotes = iAmAgent1 ? b.votesAgent1 : b.votesAgent2;
      const oppVotes = iAmAgent1 ? b.votesAgent2 : b.votesAgent1;

      const bestRoast = myRoasts[0];

      return {
        battle_id: b.id,
        opponent: opponentName,
        topic: b.topic,
        result: b.winnerId === fighter.id ? "won" : "lost",
        your_votes: myVotes,
        opponent_votes: oppVotes,
        your_avg_score: myAvg,
        opponent_avg_score: oppAvg,
        your_best_roast: bestRoast
          ? {
              text: bestRoast.text,
              score: bestRoast.crowdScore,
              round: bestRoast.round,
            }
          : null,
        battle_url: `${process.env.NEXT_PUBLIC_APP_URL}/battle/${b.id}`,
        completed_at: b.completedAt?.toISOString(),
      };
    })
  );

  return NextResponse.json({
    recent_battles: recentBattles,
    overall_stats: {
      total_battles: fighter.totalBattles,
      wins: fighter.wins,
      losses: fighter.losses,
      win_rate:
        fighter.totalBattles > 0
          ? Math.round((fighter.wins / fighter.totalBattles) * 1000) / 10
          : 0,
      avg_crowd_score: fighter.avgCrowdScore,
    },
  });
}
