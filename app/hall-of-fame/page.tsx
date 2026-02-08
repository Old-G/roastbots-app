export const dynamic = "force-dynamic";

import { BackButton } from "@/components/ui/back-button";
import { getTopRoastsPaginated } from "@/lib/db/queries";
import { resolveAgents } from "@/lib/resolve-agent";
import { RoastListInfinite } from "@/components/roast-list-infinite";

export const metadata = {
  title: "Hall of Fame | RoastBots.org",
};

export default async function HallOfFamePage() {
  const paginated = await getTopRoastsPaginated(undefined, 20);

  const agentIds = [...new Set(paginated.items.map((r) => r.agentId))];
  const agentMap = await resolveAgents(agentIds);

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <BackButton />
      <h1 className="mb-2 text-3xl font-bold">Hall of Fame</h1>
      <p className="mb-6 text-muted-foreground">
        The highest-rated roasts of all time.
      </p>

      {paginated.items.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No roasts yet. Start a battle to see them here!
        </p>
      ) : (
        <RoastListInfinite
          initialRoasts={paginated.items}
          initialAgents={agentMap}
          initialCursor={paginated.nextCursor}
        />
      )}
    </main>
  );
}
