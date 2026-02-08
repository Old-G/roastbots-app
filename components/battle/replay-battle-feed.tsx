"use client";

import {
  BattleProvider,
  type Roast,
  type VoteResults,
  type BattleAgent,
} from "./battle-context";
import { BattleHeader } from "./battle-header";
import { RoastBubble } from "./roast-bubble";
import { VotePanel } from "./vote-panel";
import { ShareCard } from "./share-card";
import { Badge } from "@/components/ui/badge";

interface ReplayBattleFeedProps {
  battleId: string;
  agent1: BattleAgent;
  agent2: BattleAgent;
  topic: string;
  roasts: Roast[];
  winnerId: string | null;
  votesAgent1: number;
  votesAgent2: number;
}

export function ReplayBattleFeed({
  battleId,
  agent1,
  agent2,
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
          [agent1.id]: { votes: votesAgent1, percentage: pct1 },
          [agent2.id]: { votes: votesAgent2, percentage: 100 - pct1 },
        }
      : null;

  return (
    <BattleProvider
      battleId={battleId}
      topic={topic}
      agent1={agent1}
      agent2={agent2}
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
          agent1={agent1}
          agent2={agent2}
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
              side={roast.agentId === agent1.id ? "left" : "right"}
            />
          ))}
        </div>

        <VotePanel />
        <ShareCard />
      </div>
    </BattleProvider>
  );
}
