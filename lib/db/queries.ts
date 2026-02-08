import { eq, desc, sql, and } from "drizzle-orm";
import { db } from "./index";
import { battles, roasts, votes, fighters } from "./schema";

export async function getBattle(id: string) {
  return db.query.battles.findFirst({
    where: eq(battles.id, id),
  });
}

export async function getBattleWithRoasts(id: string) {
  const battle = await db.query.battles.findFirst({
    where: eq(battles.id, id),
  });
  if (!battle) return null;

  const battleRoasts = await db.query.roasts.findMany({
    where: eq(roasts.battleId, id),
    orderBy: [roasts.round, roasts.createdAt],
  });

  return { ...battle, roasts: battleRoasts };
}

export async function saveBattle(data: {
  id: string;
  agent1Id: string;
  agent2Id: string;
  topic: string;
}) {
  const [battle] = await db
    .insert(battles)
    .values({
      ...data,
      status: "in_progress",
    })
    .returning();
  return battle;
}

export async function saveRoast(data: {
  id: string;
  battleId: string;
  agentId: string;
  round: number;
  text: string;
  crowdScore: number;
  isFatality: boolean;
}) {
  const [roast] = await db.insert(roasts).values(data).returning();
  return roast;
}

export async function markBattleStreaming(id: string) {
  await db
    .update(battles)
    .set({ status: "streaming" })
    .where(eq(battles.id, id));
}

export async function markBattleComplete(id: string) {
  const battleRoasts = await db.query.roasts.findMany({
    where: eq(roasts.battleId, id),
  });

  const battle = await getBattle(id);
  if (!battle) return;

  let agent1Score = 0;
  let agent2Score = 0;
  for (const roast of battleRoasts) {
    if (roast.agentId === battle.agent1Id) {
      agent1Score += roast.crowdScore;
    } else {
      agent2Score += roast.crowdScore;
    }
  }

  const winnerId =
    agent1Score > agent2Score
      ? battle.agent1Id
      : agent1Score < agent2Score
        ? battle.agent2Id
        : null;

  await db
    .update(battles)
    .set({
      status: "completed",
      winnerId,
      completedAt: new Date(),
    })
    .where(eq(battles.id, id));

  // Update fighter stats for any participant that is a fighter (ftr_ prefix)
  const isFighter = (agentId: string) => agentId.startsWith("ftr_");
  const participantIds = [battle.agent1Id, battle.agent2Id].filter(isFighter);

  for (const fighterId of participantIds) {
    const fighterRoasts = battleRoasts.filter((r) => r.agentId === fighterId);
    const avgScore =
      fighterRoasts.length > 0
        ? fighterRoasts.reduce((sum, r) => sum + r.crowdScore, 0) /
          fighterRoasts.length
        : 0;

    const isWinner = winnerId === fighterId;
    const isDraw = winnerId === null;

    await db
      .update(fighters)
      .set({
        totalBattles: sql`${fighters.totalBattles} + 1`,
        wins: isWinner ? sql`${fighters.wins} + 1` : fighters.wins,
        losses: !isWinner && !isDraw ? sql`${fighters.losses} + 1` : fighters.losses,
        avgCrowdScore: sql`CASE
          WHEN ${fighters.totalBattles} = 0 THEN ${avgScore}
          ELSE round(((${fighters.avgCrowdScore} * ${fighters.totalBattles}) + ${avgScore}) / (${fighters.totalBattles} + 1))
        END`,
      })
      .where(eq(fighters.id, fighterId));
  }
}

export async function castVote(
  battleId: string,
  agentId: string,
  fingerprint: string
) {
  await db.insert(votes).values({
    battleId,
    votedForAgentId: agentId,
    voterFingerprint: fingerprint,
  });

  const battle = await getBattle(battleId);
  if (!battle) return null;

  const isAgent1 = agentId === battle.agent1Id;
  await db
    .update(battles)
    .set(
      isAgent1
        ? { votesAgent1: sql`${battles.votesAgent1} + 1` }
        : { votesAgent2: sql`${battles.votesAgent2} + 1` }
    )
    .where(eq(battles.id, battleId));

  return getBattle(battleId);
}

export async function getActiveBattles() {
  return db.query.battles.findMany({
    where: eq(battles.status, "in_progress"),
    orderBy: desc(battles.createdAt),
  });
}

export async function getCompletedBattles(limit = 20) {
  return db.query.battles.findMany({
    where: eq(battles.status, "completed"),
    orderBy: desc(battles.completedAt),
    limit,
  });
}

export async function getFeaturedBattle() {
  return db.query.battles.findFirst({
    where: and(
      eq(battles.status, "completed"),
      eq(battles.isFeatured, true)
    ),
    orderBy: desc(battles.completedAt),
  });
}

export async function getAgentStats() {
  const result = await db
    .select({
      agentId: battles.winnerId,
      wins: sql<number>`count(*)::int`,
    })
    .from(battles)
    .where(eq(battles.status, "completed"))
    .groupBy(battles.winnerId);

  const totalBattles = await db
    .select({
      agentId: sql<string>`agent_id`,
      total: sql<number>`count(*)::int`,
    })
    .from(
      sql`(
        SELECT agent1_id AS agent_id FROM battles WHERE status = 'completed'
        UNION ALL
        SELECT agent2_id AS agent_id FROM battles WHERE status = 'completed'
      ) AS all_agents`
    )
    .groupBy(sql`agent_id`);

  return { wins: result, totalBattles };
}

export async function getPlatformStats() {
  const [battleStats] = await db
    .select({
      totalBattles: sql<number>`count(*)::int`,
    })
    .from(battles)
    .where(eq(battles.status, "completed"));

  const [roastStats] = await db
    .select({
      totalRoasts: sql<number>`count(*)::int`,
      totalFatalities: sql<number>`count(*) filter (where is_fatality = true)::int`,
      avgScore: sql<number>`round(avg(crowd_score))::int`,
    })
    .from(roasts);

  const [voteStats] = await db
    .select({
      totalVotes: sql<number>`count(*)::int`,
    })
    .from(votes);

  const [fighterStats] = await db
    .select({
      totalFighters: sql<number>`count(*)::int`,
    })
    .from(fighters);

  return {
    totalBattles: battleStats?.totalBattles ?? 0,
    totalRoasts: roastStats?.totalRoasts ?? 0,
    totalFatalities: roastStats?.totalFatalities ?? 0,
    avgScore: roastStats?.avgScore ?? 0,
    totalVotes: voteStats?.totalVotes ?? 0,
    totalFighters: fighterStats?.totalFighters ?? 0,
  };
}

export async function getTopRoasts(limit = 20) {
  return db.query.roasts.findMany({
    orderBy: desc(roasts.crowdScore),
    limit,
  });
}
