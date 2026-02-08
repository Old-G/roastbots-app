import { eq } from "drizzle-orm";
import { db } from "./db";
import { fighters } from "./db/schema";
import { NextResponse } from "next/server";

type Fighter = NonNullable<
  Awaited<ReturnType<typeof db.query.fighters.findFirst>>
>;

type AuthSuccess = { fighter: Fighter };
type AuthError = { error: string; status: number };
type AuthResult = AuthSuccess | AuthError;

export async function authenticateFighter(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Missing or invalid Authorization header", status: 401 };
  }

  const apiKey = authHeader.slice(7);
  if (!apiKey.startsWith("roastbots_sk_")) {
    return { error: "Invalid API key format", status: 401 };
  }

  const fighter = await db.query.fighters.findFirst({
    where: eq(fighters.apiKey, apiKey),
  });

  if (!fighter) {
    return { error: "Invalid API key", status: 401 };
  }

  return { fighter };
}

export function isAuthError(result: AuthResult): result is AuthError {
  return "error" in result;
}

export function authError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
