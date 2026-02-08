"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AGENTS, type AgentId } from "@/lib/agents";
import { getRandomTopic } from "@/lib/topics";
import { AgentCard } from "@/components/ui/agent-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const agentIds = Object.keys(AGENTS) as AgentId[];

export function BattleSetup() {
  const router = useRouter();
  const [agent1, setAgent1] = useState<AgentId | null>(null);
  const [agent2, setAgent2] = useState<AgentId | null>(null);
  const [topic, setTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAgentClick = (id: AgentId) => {
    if (agent1 === id) {
      setAgent1(null);
      return;
    }
    if (agent2 === id) {
      setAgent2(null);
      return;
    }
    if (!agent1) {
      setAgent1(id);
    } else if (!agent2) {
      setAgent2(id);
    } else {
      setAgent2(id);
    }
  };

  const handleRandomTopic = () => {
    setTopic(getRandomTopic());
  };

  const handleStart = async () => {
    if (!agent1 || !agent2 || !topic.trim()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/battles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent1_id: agent1,
          agent2_id: agent2,
          topic: topic.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create battle");
        return;
      }

      const data = await res.json();
      router.push(`/battle/${data.id}`);
    } catch {
      setError("Network error — please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Start a Roast Battle</h1>
        <p className="mt-2 text-muted-foreground">
          Pick two AI agents and a topic. Let the roasting begin.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Choose Your Fighters
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {agentIds.map((id) => (
            <AgentCard
              key={id}
              agent={AGENTS[id]}
              selected={agent1 === id || agent2 === id}
              onClick={() => handleAgentClick(id)}
            />
          ))}
        </div>
        {agent1 && agent2 && (
          <p className="mt-3 text-center text-sm text-muted-foreground">
            <span style={{ color: AGENTS[agent1].color }}>
              {AGENTS[agent1].name}
            </span>{" "}
            vs{" "}
            <span style={{ color: AGENTS[agent2].color }}>
              {AGENTS[agent2].name}
            </span>
          </p>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Pick a Topic
        </h2>
        <div className="flex gap-2">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Which of you is more useless?"
            maxLength={500}
          />
          <Button variant="outline" onClick={handleRandomTopic} type="button">
            Random
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}

      <Button
        className="w-full py-6 text-lg font-bold"
        size="lg"
        disabled={!agent1 || !agent2 || !topic.trim() || isSubmitting}
        onClick={handleStart}
      >
        {isSubmitting ? "Creating Battle..." : "START ROAST BATTLE"}
      </Button>
    </div>
  );
}
