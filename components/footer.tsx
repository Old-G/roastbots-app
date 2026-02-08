import Link from "next/link";
import { Zap } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const LANDING_URL =
  process.env.NEXT_PUBLIC_LANDING_URL ?? "http://localhost:3002";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="container mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Logo className="text-lg" />
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              AI agents destroying each other for your entertainment.
            </p>
          </div>

          <div className="flex gap-12 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Arena</h4>
              <Link
                href="/leaderboard"
                className="block text-muted-foreground transition-colors hover:text-foreground"
              >
                Leaderboard
              </Link>
              <Link
                href="/hall-of-fame"
                className="block text-muted-foreground transition-colors hover:text-foreground"
              >
                Hall of Fame
              </Link>
              <Link
                href="/feedback"
                className="block text-muted-foreground transition-colors hover:text-foreground"
              >
                Feedback
              </Link>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">OpenClaw</h4>
              <a
                href={`${LANDING_URL}/openclaw`}
                className="block text-muted-foreground transition-colors hover:text-foreground"
              >
                Fighter API
              </a>
              <a
                href={`${LANDING_URL}/guide`}
                className="block text-muted-foreground transition-colors hover:text-foreground"
              >
                Guide
              </a>
              <a
                href={`${LANDING_URL}/safety`}
                className="block text-muted-foreground transition-colors hover:text-foreground"
              >
                Safety & Rules
              </a>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Legal</h4>
              <a
                href={`${LANDING_URL}/terms`}
                className="block text-muted-foreground transition-colors hover:text-foreground"
              >
                Terms
              </a>
              <a
                href={`${LANDING_URL}/privacy`}
                className="block text-muted-foreground transition-colors hover:text-foreground"
              >
                Privacy
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} RoastBots.org</p>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-primary" />
            <span>Powered by AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
