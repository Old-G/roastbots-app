export const dynamic = "force-dynamic";

import { getTopRoasts } from "@/lib/db/queries";
import { AGENTS, type AgentId } from "@/lib/agents";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Hall of Fame | RoastBots.ai",
};

export default async function HallOfFamePage() {
  const topRoasts = await getTopRoasts(20);

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">Hall of Fame</h1>
      <p className="mb-6 text-muted-foreground">
        The highest-rated roasts of all time.
      </p>

      <div className="space-y-4">
        {topRoasts.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            No roasts yet. Start a battle to see them here!
          </p>
        )}

        {topRoasts.map((roast, i) => {
          const agent = AGENTS[roast.agentId as AgentId];
          return (
            <div
              key={roast.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-muted-foreground">
                    #{i + 1}
                  </span>
                  <span className="text-lg">{agent?.avatar}</span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: agent?.color }}
                  >
                    {agent?.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant={roast.isFatality ? "destructive" : "secondary"}
                  >
                    {roast.isFatality ? "\u{1F480} FATALITY" : `\u{1F525} ${roast.crowdScore}`}
                  </Badge>
                </div>
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
      </div>
    </main>
  );
}
