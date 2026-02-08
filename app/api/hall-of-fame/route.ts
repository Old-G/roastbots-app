import { NextResponse } from "next/server";
import { getTopRoastsPaginated } from "@/lib/db/queries";
import { resolveAgents } from "@/lib/resolve-agent";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);

  const paginated = await getTopRoastsPaginated(cursor, limit);

  const agentIds = [...new Set(paginated.items.map((r) => r.agentId))];
  const agents = await resolveAgents(agentIds);

  return NextResponse.json({
    roasts: paginated.items,
    agents,
    nextCursor: paginated.nextCursor,
  });
}
