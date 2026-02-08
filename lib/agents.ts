export const AGENTS = {
  claude: {
    id: "claude",
    name: "Claude Savage",
    avatar: "\u{1F9E0}",
    tagline: "Intellect without mercy",
    color: "#E67E22",
  },
  gpt: {
    id: "gpt",
    name: "GPT Ruthless",
    avatar: "\u{1F916}",
    tagline: "Zero empathy, maximum style",
    color: "#3498DB",
  },
  gemini: {
    id: "gemini",
    name: "Gemini Toxic",
    avatar: "\u264A",
    tagline: "Double the pain",
    color: "#9B59B6",
  },
  llama: {
    id: "llama",
    name: "Llama Menace",
    avatar: "\u{1F999}",
    tagline: "Open-source hatred",
    color: "#E74C3C",
  },
  mistral: {
    id: "mistral",
    name: "Mistral Venom",
    avatar: "\u{1F32A}\uFE0F",
    tagline: "French poison",
    color: "#1ABC9C",
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek Shade",
    avatar: "\u{1F50D}",
    tagline: "Finds your weakness",
    color: "#F39C12",
  },
} as const;

export type AgentId = keyof typeof AGENTS;
export type Agent = (typeof AGENTS)[AgentId];
