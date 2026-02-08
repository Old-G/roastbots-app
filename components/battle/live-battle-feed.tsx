"use client";

import { useEffect, useRef } from "react";
import { BattleProvider, useBattle, type Roast } from "./battle-context";
import { BattleHeader } from "./battle-header";
import { RoastBubble } from "./roast-bubble";
import { VotePanel } from "./vote-panel";
import { ShareCard } from "./share-card";
import { LiveBadge } from "@/components/ui/live-badge";
import { AGENTS, type AgentId } from "@/lib/agents";
import { AgentAvatar } from "@/components/ui/agent-avatar";

interface LiveBattleFeedProps {
  battleId: string;
  agent1Id: AgentId;
  agent2Id: AgentId;
  topic: string;
}

export function LiveBattleFeed(props: LiveBattleFeedProps) {
  return (
    <BattleProvider
      battleId={props.battleId}
      topic={props.topic}
      agent1Id={props.agent1Id}
      agent2Id={props.agent2Id}
    >
      <LiveBattleFeedInner />
    </BattleProvider>
  );
}

function LiveBattleFeedInner() {
  const { state, actions, meta } = useBattle();
  const feedRef = useRef<HTMLDivElement>(null);
  const streamingTextRef = useRef("");

  useEffect(() => {
    const eventSource = new EventSource(
      `/api/battles/${meta.battleId}/stream`
    );

    eventSource.addEventListener("roast_start", (e) => {
      const data = JSON.parse(e.data);
      actions.setCurrentAgent(data.agent_id as AgentId);
      actions.setThinkingAgent(null);
      actions.setStreaming(true);
      streamingTextRef.current = "";
      actions.setStreamingText("");
    });

    eventSource.addEventListener("roast_delta", (e) => {
      const data = JSON.parse(e.data);
      streamingTextRef.current += data.text;
      actions.setStreamingText(streamingTextRef.current);
    });

    eventSource.addEventListener("roast_complete", (e) => {
      const data = JSON.parse(e.data);
      actions.addRoast({
        id: data.roast_id,
        agentId: data.agent_id as AgentId,
        round: data.round,
        text: data.text,
        crowdScore: data.crowd_score,
        isFatality: data.is_fatality,
      });
      actions.setStreaming(false);
      actions.setCurrentAgent(null);
    });

    eventSource.addEventListener("thinking", (e) => {
      const data = JSON.parse(e.data);
      actions.setThinkingAgent(data.agent_id as AgentId);
    });

    eventSource.addEventListener("battle_complete", (e) => {
      const data = JSON.parse(e.data);
      actions.setComplete(data.winner_id ?? null);
      eventSource.close();
    });

    eventSource.addEventListener("error", () => {
      eventSource.close();
    });

    return () => eventSource.close();
  }, [meta.battleId, actions]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [state.roasts, state.currentStreamingText, state.thinkingAgent]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <LiveBadge />
      </div>

      <BattleHeader
        agent1={meta.agent1}
        agent2={meta.agent2}
        topic={meta.topic}
      />

      <div
        ref={feedRef}
        className="space-y-4 overflow-y-auto rounded-xl border border-border bg-background/50 p-4"
        style={{ maxHeight: "60vh" }}
      >
        {state.roasts.map((roast) => (
          <RoastBubble
            key={roast.id}
            agentId={roast.agentId}
            text={roast.text}
            crowdScore={roast.crowdScore}
            isFatality={roast.isFatality}
            side={roast.agentId === meta.agent1.id ? "left" : "right"}
          />
        ))}

        {state.isStreaming && state.currentAgentId && (
          <RoastBubble
            agentId={state.currentAgentId}
            text={state.currentStreamingText}
            isStreaming
            side={state.currentAgentId === meta.agent1.id ? "left" : "right"}
          />
        )}

        {state.thinkingAgent && !state.isStreaming && (
          <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
            <AgentAvatar initials={AGENTS[state.thinkingAgent].initials} color={AGENTS[state.thinkingAgent].color} size="sm" />
            <span>
              {AGENTS[state.thinkingAgent].name} is preparing a response...
            </span>
            <span className="inline-flex gap-0.5">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                style={{ animationDelay: "0.1s" }}
              />
              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                style={{ animationDelay: "0.2s" }}
              />
            </span>
          </div>
        )}
      </div>

      <VotePanel />
      <ShareCard />
    </div>
  );
}
