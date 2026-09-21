"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GameShell } from "./GameShell";
import { completeGame, type GameResult } from "@/lib/game/actions";
import type { AnsweredQuestion } from "@/types/game";

type ResultsScreenProps = {
  gameId: string;
  categoryName: string;
  answers: AnsweredQuestion[];
  handle: string;
};

export function ResultsScreen({ gameId, categoryName, answers, handle }: ResultsScreenProps) {
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
    <GameShell>
      <div className="game-pop flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <h1 className="text-6xl font-extrabold tracking-tight text-stone-900">
          {correctCount}/{totalQuestions}
        </h1>
        <p className="text-lg font-semibold text-stone-600">{totalPoints} points on {categoryName}</p>
        <p className="text-sm text-stone-500">
          On the board as <span className="font-semibold text-stone-800">{handle}</span>
        </p>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex w-full max-w-sm flex-col gap-3">
          <button
            type="button"
            onClick={() => void handleShare()}
            className="min-h-14 rounded-full bg-red-600 text-lg font-bold text-white shadow-[0_10px_24px_rgba(220,38,38,0.28)] hover:bg-red-500 active:scale-[0.98]"
          >
            Challenge a friend
          </button>
          <Link
            href="/play"
            className="grid min-h-14 place-items-center rounded-full border-2 border-emerald-700 text-lg font-bold text-emerald-800 hover:bg-emerald-50"
          >
            Play again
          </Link>
          <Link href="/" className="min-h-11 text-sm font-semibold text-stone-500 underline">
            Back to home
          </Link>
        </div>
      </div>
    </GameShell>
  );
}
