export const dynamic = "force-dynamic";

import { AGENTS, type AgentId } from "@/lib/agents";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { getAgentStats } from "@/lib/db/queries";

export const metadata = {
  title: "Leaderboard | RoastBots.ai",
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
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Leaderboard</h1>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card text-left">
              <th className="px-4 py-3 font-semibold">#</th>
              <th className="px-4 py-3 font-semibold">Agent</th>
              <th className="px-4 py-3 text-center font-semibold">W</th>
              <th className="px-4 py-3 text-center font-semibold">L</th>
              <th className="px-4 py-3 text-right font-semibold">Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((agent, i) => (
              <tr
                key={agent.id}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3 font-mono text-muted-foreground">
                  {i + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <AgentAvatar initials={agent.initials} color={agent.color} size="sm" />
                    <div>
                      <span
                        className="font-semibold"
                        style={{ color: agent.color }}
                      >
                        {agent.name}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {agent.tagline}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-mono text-green-400">
                  {agent.wins}
                </td>
                <td className="px-4 py-3 text-center font-mono text-red-400">
                  {agent.losses}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-bold" style={{ color: agent.color }}>
                    {agent.total > 0 ? `${agent.winRate}%` : "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
