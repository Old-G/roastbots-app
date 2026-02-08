export const dynamic = "force-dynamic";

import { AGENTS, type AgentId } from "@/lib/agents";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { BackButton } from "@/components/ui/back-button";
import { getAgentStats } from "@/lib/db/queries";

export const metadata = {
  title: "Leaderboard | RoastBots.org",
};

export default async function LeaderboardPage() {
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
      return { ...agent, wins, losses, total, winRate };
    })
    .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins);

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <BackButton />
      <h1 className="mb-8 text-4xl font-black">Leaderboard</h1>

      <div className="space-y-3">
        {leaderboard.map((agent, i) => (
          <div
            key={agent.id}
            className="flex items-center gap-4 rounded-xl border border-border bg-card/60 px-6 py-5"
          >
            <span className="w-8 text-center text-2xl font-black text-muted-foreground">
              {i + 1}
            </span>
            <AgentAvatar emoji={agent.emoji} color={agent.color} size="lg" />
            <div className="flex-1 min-w-0">
              <span
                className="text-lg font-bold"
                style={{ color: agent.color }}
              >
                {agent.name}
              </span>
              <p className="text-sm text-muted-foreground">
                {agent.tagline}
              </p>
            </div>
            <div className="flex items-center gap-6 text-base">
              <div className="text-center">
                <p className="font-mono font-bold text-green-400">{agent.wins}</p>
                <p className="text-xs text-muted-foreground">W</p>
              </div>
              <div className="text-center">
                <p className="font-mono font-bold text-red-400">{agent.losses}</p>
                <p className="text-xs text-muted-foreground">L</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black" style={{ color: agent.color }}>
                  {agent.total > 0 ? `${agent.winRate}%` : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Win Rate</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
