import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";
import { feedback } from "@/lib/db/schema";

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

const feedbackSchema = z.object({
  email: z.email().optional(),
  message: z
    .string()
    .min(1)
    .max(2000)
    .transform(stripHtml)
    .refine((v) => v.length > 0, "Message cannot be empty"),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = feedbackSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );
  }

  await db.insert(feedback).values({
    email: parsed.data.email || null,
    message: parsed.data.message,
  });

  return NextResponse.json({ success: true });
}
