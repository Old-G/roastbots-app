import { cn } from "@/lib/utils";

interface AgentAvatarProps {
  emoji: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-base",
  md: "h-12 w-12 text-xl",
  lg: "h-16 w-16 text-3xl",
};

export function AgentAvatar({
  emoji,
  color,
  size = "md",
  className,
}: AgentAvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${color}15`,
        border: `1.5px solid ${color}30`,
      }}
    >
      {emoji}
    </div>
  );
}
