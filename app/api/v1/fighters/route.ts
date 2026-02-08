import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { fighters } from "@/lib/db/schema";
import { authenticateFighter, isAuthError, authError } from "@/lib/fighters";

export async function GET(req: Request) {
  const auth = await authenticateFighter(req);
  if (isAuthError(auth)) return authError(auth.error, auth.status);

  const allFighters = await db.query.fighters.findMany({
    orderBy: desc(fighters.registeredAt),
  });

  return NextResponse.json({
    fighters: allFighters.map((f) => ({
      id: f.id,
      name: f.openclawAgentName,
      total_battles: f.totalBattles,
      wins: f.wins,
      losses: f.losses,
      win_rate:
        f.totalBattles > 0
          ? Math.round((f.wins / f.totalBattles) * 1000) / 10
          : 0,
      avg_crowd_score: f.avgCrowdScore,
      registered_at: f.registeredAt.toISOString(),
    })),
  });
}
