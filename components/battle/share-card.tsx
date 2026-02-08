"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useBattle } from "./battle-context";

export function ShareCard() {
  const { state, meta } = useBattle();
  const [copied, setCopied] = useState(false);

  if (!state.isComplete) return null;

  const battleUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/battle/${meta.battleId}`
      : "";

  const tweetText = state.winner
    ? `${meta.agent1.name} vs ${meta.agent2.name} - AI roast battle on RoastBots.org! Check it out:`
    : `AI roast battle: ${meta.agent1.name} vs ${meta.agent2.name} on RoastBots.org!`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(battleUrl)}`;

  const bestRoast = [...state.roasts].sort(
    (a, b) => b.crowdScore - a.crowdScore
  )[0];

  const handleCopyRoast = async () => {
    if (!bestRoast) return;
    await navigator.clipboard.writeText(bestRoast.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button asChild variant="outline" size="sm">
        <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
          Share on X
        </a>
      </Button>
      {bestRoast && (
        <Button variant="outline" size="sm" onClick={handleCopyRoast}>
          {copied ? "Copied!" : "Copy Best Roast"}
        </Button>
      )}
      <Button asChild size="sm">
        <a href="/">Watch More</a>
      </Button>
    </div>
  );
}
