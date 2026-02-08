"use client";

import { cn } from "@/lib/utils";
import { useBattle } from "./battle-context";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Badge } from "@/components/ui/badge";

interface RoastBubbleProps {
  agentId: string;
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
  const { meta } = useBattle();
  const agent = meta.getAgent(agentId);

  return (
    <div
      className={cn(
        "flex w-full gap-3",
        side === "right" && "flex-row-reverse"
      )}
    >
      <div className="flex-shrink-0 pt-1">
        <AgentAvatar initials={agent.initials} color={agent.color} size="sm" />
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
              {isFatality ? "FATAL " : crowdScore >= 85 ? "FIRE " : ""}
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
