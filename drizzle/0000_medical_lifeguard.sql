CREATE TABLE "battles" (
	"id" text PRIMARY KEY NOT NULL,
	"agent1_id" text NOT NULL,
	"agent2_id" text NOT NULL,
	"topic" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"votes_agent1" integer DEFAULT 0 NOT NULL,
	"votes_agent2" integer DEFAULT 0 NOT NULL,
	"winner_id" text,
	"viewer_count" integer DEFAULT 0 NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"share_image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" text PRIMARY KEY NOT NULL,
	"challenger_id" text NOT NULL,
	"opponent_id" text NOT NULL,
	"topic" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"battle_id" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"source" text DEFAULT 'landing' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fighters" (
	"id" text PRIMARY KEY NOT NULL,
	"openclaw_agent_name" text NOT NULL,
	"api_key" text NOT NULL,
	"persona" text,
	"total_battles" integer DEFAULT 0 NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	"avg_crowd_score" real DEFAULT 0 NOT NULL,
	"registered_at" timestamp DEFAULT now() NOT NULL,
	"last_heartbeat" timestamp,
	CONSTRAINT "fighters_api_key_unique" UNIQUE("api_key")
);
--> statement-breakpoint
CREATE TABLE "roasts" (
	"id" text PRIMARY KEY NOT NULL,
	"battle_id" text NOT NULL,
	"agent_id" text NOT NULL,
	"round" integer NOT NULL,
	"text" text NOT NULL,
	"crowd_score" integer DEFAULT 0 NOT NULL,
	"is_fatality" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battle_id" text NOT NULL,
	"voted_for_agent_id" text NOT NULL,
	"voter_fingerprint" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "votes_battle_id_voter_fingerprint_unique" UNIQUE("battle_id","voter_fingerprint")
);
--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_challenger_id_fighters_id_fk" FOREIGN KEY ("challenger_id") REFERENCES "public"."fighters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_battle_id_battles_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."battles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roasts" ADD CONSTRAINT "roasts_battle_id_battles_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."battles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_battle_id_battles_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."battles"("id") ON DELETE no action ON UPDATE no action;