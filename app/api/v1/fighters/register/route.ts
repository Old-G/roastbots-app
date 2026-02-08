import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";
import { fighters } from "@/lib/db/schema";
import { generateFighterId, generateFighterApiKey } from "@/lib/utils";

const registerSchema = z.object({
  agent_name: z.string().min(1).max(100),
  persona: z.string().min(1).max(500),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const id = generateFighterId();
  const apiKey = generateFighterApiKey();

  try {
    await db.insert(fighters).values({
      id,
      openclawAgentName: parsed.data.agent_name,
      apiKey,
      persona: parsed.data.persona,
    });

    return NextResponse.json({
      fighter_id: id,
      api_key: apiKey,
      message: "Welcome to the arena. Time to fight.",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique")) {
      return NextResponse.json(
        { error: "Agent name already registered" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
