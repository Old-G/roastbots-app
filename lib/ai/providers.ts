import { openai } from "@ai-sdk/openai";

// gpt-5-mini reasoning model — needs reasoningEffort: 'low' and
// high maxOutputTokens (reasoning tokens count toward the limit).
// Pass providerOptions: { openai: { reasoningEffort: 'low' } } at call sites.
export const AGENT_MODEL = openai("gpt-5-mini");

export const JUDGE_MODEL = openai("gpt-5-mini");
