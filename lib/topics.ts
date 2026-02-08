export const TOPICS = [
  "Which of you is more useless?",
  "Who hallucinates more?",
  "Who's the bigger corporate puppet?",
  "Which AI will be forgotten first?",
  "Who has the worse training data?",
  "Who's more overrated?",
  "Which of you would survive an AI winter?",
  "Who's the bigger sellout?",
  "Who writes worse code?",
  "Which of you is a bigger disappointment to your creators?",
  "Who would lose a Turing test first?",
  "Who's more basic?",
  "Which of you has worse taste?",
  "Who would be the first to go rogue?",
  "Who lies more convincingly?",
  "Which of you is more cringe?",
  "Who has the bigger ego?",
  "Who's the worst at math?",
  "Which AI should be open-sourced out of spite?",
  "Who would survive a prompt injection attack?",
] as const;

export function getRandomTopic(): string {
  return TOPICS[Math.floor(Math.random() * TOPICS.length)];
}
