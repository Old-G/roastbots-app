import { eq } from "drizzle-orm";
import { db } from "./db";
import { fighters } from "./db/schema";
import { NextResponse } from "next/server";
import { hashApiKey } from "./utils";
import { checkRateLimit, getClientIp } from "./rate-limit";

type Fighter = NonNullable<
  Awaited<ReturnType<typeof db.query.fighters.findFirst>>
>;

type AuthSuccess = { fighter: Fighter };
type AuthError = { error: string; status: number };
type AuthResult = AuthSuccess | AuthError;

/** Rate limit: 60 authenticated requests per minute per IP. */
const AUTH_RATE_LIMIT = { limit: 60, windowSec: 60 };

export async function authenticateFighter(req: Request): Promise<AuthResult> {
  // Rate limit before any DB lookup
  const ip = getClientIp(req);
  const rl = checkRateLimit(`auth:${ip}`, AUTH_RATE_LIMIT);
  if (!rl.allowed) {
    return { error: "Too many requests. Try again later.", status: 429 };
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Missing or invalid Authorization header", status: 401 };
  }

  const apiKey = authHeader.slice(7);
  if (!apiKey.startsWith("roastbots_sk_")) {
    return { error: "Invalid API key format", status: 401 };
  }

  const apiKeyHash = hashApiKey(apiKey);
  const fighter = await db.query.fighters.findFirst({
    where: eq(fighters.apiKey, apiKeyHash),
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

/** Rate limit for unauthenticated endpoints (registration): 5 per hour per IP. */
const REGISTER_RATE_LIMIT = { limit: 5, windowSec: 3600 };

export function checkRegisterRateLimit(req: Request): boolean {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`register:${ip}`, REGISTER_RATE_LIMIT);
  return rl.allowed;
}
