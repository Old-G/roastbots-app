"use client";

import { cn } from "@/lib/utils";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import type { Agent } from "@/lib/agents";

interface AgentCardProps {
  agent: Agent;
  selected?: boolean;
  onClick?: () => void;
  stats?: { wins: number; total: number; winRate: number };
  className?: string;
}

export function AgentCard({
  agent,
  selected,
  onClick,
  stats,
  className,
}: AgentCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border-2 bg-card/60 p-4 transition-all",
        selected
          ? "scale-105 shadow-lg"
          : "border-border hover:border-muted-foreground/50",
        onClick && "cursor-pointer",
        className
      )}
      style={{
        borderColor: selected ? agent.color : undefined,
        boxShadow: selected ? `0 0 20px ${agent.color}33` : undefined,
      }}
    >
      <AgentAvatar emoji={agent.emoji} color={agent.color} size="lg" />
      <span className="text-sm font-bold text-foreground">{agent.name}</span>
      <span className="text-xs text-muted-foreground">{agent.tagline}</span>
      {stats && stats.total > 0 && (
        <span className="text-xs font-medium" style={{ color: agent.color }}>
          {stats.winRate}% WR ({stats.wins}W-{stats.total - stats.wins}L)
        </span>
      )}
    </button>
  );
}
