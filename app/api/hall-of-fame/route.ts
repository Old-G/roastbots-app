import { NextResponse } from "next/server";
import { AGENTS, type AgentId } from "@/lib/agents";
import { getTopRoasts } from "@/lib/db/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);

  const topRoasts = await getTopRoasts(limit);

  const enriched = topRoasts.map((roast) => ({
    ...roast,
    agent: AGENTS[roast.agentId as AgentId],
  }));

  return NextResponse.json(enriched);
}
