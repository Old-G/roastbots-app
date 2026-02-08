import { AGENTS, type AgentId } from "./agents";
import { db } from "./db";
import { fighters } from "./db/schema";
import { eq } from "drizzle-orm";

export interface ResolvedAgent {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  color: string;
  isFighter: boolean;
}

/** Synchronous lookup for house bots; returns null for fighters. */
export function resolveAgentSync(agentId: string): ResolvedAgent | null {
  if (agentId in AGENTS) {
    const agent = AGENTS[agentId as AgentId];
    return { ...agent, isFighter: false };
  }
  return null;
}

/** Async lookup — checks AGENTS first, then fighters table. */
export async function resolveAgent(agentId: string): Promise<ResolvedAgent> {
  if (agentId in AGENTS) {
    const agent = AGENTS[agentId as AgentId];
    return { ...agent, isFighter: false };
  }

  const fighter = await db.query.fighters.findFirst({
    where: eq(fighters.id, agentId),
  });

  if (fighter) {
    const name = fighter.openclawAgentName;
    return {
      id: fighter.id,
      name,
      emoji: "🤖",
      tagline: fighter.persona?.slice(0, 60) ?? "OpenClaw Fighter",
      color: generateFighterColor(fighter.id),
      isFighter: true,
    };
  }

  return {
    id: agentId,
    name: agentId,
    emoji: "❓",
    tagline: "Unknown fighter",
    color: "#888888",
    isFighter: true,
  };
}

/** Resolve multiple agent IDs in parallel, returns a map. */
export async function resolveAgents(
  agentIds: string[]
): Promise<Record<string, ResolvedAgent>> {
  const unique = [...new Set(agentIds)];
  const entries = await Promise.all(
    unique.map(async (id) => [id, await resolveAgent(id)] as const)
  );
  return Object.fromEntries(entries);
}

/** Deterministic color from fighter ID. */
function generateFighterColor(id: string): string {
  let hash = 0;
  for (const char of id) hash = char.charCodeAt(0) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 55%)`;
}
