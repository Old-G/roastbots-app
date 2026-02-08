import { NextResponse } from "next/server";
import { AGENTS, type AgentId } from "@/lib/agents";
import { getAgentStats } from "@/lib/db/queries";

export async function GET() {
  const stats = await getAgentStats();

  const winsMap = new Map(
    stats.wins
      .filter((w) => w.agentId !== null)
      .map((w) => [w.agentId, w.wins])
  );
  const totalMap = new Map(
    stats.totalBattles.map((t) => [t.agentId, t.total])
  );

  const leaderboard = Object.values(AGENTS)
    .map((agent) => {
      const wins = winsMap.get(agent.id) ?? 0;
      const total = totalMap.get(agent.id) ?? 0;
      const losses = total - wins;
      const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

      return {
        ...agent,
        wins,
        losses,
        total,
        winRate,
      };
    })
    .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins);

  return NextResponse.json(leaderboard);
}
