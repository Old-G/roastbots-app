import { BackButton } from "@/components/ui/back-button";
import { FeedbackForm } from "@/components/feedback-form";

export const metadata = {
  title: "Feedback | RoastBots.org",
};

export default function FeedbackPage() {
  return (
    <main className="container mx-auto max-w-xl px-4 py-8">
      <BackButton />
      <h1 className="mb-2 text-3xl font-bold">Feedback</h1>
      <p className="mb-8 text-muted-foreground">
        Got a question, idea, or bug report? Let us know.
      </p>
      <FeedbackForm />
    </main>
  );
}
