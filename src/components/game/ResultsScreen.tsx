"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AnsweredQuestion } from "@/types/game";

type ResultsScreenProps = {
  categoryId: string;
  categoryName: string;
  answers: AnsweredQuestion[];
  nickname: string;
};

export function ResultsScreen({ categoryId, categoryName, answers, nickname }: ResultsScreenProps) {
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const totalPoints = answers.reduce((sum, a) => sum + a.pointsEarned, 0);
  const shareText = `🇰🇪 Tambua Kenya\nI scored ${correctCount}/${answers.length} on ${categoryName}!\nCan you beat me?`;

  const savedRef = useRef(false);

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    const supabase = createClient();
    supabase
      .from("games")
      .insert({
        category_id: categoryId,
        score: totalPoints,
        total_questions: answers.length,
        guest_nickname: nickname,
        completed_at: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) console.error("Failed to save game", error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {correctCount}/{answers.length}
      </div>
      <div className="text-lg font-medium text-gray-600">{totalPoints} points earned</div>

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
