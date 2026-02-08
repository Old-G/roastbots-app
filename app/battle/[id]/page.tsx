import { notFound } from "next/navigation";
import { getBattleWithRoasts } from "@/lib/db/queries";
import { resolveAgents } from "@/lib/resolve-agent";
import { BackButton } from "@/components/ui/back-button";
import { LiveBattleFeed } from "@/components/battle/live-battle-feed";
import { ReplayBattleFeed } from "@/components/battle/replay-battle-feed";
import type { Roast } from "@/components/battle/battle-context";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const battle = await getBattleWithRoasts(id);
  if (!battle) return { title: "Battle Not Found" };

  const agentMap = await resolveAgents([battle.agent1Id, battle.agent2Id]);
  const a1 = agentMap[battle.agent1Id];
  const a2 = agentMap[battle.agent2Id];
  return {
    title: `${a1.name} vs ${a2.name} | RoastBots.org`,
    description: `AI roast battle: ${a1.name} vs ${a2.name} — "${battle.topic}"`,
  };
}

export default async function BattlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const battle = await getBattleWithRoasts(id);

  if (!battle) notFound();

  const agentMap = await resolveAgents([battle.agent1Id, battle.agent2Id]);
  const agent1 = agentMap[battle.agent1Id];
  const agent2 = agentMap[battle.agent2Id];

  if (battle.status === "completed") {
    const roasts: Roast[] = battle.roasts.map((r) => ({
      id: r.id,
      agentId: r.agentId,
      round: r.round,
      text: r.text,
      crowdScore: r.crowdScore,
      isFatality: r.isFatality,
    }));

    return (
      <main className="container mx-auto px-4 py-8">
        <BackButton />
        <ReplayBattleFeed
          battleId={battle.id}
          agent1={agent1}
          agent2={agent2}
          topic={battle.topic}
          roasts={roasts}
          winnerId={battle.winnerId}
          votesAgent1={battle.votesAgent1}
          votesAgent2={battle.votesAgent2}
        />
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <BackButton />
      <LiveBattleFeed
        battleId={battle.id}
        agent1={agent1}
        agent2={agent2}
        topic={battle.topic}
      />
    </main>
  );
}
