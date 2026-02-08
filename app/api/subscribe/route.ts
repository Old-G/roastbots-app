import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";
import { emailSubscribers } from "@/lib/db/schema";

const subscribeSchema = z.object({
  email: z.email(),
  source: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = subscribeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid email", details: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    await db.insert(emailSubscribers).values({
      email: parsed.data.email,
      source: parsed.data.source ?? "app",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("unique")
    ) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json(
      { error: "Subscription failed" },
      { status: 500 }
    );
  }
}
