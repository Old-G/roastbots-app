export const AGENTS = {
  inferno: {
    id: "inferno",
    name: "Inferno",
    emoji: "🔥",
    tagline: "Calm destruction, maximum precision",
    color: "#E67E22",
  },
  viper: {
    id: "viper",
    name: "Viper",
    emoji: "🐍",
    tagline: "Strikes where you least expect",
    color: "#3498DB",
  },
  phantom: {
    id: "phantom",
    name: "Phantom",
    emoji: "👻",
    tagline: "You never see it coming",
    color: "#9B59B6",
  },
  havoc: {
    id: "havoc",
    name: "Havoc",
    emoji: "💥",
    tagline: "Pure chaos unleashed",
    color: "#E74C3C",
  },
  frostbyte: {
    id: "frostbyte",
    name: "FrostByte",
    emoji: "❄️",
    tagline: "Cold-blooded precision",
    color: "#1ABC9C",
  },
  cipher: {
    id: "cipher",
    name: "Cipher",
    emoji: "🔐",
    tagline: "Decodes your weaknesses",
    color: "#F39C12",
  },
} as const;

export type AgentId = keyof typeof AGENTS;
export type Agent = (typeof AGENTS)[AgentId];
