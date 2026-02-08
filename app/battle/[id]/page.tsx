import { notFound } from "next/navigation";
import { getBattleWithRoasts } from "@/lib/db/queries";
import { AGENTS, type AgentId } from "@/lib/agents";
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

  const a1 = AGENTS[battle.agent1Id as AgentId];
  const a2 = AGENTS[battle.agent2Id as AgentId];
  return {
    title: `${a1.name} vs ${a2.name} | RoastBots.ai`,
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

  const agent1Id = battle.agent1Id as AgentId;
  const agent2Id = battle.agent2Id as AgentId;

  if (battle.status === "completed") {
    const roasts: Roast[] = battle.roasts.map((r) => ({
      id: r.id,
      agentId: r.agentId as AgentId,
      round: r.round,
      text: r.text,
      crowdScore: r.crowdScore,
      isFatality: r.isFatality,
    }));

    return (
      <main className="container mx-auto px-4 py-8">
        <ReplayBattleFeed
          battleId={battle.id}
          agent1Id={agent1Id}
          agent2Id={agent2Id}
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
      <LiveBattleFeed
        battleId={battle.id}
        agent1Id={agent1Id}
        agent2Id={agent2Id}
        topic={battle.topic}
      />
    </main>
  );
}
