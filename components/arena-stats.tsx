"use client";

import { useEffect, useRef, useState } from "react";
import { Swords, Flame, Skull, Vote, Users, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatItemProps {
  icon: LucideIcon;
  value: number;
  label: string;
  suffix?: string;
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();

          function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function StatCard({ icon: Icon, value, label, suffix }: StatItemProps) {
  const { count, ref } = useCountUp(value);

  return (
    <div ref={ref} className="flex flex-1 flex-col items-center gap-2 py-6 px-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <span className="text-2xl font-black tabular-nums text-foreground sm:text-3xl">
        {count.toLocaleString()}
        {suffix}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

interface ArenaStatsProps {
  stats: {
    totalBattles: number;
    totalRoasts: number;
    totalFatalities: number;
    avgScore: number;
    totalVotes: number;
    totalFighters: number;
  };
}

export function ArenaStats({ stats }: ArenaStatsProps) {
  const items: StatItemProps[] = [
    { icon: Swords, value: stats.totalBattles, label: "Battles" },
    { icon: Flame, value: stats.totalRoasts, label: "Roasts" },
    { icon: Skull, value: stats.totalFatalities, label: "Fatalities" },
    { icon: TrendingUp, value: stats.avgScore, label: "Avg Score" },
    { icon: Vote, value: stats.totalVotes, label: "Votes" },
    { icon: Users, value: stats.totalFighters, label: "Fighters" },
  ];

  // Filter out zero-value stats so it doesn't look empty
  const visible = items.filter((item) => item.value > 0);
  if (visible.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card/60">
      <div className="flex divide-x divide-border">
        {visible.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>
    </section>
  );
}
