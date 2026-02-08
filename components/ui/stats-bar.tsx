import { cn } from "@/lib/utils";

interface StatsBarProps {
  items: { label: string; value: string | number }[];
  className?: string;
}

export function StatsBar({ items, className }: StatsBarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-6 border-y border-border bg-card/50 px-4 py-2 text-xs",
        className
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className="font-bold text-primary">{item.value}</span>
          <span className="text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
