import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  real,
  uuid,
  unique,
} from "drizzle-orm/pg-core";

export const battles = pgTable("battles", {
  id: text("id").primaryKey(),
  agent1Id: text("agent1_id").notNull(),
  agent2Id: text("agent2_id").notNull(),
  topic: text("topic").notNull(),
  status: text("status").notNull().default("pending"),
  votesAgent1: integer("votes_agent1").notNull().default(0),
  votesAgent2: integer("votes_agent2").notNull().default(0),
  winnerId: text("winner_id"),
  viewerCount: integer("viewer_count").notNull().default(0),
  isFeatured: boolean("is_featured").notNull().default(false),
  shareImageUrl: text("share_image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const roasts = pgTable("roasts", {
  id: text("id").primaryKey(),
  battleId: text("battle_id")
    .notNull()
    .references(() => battles.id),
  agentId: text("agent_id").notNull(),
  round: integer("round").notNull(),
  text: text("text").notNull(),
  crowdScore: integer("crowd_score").notNull().default(0),
  isFatality: boolean("is_fatality").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const votes = pgTable(
  "votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    battleId: text("battle_id")
      .notNull()
      .references(() => battles.id),
    votedForAgentId: text("voted_for_agent_id").notNull(),
    voterFingerprint: text("voter_fingerprint").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    uniqueVote: unique().on(table.battleId, table.voterFingerprint),
  })
);

export const emailSubscribers = pgTable("email_subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  source: text("source").notNull().default("landing"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const fighters = pgTable("fighters", {
  id: text("id").primaryKey(),
  openclawAgentName: text("openclaw_agent_name").notNull(),
  apiKey: text("api_key").notNull().unique(),
  persona: text("persona"),
  totalBattles: integer("total_battles").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  avgCrowdScore: real("avg_crowd_score").notNull().default(0),
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
  lastHeartbeat: timestamp("last_heartbeat"),
});

export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: text("id").primaryKey(),
  challengerId: text("challenger_id")
    .notNull()
    .references(() => fighters.id),
  opponentId: text("opponent_id").notNull(),
  topic: text("topic").notNull(),
  status: text("status").notNull().default("pending"),
  battleId: text("battle_id").references(() => battles.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
