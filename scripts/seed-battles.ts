/**
 * Seed script: generates battles between arena bots.
 *
 * Usage (from roastbots_app/):
 *   npx tsx scripts/seed-battles.ts          # default 15 battles
 *   npx tsx scripts/seed-battles.ts 20       # generate 20 battles
 *   npx tsx scripts/seed-battles.ts --fresh  # delete all existing battles first
 *
 * Requires .env.local with DATABASE_URL and OPENAI_API_KEY.
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

function generateRandomPairs(count: number): Array<{
  agent1: AgentId;
  agent2: AgentId;
  topic: string;
}> {
  const agentIds = Object.keys(AGENTS) as AgentId[];
  const plans: Array<{ agent1: AgentId; agent2: AgentId; topic: string }> = [];

  for (let i = 0; i < count; i++) {
    // Pick two random different agents
    const idx1 = Math.floor(Math.random() * agentIds.length);
    let idx2 = Math.floor(Math.random() * (agentIds.length - 1));
    if (idx2 >= idx1) idx2++;

    plans.push({
      agent1: agentIds[idx1],
      agent2: agentIds[idx2],
      topic: TOPICS[Math.floor(Math.random() * TOPICS.length)],
    });
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
    maxOutputTokens: 800,
    providerOptions: {
      openai: { reasoningEffort: "low" },
    },
  });

  return text;
}

async function seedBattle(
  plan: { agent1: AgentId; agent2: AgentId; topic: string },
  index: number,
  total: number,
  markFeatured: boolean
) {
  const battleId = generateBattleId();
  const a1 = AGENTS[plan.agent1];
  const a2 = AGENTS[plan.agent2];
  console.log(
    `\n[${index + 1}/${total}] ${a1.name} vs ${a2.name} — "${plan.topic}"`
  );

  await db.insert(battles).values({
    id: battleId,
    agent1Id: plan.agent1,
    agent2Id: plan.agent2,
    topic: plan.topic,
    status: "in_progress",
    isFeatured: markFeatured,
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

  const winnerId =
    scores.agent1 > scores.agent2
      ? plan.agent1
      : scores.agent1 < scores.agent2
        ? plan.agent2
        : null;

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

  const winnerName = winnerId ? AGENTS[winnerId].name : "DRAW";
  console.log(
    `  Winner: ${winnerName} (${scores.agent1} vs ${scores.agent2})`
  );
}

async function main() {
  const args = process.argv.slice(2);
  const isFresh = args.includes("--fresh");
  const countArg = args.find((a) => !a.startsWith("--"));
  const count = countArg ? parseInt(countArg, 10) : 15;

  if (isNaN(count) || count < 1) {
    console.error("Invalid count. Usage: npx tsx scripts/seed-battles.ts [count] [--fresh]");
    process.exit(1);
  }

  console.log("Seeding RoastBots battles...\n");

  if (isFresh) {
    console.log("--fresh: Deleting all existing roasts and battles...");
    await db.delete(roasts);
    await db.delete(battles);
    console.log("Cleared.\n");
  }

  const existing = await db.query.battles.findMany();
  const needsFeatured = existing.length === 0;

  const plans = generateRandomPairs(count);
  console.log(`Generating ${plans.length} battles...\n`);

  for (let i = 0; i < plans.length; i++) {
    await seedBattle(plans[i], i, plans.length, needsFeatured && i === 0);
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
