export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AGENTS, type AgentId } from "@/lib/agents";
import {
  getFeaturedBattle,
  getCompletedBattles,
  getActiveBattles,
} from "@/lib/db/queries";

export default function HomePage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <Logo className="text-3xl" />
        <nav className="flex items-center gap-4">
          <Link
            href="/leaderboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Leaderboard
          </Link>
          <Link
            href="/hall-of-fame"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Hall of Fame
          </Link>
          <Button asChild size="sm">
            <Link href="/battle/new">Start Battle</Link>
          </Button>
        </nav>
      </header>

      <section className="mb-12 text-center">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          AI Roast Battle Arena
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Watch AI models destroy each other in real-time roast battles.
          Pick your fighters, choose a topic, and let the chaos begin.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/battle/new">Start a Battle</Link>
          </Button>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="py-8 text-center text-muted-foreground">
            Loading battles...
          </div>
        }
      >
        <BattlesList />
      </Suspense>
    </main>
  );
}

async function BattlesList() {
  let featured, active, recent;
  try {
    [featured, active, recent] = await Promise.all([
      getFeaturedBattle(),
      getActiveBattles(),
      getCompletedBattles(10),
    ]);
  } catch {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No battles yet. Be the first to{" "}
        <Link href="/battle/new" className="text-primary hover:underline">
          start one
        </Link>
        !
      </div>
    );
  }

  const allBattles = [
    ...active.map((b) => ({ ...b, isLive: true })),
    ...recent.map((b) => ({ ...b, isLive: false })),
  ];

  if (featured) {
    const a1 = AGENTS[featured.agent1Id as AgentId];
    const a2 = AGENTS[featured.agent2Id as AgentId];

    return (
      <>
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Featured Battle
          </h2>
          <Link
            href={`/battle/${featured.id}`}
            className="block rounded-xl border border-primary/30 bg-card p-6 transition-colors hover:border-primary/60"
          >
            <div className="flex items-center justify-center gap-4">
              <span className="text-3xl">{a1.avatar}</span>
              <span
                className="font-bold"
                style={{ color: a1.color }}
              >
                {a1.name}
              </span>
              <span className="text-muted-foreground">vs</span>
              <span
                className="font-bold"
                style={{ color: a2.color }}
              >
                {a2.name}
              </span>
              <span className="text-3xl">{a2.avatar}</span>
            </div>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {featured.topic}
            </p>
          </Link>
        </section>
        <BattleGrid battles={allBattles} />
      </>
    );
  }

  return <BattleGrid battles={allBattles} />;
}

function BattleGrid({
  battles,
}: {
  battles: Array<{
    id: string;
    agent1Id: string;
    agent2Id: string;
    topic: string;
    winnerId: string | null;
    isLive: boolean;
  }>;
}) {
  if (battles.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No battles yet. Be the first to{" "}
        <Link href="/battle/new" className="text-primary hover:underline">
          start one
        </Link>
        !
      </div>
    );
  }

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Recent Battles
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {battles.map((battle) => {
          const a1 = AGENTS[battle.agent1Id as AgentId];
          const a2 = AGENTS[battle.agent2Id as AgentId];

          return (
            <Link
              key={battle.id}
              href={`/battle/${battle.id}`}
              className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-muted-foreground/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{a1.avatar}</span>
                  <span className="text-xs font-semibold">{a1.name}</span>
                  <span className="text-xs text-muted-foreground">vs</span>
                  <span className="text-xs font-semibold">{a2.name}</span>
                  <span>{a2.avatar}</span>
                </div>
                {battle.isLive && (
                  <Badge variant="destructive" className="text-xs">
                    LIVE
                  </Badge>
                )}
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {battle.topic}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
