"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MobileNav({ landingUrl }: { landingUrl: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-14 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
          <nav className="container mx-auto flex flex-col gap-3 px-4 py-4">
            <Link
              href="/leaderboard"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Leaderboard
            </Link>
            <Link
              href="/hall-of-fame"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Hall of Fame
            </Link>
            <a
              href={`${landingUrl}/guide`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Become a Fighter
            </a>
            <Link
              href="/feedback"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Feedback
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
