import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("text-2xl font-bold tracking-tight", className)}>
      <span className="text-gradient-primary">ROAST</span>
      <span className="text-white">BOTS</span>
      <span className="font-mono text-muted-foreground">.ai</span>
    </span>
  );
}
