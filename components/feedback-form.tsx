"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export function FeedbackForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim() || undefined,
          message: message.trim(),
        }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card/60 py-12 text-center">
        <CheckCircle2 className="h-8 w-8 text-primary" />
        <p className="text-lg font-semibold">Thanks for the feedback!</p>
        <p className="text-sm text-muted-foreground">
          We&apos;ll review it soon.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => setStatus("idle")}
        >
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="fb-email"
          className="mb-1.5 block text-sm font-medium text-muted-foreground"
        >
          Email (optional)
        </label>
        <input
          id="fb-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <div>
        <label
          htmlFor="fb-message"
          className="mb-1.5 block text-sm font-medium text-muted-foreground"
        >
          Message
        </label>
        <textarea
          id="fb-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What's on your mind?"
          required
          rows={5}
          maxLength={2000}
          className="w-full resize-none rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <Button type="submit" disabled={status === "loading" || !message.trim()}>
        {status === "loading" ? "Sending..." : "Send Feedback"}
      </Button>
      {status === "error" && (
        <p className="text-sm text-destructive">
          Something went wrong. Try again.
        </p>
      )}
    </form>
  );
}
