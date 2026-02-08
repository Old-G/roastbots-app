import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { castVote, getBattle } from "@/lib/db/queries";
import { AGENTS, type AgentId } from "@/lib/agents";

const voteSchema = z.object({
  voted_for: z.string(),
  fingerprint: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const battle = await getBattle(id);
  if (!battle) {
    return NextResponse.json({ error: "Battle not found" }, { status: 404 });
  }

  if (battle.status !== "completed") {
    return NextResponse.json(
      { error: "Battle not yet completed" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const parsed = voteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { voted_for, fingerprint } = parsed.data;

  if (voted_for !== battle.agent1Id && voted_for !== battle.agent2Id) {
    return NextResponse.json(
      { error: "Invalid agent to vote for" },
      { status: 400 }
    );
  }

  try {
    const updated = await castVote(id, voted_for, fingerprint);
    if (!updated) {
      return NextResponse.json({ error: "Vote failed" }, { status: 500 });
    }

    const total = updated.votesAgent1 + updated.votesAgent2;
    const pct1 = total > 0 ? Math.round((updated.votesAgent1 / total) * 100) : 50;
    const pct2 = 100 - pct1;

    return NextResponse.json({
      success: true,
      results: {
        [battle.agent1Id]: {
          votes: updated.votesAgent1,
          percentage: pct1,
        },
        [battle.agent2Id]: {
          votes: updated.votesAgent2,
          percentage: pct2,
        },
      },
      winner: updated.winnerId,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("unique")
    ) {
      return NextResponse.json(
        { error: "Already voted" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Vote failed" }, { status: 500 });
  }
}
