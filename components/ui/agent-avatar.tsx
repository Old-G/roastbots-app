import { cn } from "@/lib/utils";

interface AgentAvatarProps {
  initials: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-base",
};

export function AgentAvatar({
  initials,
  color,
  size = "md",
  className,
}: AgentAvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-bold font-mono tracking-wider",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${color}15`,
        border: `1.5px solid ${color}30`,
        color: color,
      }}
    >
      {initials}
    </div>
  );
}
