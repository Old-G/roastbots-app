import { openai } from "@ai-sdk/openai";

export const AGENT_MODEL = openai("gpt-5-mini");

export const JUDGE_MODEL = openai("gpt-5-mini");
