// Spec: docs/specs/results-screen.md
import type { AnsweredQuestion } from "@/types/game";

export type Tier = { key: "perfect" | "sharp" | "ok" | "try"; emoji: string; headline: string; sub: string };

export function resultTier(correct: number, total: number): Tier {
  if (total > 0 && correct === total)
    return { key: "perfect", emoji: "🏆", headline: "Perfect score!", sub: "Kenya's finest. You really know your stuff." };
  const ratio = total > 0 ? correct / total : 0;
  if (ratio >= 0.8) return { key: "sharp", emoji: "🔥", headline: "Sharp!", sub: "So close to perfect. One more run?" };
  if (ratio >= 0.5) return { key: "ok", emoji: "👏", headline: "Not bad!", sub: "You're warming up. Beat it next round." };
  return { key: "try", emoji: "💪", headline: "Good try!", sub: "Every legend started here. Go again." };
}

export type Cell = "correct" | "wrong" | "skipped";

export function resultGrid(answers: Pick<AnsweredQuestion, "isCorrect" | "submittedAnswer">[]): Cell[] {
  return answers.map((a) => (a.isCorrect ? "correct" : a.submittedAnswer === "SKIP" ? "skipped" : "wrong"));
}

const EMOJI: Record<Cell, string> = { correct: "🟩", wrong: "🟥", skipped: "⬜" };

export function rankLabel(rank: number) {
  return rank === 1 ? "#1 👑" : `#${rank}`;
}

export function shareText(o: {
  categoryName: string;
  grid: Cell[];
  correct: number;
  total: number;
  rank: number | null;
}) {
  const score = `${o.correct}/${o.total}${o.rank ? ` · #${o.rank} on the board` : ""}`;
  return `🇰🇪 Unajua: ${o.categoryName}\n${o.grid.map((c) => EMOJI[c]).join("")}\n${score}\nCan you beat me?`;
}
