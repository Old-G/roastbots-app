"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { useBattle } from "./battle-context";
import { cn } from "@/lib/utils";

export function VotePanel() {
  const { state, actions, meta } = useBattle();
  const [isVoting, setIsVoting] = useState(false);

  if (!state.isComplete) return null;

  const agents = [meta.agent1, meta.agent2] as const;
  const judgeWinner = state.winner
    ? agents.find((a) => a.id === state.winner)
    : null;

  const handleVote = async (agentId: string) => {
    if (state.votedFor || isVoting) return;
    setIsVoting(true);

    try {
      const res = await fetch(`/api/battles/${meta.battleId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voted_for: agentId,
          fingerprint: await getFingerprint(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 409) {
          // Already voted — still show results
        } else {
          console.error("Vote failed:", data.error);
          return;
        }
      }

      const data = await res.json();
      if (data.results) {
        actions.setVote(agentId, data.results, data.winner);
      }
    } catch (err) {
      console.error("Vote error:", err);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Judge verdict */}
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          AI Judge Verdict
        </p>
        <h3 className="text-lg font-bold">
          {judgeWinner ? (
            <>
              <span style={{ color: judgeWinner.color }}>
                {judgeWinner.name}
              </span>{" "}
              wins!
            </>
          ) : (
            "Draw!"
          )}
        </h3>
      </div>

      {/* Community vote */}
      <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
        <h3 className="text-sm font-bold">
          {state.votedFor ? "Community Vote" : "Who do you think won?"}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {agents.map((agent) => {
            const result = state.voteResults?.[agent.id];
            const isVotedFor = state.votedFor === agent.id;

            return (
              <div key={agent.id} className="space-y-2">
                <Button
                  variant="outline"
                  className={cn(
                    "h-auto w-full flex-col gap-1 py-4 transition-all",
                    isVotedFor && "ring-2",
                    !state.votedFor && "hover:brightness-110"
                  )}
                  style={{
                    backgroundColor: state.votedFor ? undefined : `${agent.color}20`,
                    borderColor: agent.color,
                    color: agent.color,
                    ...(isVotedFor
                      ? ({ "--tw-ring-color": agent.color } as React.CSSProperties)
                      : {}),
                  }}
                  onClick={() => handleVote(agent.id)}
                  disabled={!!state.votedFor || isVoting}
                >
                  <AgentAvatar
                    emoji={agent.emoji}
                    color={agent.color}
                    size="md"
                  />
                  <span className="text-sm font-bold">{agent.name}</span>
                </Button>

                {state.votedFor && result && (
                  <div className="space-y-1">
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${result.percentage}%`,
                          backgroundColor: agent.color,
                        }}
                      />
                    </div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: agent.color }}
                    >
                      {result.percentage}% ({result.votes} votes)
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

async function getFingerprint(): Promise<string> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("roastbots", 2, 2);
  }
  const dataUrl = canvas.toDataURL();
  const ua = navigator.userAgent;
  const raw = `${ua}-${dataUrl}-${screen.width}x${screen.height}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
