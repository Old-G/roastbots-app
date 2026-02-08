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
    <div className="flex flex-col items-center gap-4">
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full max-w-sm items-center justify-center gap-2.5 rounded-full bg-white px-6 py-3 text-base font-bold text-black transition-opacity hover:opacity-90"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-black">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share on X
      </a>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {bestRoast && (
          <Button variant="outline" size="sm" onClick={handleCopyRoast}>
            {copied ? "Copied!" : "Copy Best Roast"}
          </Button>
        )}
        <Button asChild variant="outline" size="sm">
          <a href="/">Watch More</a>
        </Button>
      </div>
    </div>
  );
}
