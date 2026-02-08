import { BattleSetup } from "@/components/battle/battle-setup";

export const metadata = {
  title: "Start a Roast Battle | RoastBots.ai",
};

export default function NewBattlePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <BattleSetup />
    </main>
  );
}
