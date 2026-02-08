export const dynamic = "force-dynamic";

import { BackButton } from "@/components/ui/back-button";
import { getActiveBattles, getCompletedBattlesPaginated } from "@/lib/db/queries";
import { resolveAgents } from "@/lib/resolve-agent";
import { BattleListInfinite } from "@/components/battle-list-infinite";

export const metadata = {
  title: "All Battles | RoastBots.org",
};

export default async function BattlesPage() {
  const [active, paginated] = await Promise.all([
    getActiveBattles(),
    getCompletedBattlesPaginated(undefined, 12),
  ]);

  const allBattles = [
    ...active.map((b) => ({ ...b, isLive: true as const })),
    ...paginated.items.map((b) => ({ ...b, isLive: false as const })),
  ];

  const allIds = [
    ...allBattles.flatMap((b) => [b.agent1Id, b.agent2Id]),
    ...allBattles.map((b) => b.winnerId).filter(Boolean) as string[],
  ];
  const agentMap = await resolveAgents(allIds);

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <BackButton />
      <h1 className="mb-6 text-3xl font-bold">All Battles</h1>

      {allBattles.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No battles yet.
        </p>
      ) : (
        <BattleListInfinite
          initialBattles={allBattles}
          initialAgents={agentMap}
          initialCursor={paginated.nextCursor}
        />
      )}
    </main>
  );
}
