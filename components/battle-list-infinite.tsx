"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { useInfiniteScroll } from "@/lib/use-infinite-scroll";
import type { ResolvedAgent } from "@/lib/resolve-agent";

interface Battle {
  id: string;
  agent1Id: string;
  agent2Id: string;
  topic: string;
  winnerId: string | null;
  isLive: boolean;
}

interface BattleListInfiniteProps {
  initialBattles: Battle[];
  initialAgents: Record<string, ResolvedAgent>;
  initialCursor: string | null;
}

export function BattleListInfinite({
  initialBattles,
  initialAgents,
  initialCursor,
}: BattleListInfiniteProps) {
  const [agentMap, setAgentMap] = useState(initialAgents);

  const getItems = useCallback(
    (data: unknown) => {
      const d = data as { battles: Battle[]; active: Battle[] };
      return [...(d.active ?? []), ...d.battles];
    },
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

  const { items, loading, hasMore, sentinelRef } = useInfiniteScroll<Battle>({
    url: "/api/battles",
    initialItems: initialBattles,
    initialCursor,
    getItems,
    getCursor,
    onPageLoaded,
  });

  return (
    <div className="space-y-4">
      {items.map((battle) => {
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
            {battle.winnerId && agentMap[battle.winnerId] && (
              <p className="mt-1 font-medium" style={{ color: agentMap[battle.winnerId]?.color }}>
                Winner: {agentMap[battle.winnerId]?.name}
              </p>
            )}
          </Link>
        );
      })}

      <div ref={sentinelRef} className="py-4 text-center">
        {loading && (
          <p className="text-sm text-muted-foreground">Loading more...</p>
        )}
        {!hasMore && items.length > 0 && (
          <p className="text-sm text-muted-foreground">No more battles</p>
        )}
      </div>
    </div>
  );
}
