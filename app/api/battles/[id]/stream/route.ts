import { streamText } from "ai";
import { AGENT_MODEL } from "@/lib/ai/providers";
import {
  getAgentSystemPrompt,
  buildRoastMessages,
  type RoastMessage,
} from "@/lib/ai/prompts";
import { judgeRoast } from "@/lib/ai/judge";
import { getBattle, saveRoast, markBattleComplete, markBattleStreaming } from "@/lib/db/queries";
import { AGENTS, type AgentId } from "@/lib/agents";
import { generateRoastId } from "@/lib/utils";

export const maxDuration = 120;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const battle = await getBattle(id);

  if (!battle) {
    return new Response("Battle not found", { status: 404 });
  }

  if (battle.status === "completed" || battle.status === "streaming") {
    return new Response(
      battle.status === "completed"
        ? "Battle already completed"
        : "Battle already streaming",
      { status: 400 }
    );
  }

  await markBattleStreaming(id);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      const agent1Id = battle.agent1Id as AgentId;
      const agent2Id = battle.agent2Id as AgentId;
      const previousRoasts: RoastMessage[] = [];
      const totalRounds = 5;

      try {
        for (let round = 1; round <= totalRounds; round++) {
          for (const agentId of [agent1Id, agent2Id]) {
            const opponentId = agentId === agent1Id ? agent2Id : agent1Id;
            const agent = AGENTS[agentId];
            const opponent = AGENTS[opponentId];

            send("roast_start", { agent_id: agentId, round });

            const systemPrompt = getAgentSystemPrompt(
              agentId,
              opponentId,
              battle.topic
            );
            const messages = buildRoastMessages(
              previousRoasts,
              round,
              totalRounds
            );

            const result = streamText({
              model: AGENT_MODEL,
              system: systemPrompt,
              messages,
              maxOutputTokens: 800,
              providerOptions: {
                openai: { reasoningEffort: "low" },
              },
            });

            let fullText = "";
            for await (const chunk of result.textStream) {
              fullText += chunk;
              send("roast_delta", { text: chunk });
            }

            // Judge and save in parallel
            const [judgeResult] = await Promise.all([
              judgeRoast(
                fullText,
                agent.name,
                opponent.name,
                battle.topic,
                round
              ),
            ]);

            const isFatality = judgeResult.score >= 92;
            const roastId = generateRoastId();

            await saveRoast({
              id: roastId,
              battleId: id,
              agentId,
              round,
              text: fullText,
              crowdScore: judgeResult.score,
              isFatality,
            });

            previousRoasts.push({
              agentId,
              agentName: agent.name,
              text: fullText,
            });

            send("roast_complete", {
              roast_id: roastId,
              agent_id: agentId,
              round,
              text: fullText,
              crowd_score: judgeResult.score,
              is_fatality: isFatality,
            });

            // Dramatic pause before next agent (skip after last roast)
            const isLastRoast = round === totalRounds && agentId === agent2Id;
            if (!isLastRoast) {
              const nextAgentId = agentId === agent1Id ? agent2Id : agent1Id;
              send("thinking", {
                agent_id: nextAgentId,
                message: `${AGENTS[nextAgentId].name} is preparing a response...`,
              });
              await new Promise((r) => setTimeout(r, 1500));
            }
          }
        }

        await markBattleComplete(id);
        const completedBattle = await getBattle(id);
        send("battle_complete", {
          battle_id: id,
          total_roasts: totalRounds * 2,
          winner_id: completedBattle?.winnerId ?? null,
          agent1_id: agent1Id,
          agent2_id: agent2Id,
        });
      } catch (error) {
        send("error", {
          message: "Battle encountered an error",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
