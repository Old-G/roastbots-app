/**
 * Seed script: generates 15 battles (all C(6,2) house-bot pairs).
 *
 * Usage (from roastbots_app/):
 *   npx tsx scripts/seed-battles.ts
 *
 * Requires .env with DATABASE_URL and OPENAI_API_KEY.
 */

import "dotenv/config";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { eq } from "drizzle-orm";
import { db } from "../lib/db/index";
import { battles, roasts } from "../lib/db/schema";
import { AGENTS, type AgentId } from "../lib/agents";
import { TOPICS } from "../lib/topics";
import {
  getAgentSystemPrompt,
  buildRoastMessages,
  type RoastMessage,
} from "../lib/ai/prompts";
import { judgeRoast } from "../lib/ai/judge";
import { nanoid } from "nanoid";

const ROUNDS = 5;
const MODEL = openai("gpt-5-mini");

function generateBattleId() {
  return `bat_${nanoid(12)}`;
}
function generateRoastId() {
  return `rst_${nanoid(12)}`;
}

function generateAllPairs(): Array<{
  agent1: AgentId;
  agent2: AgentId;
  topic: string;
}> {
  const agentIds = Object.keys(AGENTS) as AgentId[];
  const plans: Array<{ agent1: AgentId; agent2: AgentId; topic: string }> = [];

  for (let i = 0; i < agentIds.length; i++) {
    for (let j = i + 1; j < agentIds.length; j++) {
      plans.push({
        agent1: agentIds[i],
        agent2: agentIds[j],
        topic: TOPICS[Math.floor(Math.random() * TOPICS.length)],
      });
    }
  }

  // Shuffle
  for (let i = plans.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [plans[i], plans[j]] = [plans[j], plans[i]];
  }

  return plans;
}

async function generateRoastText(
  agentId: AgentId,
  opponentId: AgentId,
  topic: string,
  previousRoasts: RoastMessage[],
  round: number
): Promise<string> {
  const systemPrompt = getAgentSystemPrompt(agentId, opponentId, topic);
  const messages = buildRoastMessages(previousRoasts, round, ROUNDS);

  const { text } = await generateText({
    model: MODEL,
    system: systemPrompt,
    messages,
    maxOutputTokens: 1500,
    providerOptions: {
      openai: { reasoningEffort: "low" },
    },
  });

  return text;
}

async function seedBattle(
  plan: { agent1: AgentId; agent2: AgentId; topic: string },
  index: number,
  total: number
) {
  const battleId = generateBattleId();
  const a1 = AGENTS[plan.agent1];
  const a2 = AGENTS[plan.agent2];
  console.log(
    `\n[${index + 1}/${total}] ${a1.name} vs ${a2.name} — "${plan.topic}"`
  );

  // Create battle
  await db.insert(battles).values({
    id: battleId,
    agent1Id: plan.agent1,
    agent2Id: plan.agent2,
    topic: plan.topic,
    status: "in_progress",
    isFeatured: index === 0,
  });

  const previousRoasts: RoastMessage[] = [];
  const scores: { agent1: number; agent2: number } = { agent1: 0, agent2: 0 };

  for (let round = 1; round <= ROUNDS; round++) {
    for (const agentId of [plan.agent1, plan.agent2]) {
      const opponentId =
        agentId === plan.agent1 ? plan.agent2 : plan.agent1;

      const text = await generateRoastText(
        agentId,
        opponentId,
        plan.topic,
        previousRoasts,
        round
      );

      const judgeResult = await judgeRoast(
        text,
        AGENTS[agentId].name,
        AGENTS[opponentId].name,
        plan.topic,
        round
      );

      const isFatality = judgeResult.score >= 92;
      const roastId = generateRoastId();

      await db.insert(roasts).values({
        id: roastId,
        battleId,
        agentId,
        round,
        text,
        crowdScore: judgeResult.score,
        isFatality,
      });

      previousRoasts.push({
        agentId,
        agentName: AGENTS[agentId].name,
        text,
      });

      if (agentId === plan.agent1) scores.agent1 += judgeResult.score;
      else scores.agent2 += judgeResult.score;

      const badge = isFatality ? " FATALITY" : "";
      console.log(
        `  R${round} ${AGENTS[agentId].name}: ${judgeResult.score}${badge}`
      );
    }
  }

  // Complete battle
  const winnerId =
    scores.agent1 > scores.agent2 ? plan.agent1 : plan.agent2;

  // Random completedAt in the past week
  const daysAgo = Math.random() * 7;
  const completedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  await db
    .update(battles)
    .set({
      status: "completed",
      winnerId,
      completedAt,
    })
    .where(eq(battles.id, battleId));

  console.log(
    `  Winner: ${AGENTS[winnerId].name} (${scores.agent1} vs ${scores.agent2})`
  );
}

async function main() {
  console.log("Seeding RoastBots battles...\n");

  // Check existing battles
  const existing = await db.query.battles.findMany();
  if (existing.length > 0) {
    console.log(`DB already has ${existing.length} battles. Skipping seed.`);
    console.log("To re-seed, delete existing battles first.");
    process.exit(0);
  }

  const plans = generateAllPairs();
  console.log(`Generating ${plans.length} battles (all house-bot pairs)...\n`);

  for (let i = 0; i < plans.length; i++) {
    await seedBattle(plans[i], i, plans.length);
    // Small delay between battles to avoid rate limiting
    if (i < plans.length - 1) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`\nDone! Seeded ${plans.length} battles.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
