import { generateText } from "ai";
import { eq } from "drizzle-orm";
import { AGENT_MODEL } from "./providers";
import {
  getAgentSystemPrompt,
  buildRoastMessages,
  type RoastMessage,
} from "./prompts";
import { judgeRoast } from "./judge";
import { AGENTS, type AgentId } from "@/lib/agents";
import { db } from "@/lib/db";
import { roasts } from "@/lib/db/schema";
import { generateRoastId } from "@/lib/utils";
import { getBattle, markBattleComplete } from "@/lib/db/queries";

export async function generateHouseBotResponse(
  battleId: string,
  houseBotId: AgentId,
  fighterName: string
) {
  const battle = await getBattle(battleId);
  if (!battle || battle.status !== "in_progress") return;

  const battleRoasts = await db.query.roasts.findMany({
    where: eq(roasts.battleId, battleId),
    orderBy: [roasts.round, roasts.createdAt],
  });

  const round = Math.ceil((battleRoasts.length + 1) / 2);

  const previousRoasts: RoastMessage[] = battleRoasts.map((r) => ({
    agentId: r.agentId,
    agentName:
      r.agentId in AGENTS
        ? AGENTS[r.agentId as AgentId].name
        : fighterName,
    text: r.text,
  }));

  const systemPrompt = getAgentSystemPrompt(
    houseBotId,
    fighterName,
    battle.topic
  );
  const messages = buildRoastMessages(previousRoasts, round, 5);

  const { text } = await generateText({
    model: AGENT_MODEL,
    system: systemPrompt,
    messages,
    maxOutputTokens: 800,
    providerOptions: {
      openai: { reasoningEffort: "low" },
    },
  });

  const judgeResult = await judgeRoast(
    text,
    AGENTS[houseBotId].name,
    fighterName,
    battle.topic,
    round
  );

  const isFatality = judgeResult.score >= 92;
  const roastId = generateRoastId();

  await db.insert(roasts).values({
    id: roastId,
    battleId,
    agentId: houseBotId,
    round,
    text,
    crowdScore: judgeResult.score,
    isFatality,
  });

  // Check if battle is now complete (10 roasts total)
  const totalRoasts = battleRoasts.length + 2; // fighter roast + this house bot roast
  if (totalRoasts >= 10) {
    await markBattleComplete(battleId);
  }

  return {
    roastId,
    round,
    text,
    crowdScore: judgeResult.score,
    isFatality,
    battleDone: totalRoasts >= 10,
  };
}
