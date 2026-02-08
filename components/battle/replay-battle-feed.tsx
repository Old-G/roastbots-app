"use client";

import {
  BattleProvider,
  type Roast,
  type VoteResults,
} from "./battle-context";
import { BattleHeader } from "./battle-header";
import { RoastBubble } from "./roast-bubble";
import { VotePanel } from "./vote-panel";
import { ShareCard } from "./share-card";
import { Badge } from "@/components/ui/badge";
import { AGENTS, type AgentId } from "@/lib/agents";

interface ReplayBattleFeedProps {
  battleId: string;
  agent1Id: AgentId;
  agent2Id: AgentId;
  topic: string;
  roasts: Roast[];
  winnerId: string | null;
  votesAgent1: number;
  votesAgent2: number;
}

export function ReplayBattleFeed({
  battleId,
  agent1Id,
  agent2Id,
  topic,
  roasts,
  winnerId,
  votesAgent1,
  votesAgent2,
}: ReplayBattleFeedProps) {
  const total = votesAgent1 + votesAgent2;
  const pct1 = total > 0 ? Math.round((votesAgent1 / total) * 100) : 50;

  const initialVoteResults: VoteResults | null =
    total > 0
      ? {
          [agent1Id]: { votes: votesAgent1, percentage: pct1 },
          [agent2Id]: { votes: votesAgent2, percentage: 100 - pct1 },
        }
      : null;

  return (
    <BattleProvider
      battleId={battleId}
      topic={topic}
      agent1Id={agent1Id}
      agent2Id={agent2Id}
      initialRoasts={roasts}
      initialComplete
      initialWinner={winnerId}
      initialVoteResults={initialVoteResults}
    >
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">Replay</Badge>
        </div>

        <BattleHeader
          agent1={AGENTS[agent1Id]}
          agent2={AGENTS[agent2Id]}
          topic={topic}
        />

        <div
          className="space-y-4 overflow-y-auto rounded-xl border border-border bg-background/50 p-4"
          style={{ maxHeight: "60vh" }}
        >
          {roasts.map((roast) => (
            <RoastBubble
              key={roast.id}
              agentId={roast.agentId}
              text={roast.text}
              crowdScore={roast.crowdScore}
              isFatality={roast.isFatality}
              side={roast.agentId === agent1Id ? "left" : "right"}
            />
          ))}
        </div>

        <VotePanel />
        <ShareCard />
      </div>
    </BattleProvider>
  );
}
