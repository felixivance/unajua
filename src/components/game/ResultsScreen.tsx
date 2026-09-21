"use client";

import { useEffect, useRef, useState } from "react";
import { completeGame, type GameResult } from "@/lib/game/actions";
import type { AnsweredQuestion } from "@/types/game";

type ResultsScreenProps = {
  gameId: string;
  categoryName: string;
  answers: AnsweredQuestion[];
};

export function ResultsScreen({ gameId, categoryName, answers }: ResultsScreenProps) {
  const [result, setResult] = useState<GameResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    completeGame(gameId)
      .then(setResult)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not save that game.");
      });
  }, [gameId]);

  const correctCount = result?.correctCount ?? answers.filter((a) => a.isCorrect).length;
  const totalQuestions = result?.totalQuestions ?? answers.length;
  const totalPoints = result?.score ?? answers.reduce((sum, a) => sum + a.pointsEarned, 0);
  const shareText = `🇰🇪 Tambua Kenya\nI scored ${correctCount}/${totalQuestions} on ${categoryName}!\nCan you beat me?`;

  async function handleShare() {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText, url: shareUrl });
        return;
      } catch {
        // user cancelled or share failed; fall back to clipboard
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert("Copied to clipboard!");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <div className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
        {categoryName}
      </div>
      <div className="text-6xl font-extrabold text-gray-900">
        {correctCount}/{totalQuestions}
      </div>
      <div className="text-lg font-medium text-gray-600">{totalPoints} points earned</div>
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex w-full flex-col gap-3">
        <button
          onClick={handleShare}
          className="rounded-full bg-red-600 px-10 py-3 text-lg font-bold text-white"
        >
          Challenge a friend
        </button>
        <a
          href="/play"
          className="rounded-full border-2 border-emerald-600 px-10 py-3 text-lg font-bold text-emerald-700"
        >
          Play again
        </a>
        <a href="/" className="text-sm text-gray-500 underline">
          Back to home
        </a>
      </div>
    </div>
  );
}
