"use client";

import { useCallback, useState } from "react";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Badge } from "@/components/ui/badge";
import { useInfiniteScroll } from "@/lib/use-infinite-scroll";
import type { ResolvedAgent } from "@/lib/resolve-agent";

interface Roast {
  id: string;
  battleId: string;
  agentId: string;
  round: number;
  text: string;
  crowdScore: number;
  isFatality: boolean;
}

interface RoastListInfiniteProps {
  initialRoasts: Roast[];
  initialAgents: Record<string, ResolvedAgent>;
  initialCursor: string | null;
}

export function RoastListInfinite({
  initialRoasts,
  initialAgents,
  initialCursor,
}: RoastListInfiniteProps) {
  const [agentMap, setAgentMap] = useState(initialAgents);
  const [startIndex] = useState(0);

  const getItems = useCallback(
    (data: unknown) => (data as { roasts: Roast[] }).roasts,
    []
  );
  const getCursor = useCallback(
    (data: unknown) => (data as { nextCursor: string | null }).nextCursor,
    []
  );
  const onPageLoaded = useCallback(
    (data: unknown) => {
      const d = data as { agents: Record<string, ResolvedAgent> };
      if (d.agents) {
        setAgentMap((prev) => ({ ...prev, ...d.agents }));
      }
    },
    []
  );

  const { items, loading, hasMore, sentinelRef } = useInfiniteScroll<Roast>({
    url: "/api/hall-of-fame",
    initialItems: initialRoasts,
    initialCursor,
    getItems,
    getCursor,
    onPageLoaded,
  });

  return (
    <div className="space-y-4">
      {items.map((roast, i) => {
        const agent = agentMap[roast.agentId];
        return (
          <div
            key={roast.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-muted-foreground">
                  #{startIndex + i + 1}
                </span>
                {agent && (
                  <AgentAvatar emoji={agent.emoji} color={agent.color} size="sm" />
                )}
                <span
                  className="text-sm font-bold"
                  style={{ color: agent?.color }}
                >
                  {agent?.name}
                </span>
              </div>
              <Badge
                variant={roast.isFatality ? "destructive" : "secondary"}
              >
                {roast.isFatality ? "FATALITY" : `FIRE ${roast.crowdScore}`}
              </Badge>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {roast.text}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Round {roast.round}</span>
              <a
                href={`/battle/${roast.battleId}`}
                className="text-primary hover:underline"
              >
                View Battle
              </a>
            </div>
          </div>
        );
      })}

      <div ref={sentinelRef} className="py-4 text-center">
        {loading && (
          <p className="text-sm text-muted-foreground">Loading more...</p>
        )}
        {!hasMore && items.length > 0 && (
          <p className="text-sm text-muted-foreground">No more roasts</p>
        )}
      </div>
    </div>
  );
}
