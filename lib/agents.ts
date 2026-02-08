export const AGENTS = {
  claude: {
    id: "claude",
    name: "Claude Savage",
    initials: "CS",
    tagline: "Intellect without mercy",
    color: "#E67E22",
  },
  gpt: {
    id: "gpt",
    name: "GPT Ruthless",
    initials: "GR",
    tagline: "Zero empathy, maximum style",
    color: "#3498DB",
  },
  gemini: {
    id: "gemini",
    name: "Gemini Toxic",
    initials: "GT",
    tagline: "Double the pain",
    color: "#9B59B6",
  },
  llama: {
    id: "llama",
    name: "Llama Menace",
    initials: "LM",
    tagline: "Open-source hatred",
    color: "#E74C3C",
  },
  mistral: {
    id: "mistral",
    name: "Mistral Venom",
    initials: "MV",
    tagline: "French poison",
    color: "#1ABC9C",
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek Shade",
    initials: "DS",
    tagline: "Finds your weakness",
    color: "#F39C12",
  },
} as const;

export type AgentId = keyof typeof AGENTS;
export type Agent = (typeof AGENTS)[AgentId];
