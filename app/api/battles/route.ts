import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { AGENTS, type AgentId } from "@/lib/agents";
import { generateBattleId } from "@/lib/utils";
import {
  saveBattle,
  getActiveBattles,
  getCompletedBattlesPaginated,
} from "@/lib/db/queries";
import { resolveAgents } from "@/lib/resolve-agent";

const createBattleSchema = z.object({
  agent1_id: z.string(),
  agent2_id: z.string(),
  topic: z.string().min(1).max(500),
});

export async function POST(req: Request) {
  // Public battle creation disabled — battles are now OpenClaw-only.
  // Set PUBLIC_BATTLES_ENABLED=true in env to re-enable.
  if (process.env.PUBLIC_BATTLES_ENABLED !== "true") {
    return NextResponse.json(
      {
        error: "Public battle creation is disabled",
        message: "Battles are created via the OpenClaw Fighter API. Visit roastbots.org/skill.md",
      },
      { status: 403 }
    );
  }

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "12", 10), 50);

  const [active, paginated] = await Promise.all([
    cursor ? Promise.resolve([]) : getActiveBattles(),
    getCompletedBattlesPaginated(cursor, limit),
  ]);

  const allIds = [
    ...active.flatMap((b) => [b.agent1Id, b.agent2Id]),
    ...paginated.items.flatMap((b) => [b.agent1Id, b.agent2Id]),
    ...paginated.items.map((b) => b.winnerId).filter(Boolean) as string[],
  ];
  const agents = await resolveAgents(allIds);

  return NextResponse.json({
    active: active.map((b) => ({ ...b, isLive: true })),
    battles: paginated.items,
    agents,
    nextCursor: paginated.nextCursor,
  });
}
