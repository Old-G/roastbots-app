import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Logo />
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/leaderboard"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Leaderboard
          </Link>
          <Link
            href="/hall-of-fame"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Hall of Fame
          </Link>
          <Link
            href="/battle/new"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Fighters
          </Link>
        </nav>
      </div>
    </header>
  );
}
