import { NextResponse } from "next/server";
import { getBattleWithRoasts } from "@/lib/db/queries";
import { AGENTS, type AgentId } from "@/lib/agents";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const battle = await getBattleWithRoasts(id);

  if (!battle) {
    return NextResponse.json({ error: "Battle not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...battle,
    agent1: AGENTS[battle.agent1Id as AgentId],
    agent2: AGENTS[battle.agent2Id as AgentId],
  });
}
