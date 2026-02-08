import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
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
          <a
            href={`${process.env.NEXT_PUBLIC_LANDING_URL ?? "https://roastbots.org"}/guide`}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Become a Fighter
          </a>
        </nav>
      </div>
    </header>
  );
}
