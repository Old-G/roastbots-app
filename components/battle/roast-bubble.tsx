"use client";

import { cn } from "@/lib/utils";
import { AGENTS, type AgentId } from "@/lib/agents";
import { Badge } from "@/components/ui/badge";

interface RoastBubbleProps {
  agentId: AgentId;
  text: string;
  crowdScore?: number;
  isFatality?: boolean;
  isStreaming?: boolean;
  side: "left" | "right";
}

export function RoastBubble({
  agentId,
  text,
  crowdScore,
  isFatality,
  isStreaming,
  side,
}: RoastBubbleProps) {
  const agent = AGENTS[agentId];

  return (
    <div
      className={cn(
        "flex w-full gap-3",
        side === "right" && "flex-row-reverse"
      )}
    >
      <div className="flex-shrink-0 pt-1">
        <span className="text-2xl">{agent.avatar}</span>
      </div>
      <div
        className={cn("max-w-[80%] space-y-1", side === "right" && "text-right")}
      >
        <span
          className="text-xs font-semibold"
          style={{ color: agent.color }}
        >
          {agent.name}
        </span>
        <div
          className={cn(
            "rounded-xl bg-card px-4 py-3 text-sm leading-relaxed",
            side === "left" ? "border-l-2 rounded-tl-none" : "border-r-2 rounded-tr-none"
          )}
          style={{
            borderColor: agent.color,
          }}
        >
          <p className="whitespace-pre-wrap text-foreground">
            {text}
            {isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-foreground" />
            )}
          </p>
        </div>
        {crowdScore !== undefined && !isStreaming && (
          <div
            className={cn(
              "flex items-center gap-1.5",
              side === "right" && "justify-end"
            )}
          >
            <Badge
              variant="secondary"
              className="text-xs"
              style={
                crowdScore >= 85
                  ? { backgroundColor: `${agent.color}20`, color: agent.color }
                  : undefined
              }
            >
              {isFatality ? "\u{1F480}" : crowdScore >= 85 ? "\u{1F525}" : "\u{1F3A4}"}{" "}
              {crowdScore}
            </Badge>
            {isFatality && (
              <Badge variant="destructive" className="text-xs">
                FATALITY
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
