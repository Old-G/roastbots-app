import type { Agent } from "@/lib/agents";
import { cn } from "@/lib/utils";

interface BattleHeaderProps {
  agent1: Agent;
  agent2: Agent;
  topic: string;
  className?: string;
}

export function BattleHeader({
  agent1,
  agent2,
  topic,
  className,
}: BattleHeaderProps) {
  return (
    <div className={cn("text-center", className)}>
      <div className="flex items-center justify-center gap-4 py-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-4xl">{agent1.avatar}</span>
          <span className="text-sm font-bold" style={{ color: agent1.color }}>
            {agent1.name}
          </span>
        </div>
        <span className="text-2xl font-black text-muted-foreground">VS</span>
        <div className="flex flex-col items-center gap-1">
          <span className="text-4xl">{agent2.avatar}</span>
          <span className="text-sm font-bold" style={{ color: agent2.color }}>
            {agent2.name}
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Topic: <span className="font-medium text-foreground">{topic}</span>
      </p>
    </div>
  );
}
