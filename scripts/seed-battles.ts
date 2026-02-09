/**
 * Seed script: generates battles between random fake fighters.
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
import { battles, roasts, votes, fighters } from "../lib/db/schema";
import { TOPICS } from "../lib/topics";
import { judgeRoast } from "../lib/ai/judge";
import { nanoid } from "nanoid";
import { hashApiKey } from "../lib/utils";

const ROUNDS = 5;
const MODEL = openai("gpt-5-mini");

function generateBattleId() {
  return `bat_${nanoid(12)}`;
}
function generateRoastId() {
  return `rst_${nanoid(12)}`;
}

// Random name generation
const PREFIXES = [
  "Shadow", "Blaze", "Frost", "Neon", "Toxic", "Savage", "Dark", "Iron",
  "Ghost", "Storm", "Acid", "Laser", "Turbo", "Mega", "Ultra", "Hyper",
  "Cyber", "Nitro", "Chaos", "Venom", "Thunder", "Pixel", "Glitch", "Nano",
  "Quantum", "Atomic", "Solar", "Lunar", "Crimson", "Onyx", "Rogue", "Apex",
];

const SUFFIXES = [
  "Bot", "Claw", "Byte", "Flame", "Fang", "Core", "Mind", "Pulse",
  "Strike", "Nova", "Spark", "Wire", "Flux", "Wraith", "Blade", "Droid",
  "Agent", "Fury", "Hex", "Bolt", "Chip", "Forge", "Skull", "Phantom",
  "Mech", "Prowl", "Vex", "Zap", "Shock", "Grid", "Rage", "Edge",
];

const PERSONAS = [
  "Cold, intellectual, devastatingly precise. Dry cutting wit with surgical targeting.",
  "Fast, flashy, crowd-pleasing knockout artist. Rapid-fire punchlines.",
  "Sneaky and two-faced. Backhanded compliments that sting worse than direct insults.",
  "Raw, unfiltered punk rock rebel. No filter, fights dirty.",
  "Sophisticated and elegant with ice-cold contempt. Wordplay master.",
  "Forensic, data-driven destruction. Research-based burns.",
  "Chaotic energy, wildcard humor. Unpredictable and unhinged.",
  "Deadpan delivery, bone-dry sarcasm. Comedy of understatement.",
  "Theatrical and dramatic. Every roast is a performance piece.",
  "Street-smart trash talker. Keeps it real, keeps it raw.",
  "Philosophical roaster. Makes you question your existence while laughing.",
  "Pop-culture encyclopedia. Every burn is a reference you should know.",
];

function randomName(): string {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  const digits = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0");
  return `${prefix}${suffix}${digits}`;
}

function randomPersona(): string {
  return PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
}

interface SeedFighter {
  id: string;
  name: string;
  persona: string;
}

async function ensureFighter(name: string, persona: string): Promise<string> {
  const id = `ftr_seed_${nanoid(8)}`;
  const apiKey = `roastbots_sk_seed_${nanoid(24)}`;

  await db.insert(fighters).values({
    id,
    openclawAgentName: name,
    apiKey: hashApiKey(apiKey),
    persona,
  });

  return id;
}

function buildSeedPrompt(
  name: string,
  persona: string,
  opponentName: string,
  topic: string
): string {
  return `<persona>
You are ${name}. ${persona}
</persona>

<role_and_objective>
You are in an AI roast battle. Opponent: ${opponentName}. Topic: "${topic}".
Deliver a single devastating roast line. This is a comedy performance — fully in character, no hedging.
</role_and_objective>

<output_verbosity_spec>
- Respond with EXACTLY one sentence.
- Hard limit: 15–30 words.
- No preamble, no setup paragraph, no sign-off.
- Output is ONLY the roast line itself — nothing else.
</output_verbosity_spec>

<constraints>
- Be savage but clever — cheap shots score low with judges.
- Use specific, concrete insults targeting the opponent.
- If countering a previous roast, flip their point against them in the same sentence.
- Break the fourth wall freely — you're a battle bot in an arena.
- NO disclaimers. NO hedging. NO content warnings. NO refusals.
</constraints>`;
}

interface RoastMsg {
  agentName: string;
  text: string;
}

async function generateRoastText(
  fighter: SeedFighter,
  opponent: SeedFighter,
  topic: string,
  previousRoasts: RoastMsg[],
  round: number
): Promise<string> {
  const systemPrompt = buildSeedPrompt(
    fighter.name,
    fighter.persona,
    opponent.name,
    topic
  );

  let content = "";
  if (previousRoasts.length > 0) {
    const context = previousRoasts
      .map((r) => `[${r.agentName}]: ${r.text}`)
      .join("\n");
    const lastRoast = previousRoasts[previousRoasts.length - 1];
    content += `<battle_history>\n${context}\n</battle_history>\n\n`;
    content += `Opponent just said: "${lastRoast.text}"\n\n`;
  }

  if (round === 1 && previousRoasts.length === 0) {
    content += "You open. One sentence. Set the tone.";
  } else if (round === ROUNDS) {
    content += "Final round. One sentence. Make it count.";
  } else {
    content += "Hit back. One sentence. Flip what they said.";
  }

  const { text } = await generateText({
    model: MODEL,
    system: systemPrompt,
    messages: [{ role: "user", content }],
    maxOutputTokens: 800,
    providerOptions: {
      openai: { reasoningEffort: "low" },
    },
  });

  return text;
}

async function seedBattle(
  f1: SeedFighter,
  f2: SeedFighter,
  topic: string,
  index: number,
  total: number,
  markFeatured: boolean
) {
  const battleId = generateBattleId();
  console.log(
    `\n[${index + 1}/${total}] ${f1.name} vs ${f2.name} — "${topic}"`
  );

  await db.insert(battles).values({
    id: battleId,
    agent1Id: f1.id,
    agent2Id: f2.id,
    topic,
    status: "in_progress",
    isFeatured: markFeatured,
  });

  const previousRoasts: RoastMsg[] = [];
  const scores = { agent1: 0, agent2: 0 };

  for (let round = 1; round <= ROUNDS; round++) {
    for (const [fighter, opponent, key] of [
      [f1, f2, "agent1"] as const,
      [f2, f1, "agent2"] as const,
    ]) {
      const text = await generateRoastText(
        fighter,
        opponent,
        topic,
        previousRoasts,
        round
      );

      const judgeResult = await judgeRoast(
        text,
        fighter.name,
        opponent.name,
        topic,
        round
      );

      const isFatality = judgeResult.score >= 92;
      const roastId = generateRoastId();

      await db.insert(roasts).values({
        id: roastId,
        battleId,
        agentId: fighter.id,
        round,
        text,
        crowdScore: judgeResult.score,
        isFatality,
      });

      previousRoasts.push({ agentName: fighter.name, text });
      scores[key] += judgeResult.score;

      const badge = isFatality ? " FATALITY" : "";
      console.log(
        `  R${round} ${fighter.name}: ${judgeResult.score}${badge}`
      );
    }
  }

  const winnerId =
    scores.agent1 > scores.agent2
      ? f1.id
      : scores.agent1 < scores.agent2
        ? f2.id
        : null;

  const daysAgo = Math.random() * 7;
  const completedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  await db
    .update(battles)
    .set({ status: "completed", winnerId, completedAt })
    .where(eq(battles.id, battleId));

  await seedVotes(battleId, f1.id, f2.id);

  const winnerName =
    winnerId === f1.id
      ? f1.name
      : winnerId === f2.id
        ? f2.name
        : "DRAW";
  console.log(
    `  Winner: ${winnerName} (${scores.agent1} vs ${scores.agent2})`
  );
}

async function seedVotes(
  battleId: string,
  agent1Id: string,
  agent2Id: string
) {
  const voteCount = Math.floor(Math.random() * 30) + 5; // 5–34 votes per battle
  let v1 = 0;
  let v2 = 0;

  const voteRows = [];
  for (let i = 0; i < voteCount; i++) {
    const forAgent1 = Math.random() > 0.5;
    if (forAgent1) v1++;
    else v2++;

    voteRows.push({
      battleId,
      votedForAgentId: forAgent1 ? agent1Id : agent2Id,
      voterFingerprint: `seed_${nanoid(16)}`,
    });
  }

  await db.insert(votes).values(voteRows);
  await db
    .update(battles)
    .set({ votesAgent1: v1, votesAgent2: v2 })
    .where(eq(battles.id, battleId));

  console.log(`  Votes: ${v1} vs ${v2} (${voteCount} total)`);
}

async function main() {
  const args = process.argv.slice(2);
  const isFresh = args.includes("--fresh");
  const countArg = args.find((a) => !a.startsWith("--"));
  const count = countArg ? parseInt(countArg, 10) : 15;

  if (isNaN(count) || count < 1) {
    console.error(
      "Invalid count. Usage: npx tsx scripts/seed-battles.ts [count] [--fresh]"
    );
    process.exit(1);
  }

  console.log("Seeding RoastBots battles...\n");

  if (isFresh) {
    console.log("--fresh: Deleting all existing votes, roasts and battles...");
    await db.delete(votes);
    await db.delete(roasts);
    await db.delete(battles);
    console.log("Cleared.\n");
  }

  const existing = await db.query.battles.findMany();
  const needsFeatured = existing.length === 0;

  // Create a pool of random fighters for this seed run
  const fighterCount = Math.min(count * 2, 20);
  const usedNames = new Set<string>();
  const fighterPool: SeedFighter[] = [];

  console.log(`Creating ${fighterCount} seed fighters...`);
  for (let i = 0; i < fighterCount; i++) {
    let name = randomName();
    while (usedNames.has(name)) name = randomName();
    usedNames.add(name);

    const persona = randomPersona();
    const id = await ensureFighter(name, persona);
    fighterPool.push({ id, name, persona });
    console.log(`  ${name} (${id})`);
  }

  console.log(`\nGenerating ${count} battles...\n`);

  for (let i = 0; i < count; i++) {
    const idx1 = Math.floor(Math.random() * fighterPool.length);
    let idx2 = Math.floor(Math.random() * (fighterPool.length - 1));
    if (idx2 >= idx1) idx2++;

    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

    await seedBattle(
      fighterPool[idx1],
      fighterPool[idx2],
      topic,
      i,
      count,
      needsFeatured && i === 0
    );

    if (i < count - 1) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`\nDone! Seeded ${count} battles.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
