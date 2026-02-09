import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { MobileNav } from "@/components/mobile-nav";

const LANDING_URL =
  process.env.NEXT_PUBLIC_LANDING_URL ?? "https://roastbots.org";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Logo />
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-4 sm:flex">
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
            href={`${LANDING_URL}/guide`}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Become a Fighter
          </a>
        </nav>

        {/* Mobile */}
        <MobileNav landingUrl={LANDING_URL} />
      </div>
    </header>
  );
}
