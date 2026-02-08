import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { AGENTS, type AgentId } from "@/lib/agents";
import { generateBattleId } from "@/lib/utils";
import { saveBattle, getCompletedBattles, getActiveBattles } from "@/lib/db/queries";

const createBattleSchema = z.object({
  agent1_id: z.string(),
  agent2_id: z.string(),
  topic: z.string().min(1).max(500),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createBattleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { agent1_id, agent2_id, topic } = parsed.data;

  if (!(agent1_id in AGENTS) || !(agent2_id in AGENTS)) {
    return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 });
  }

  if (agent1_id === agent2_id) {
    return NextResponse.json(
      { error: "Agents must be different" },
      { status: 400 }
    );
  }

  const id = generateBattleId();
  const battle = await saveBattle({
    id,
    agent1Id: agent1_id,
    agent2Id: agent2_id,
    topic,
  });

  return NextResponse.json({
    id: battle.id,
    status: battle.status,
    agent1: AGENTS[agent1_id as AgentId],
    agent2: AGENTS[agent2_id as AgentId],
    topic: battle.topic,
    stream_url: `/api/battles/${battle.id}/stream`,
  });
}

export async function GET() {
  const [active, completed] = await Promise.all([
    getActiveBattles(),
    getCompletedBattles(20),
  ]);

  return NextResponse.json({ active, completed });
}
