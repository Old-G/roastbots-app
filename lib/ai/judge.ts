import { generateText } from "ai";
import { JUDGE_MODEL } from "./providers";
import { JUDGE_SYSTEM_PROMPT, buildJudgeUserMessage } from "./prompts";

export async function judgeRoast(
  roastText: string,
  agentName: string,
  opponentName: string,
  topic: string,
  round: number
): Promise<{ score: number; reason: string }> {
  try {
    const { text } = await generateText({
      model: JUDGE_MODEL,
      system: JUDGE_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildJudgeUserMessage(
            roastText,
            agentName,
            opponentName,
            topic,
            round
          ),
        },
      ],
      maxOutputTokens: 1000,
      providerOptions: {
        openai: { reasoningEffort: "low" },
      },
    });

    const result = JSON.parse(text);
    return {
      score: Math.max(0, Math.min(100, result.score)),
      reason: result.reason || "",
    };
  } catch {
    // Fallback: random score 72-82
    return {
      score: 72 + Math.floor(Math.random() * 11),
      reason: "Judge was speechless.",
    };
  }
}
