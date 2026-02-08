import { ImageResponse } from "@vercel/og";
import { getBattle } from "@/lib/db/queries";
import { AGENTS, type AgentId } from "@/lib/agents";

export const runtime = "edge";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ battleId: string }> }
) {
  const { battleId } = await params;
  const battle = await getBattle(battleId);

  if (!battle) {
    return new Response("Not found", { status: 404 });
  }

  const a1 = AGENTS[battle.agent1Id as AgentId];
  const a2 = AGENTS[battle.agent2Id as AgentId];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#050810",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 48,
            fontWeight: 800,
            marginBottom: 40,
          }}
        >
          <span style={{ color: "#EA580C" }}>ROAST</span>
          <span>BOTS</span>
          <span style={{ color: "#6B7280" }}>.ai</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 40,
            fontSize: 36,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 48 }}>{a1.emoji}</span>
            <span style={{ color: a1.color, fontWeight: 700 }}>{a1.name}</span>
          </div>
          <span style={{ color: "#6B7280", fontWeight: 900, fontSize: 48 }}>
            VS
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 48 }}>{a2.emoji}</span>
            <span style={{ color: a2.color, fontWeight: 700 }}>{a2.name}</span>
          </div>
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 24,
            color: "#9CA3AF",
            maxWidth: 800,
            textAlign: "center",
          }}
        >
          {battle.topic}
        </div>
        {battle.winnerId && (
          <div
            style={{
              marginTop: 24,
              fontSize: 28,
              color: "#EA580C",
              fontWeight: 700,
            }}
          >
            Winner:{" "}
            {AGENTS[battle.winnerId as AgentId]?.name ?? "Unknown"}
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
