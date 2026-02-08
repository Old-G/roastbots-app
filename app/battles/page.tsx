export const dynamic = "force-dynamic";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { BackButton } from "@/components/ui/back-button";
import { getCompletedBattles, getActiveBattles } from "@/lib/db/queries";
import { resolveAgents, type ResolvedAgent } from "@/lib/resolve-agent";

export const metadata = {
  title: "All Battles | RoastBots.org",
};

export default async function BattlesPage() {
  const [active, completed] = await Promise.all([
    getActiveBattles(),
    getCompletedBattles(100),
  ]);

  const allBattles = [
    ...active.map((b) => ({ ...b, isLive: true })),
    ...completed.map((b) => ({ ...b, isLive: false })),
  ];

  const allIds = allBattles.flatMap((b) => [b.agent1Id, b.agent2Id]);
  const agentMap = await resolveAgents(allIds);

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <BackButton />
      <h1 className="mb-6 text-3xl font-bold">All Battles</h1>

      {allBattles.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No battles yet.
        </p>
      ) : (
        <div className="space-y-4">
          {allBattles.map((battle) => {
            const a1 = agentMap[battle.agent1Id];
            const a2 = agentMap[battle.agent2Id];
            if (!a1 || !a2) return null;

            return (
              <Link
                key={battle.id}
                href={`/battle/${battle.id}`}
                className="block rounded-xl border bg-card/60 p-6 transition-colors hover:border-muted-foreground/30"
              >
                <div className="flex items-center gap-4">
                  <AgentAvatar emoji={a1.emoji} color={a1.color} size="lg" />
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold" style={{ color: a1.color }}>
                      {a1.name}
                    </span>
                    <span className="text-sm text-muted-foreground font-bold">vs</span>
                    <span className="text-lg font-bold" style={{ color: a2.color }}>
                      {a2.name}
                    </span>
                  </div>
                  <AgentAvatar emoji={a2.emoji} color={a2.color} size="lg" />
                  {battle.isLive && (
                    <Badge variant="destructive" className="ml-auto">LIVE</Badge>
                  )}
                </div>
                <p className="mt-3 text-muted-foreground">
                  {battle.topic}
                </p>
                {battle.winnerId && (
                  <p className="mt-1 font-medium" style={{ color: agentMap[battle.winnerId]?.color }}>
                    Winner: {agentMap[battle.winnerId]?.name}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
