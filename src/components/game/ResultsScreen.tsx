"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GameShell } from "./GameShell";
import { completeGame, type GameResult } from "@/lib/game/actions";
import { rankLabel, resultGrid, resultTier, shareText, type Cell } from "@/lib/game/results";
import { createClient } from "@/lib/supabase/client";
import type { AnsweredQuestion } from "@/types/game";

type ResultsScreenProps = {
  gameId: string;
  categoryName: string;
  categorySlug: string;
  answers: AnsweredQuestion[];
  handle: string;
};

type Rank = { rank: number; score: number; next_nickname: string | null; next_score: number | null };
type Ranks = { category: Rank | null; overall: Rank | null };

const CELL_CLASS: Record<Cell, string> = {
  correct: "bg-emerald-500",
  wrong: "bg-red-500",
  skipped: "bg-white/30",
};
const CONFETTI_COLORS = ["#dc2626", "#047857", "#111111", "#f59e0b"];

// Deterministic (no Math.random) so server and client markup agree.
function Confetti() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: 56 }, (_, i) => (
        <span
          key={i}
          className="confetti-piece rounded-[2px]"
          style={
            {
              left: `${(i * 37) % 100}%`,
              width: 6 + ((i * 7) % 6),
              height: 10 + ((i * 11) % 8),
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              "--delay": `${((i * 53) % 100) / 80}s`,
              "--dur": `${2.6 + ((i * 29) % 20) / 10}s`,
              "--drift": `${((i * 17) % 21) - 10}vw`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function ResultsScreen({ gameId, categoryName, categorySlug, answers, handle }: ResultsScreenProps) {
  const [result, setResult] = useState<GameResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ranks, setRanks] = useState<Ranks | null>(null);
  const [copied, setCopied] = useState(false);
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

  // Ranks only make sense once the game is saved as completed.
  useEffect(() => {
    if (!result) return;
    const supabase = createClient();
    const lookup = (slug: string | null) =>
      supabase
        .rpc("get_player_rank", { p_period: "all", p_category_slug: slug, p_nickname: handle })
        .then(({ data }) => ((data ?? []) as Rank[])[0] ?? null);
    Promise.all([lookup(categorySlug), lookup(null)])
      .then(([category, overall]) => setRanks({ category, overall }))
      .catch(() => setRanks({ category: null, overall: null }));
  }, [result, categorySlug, handle]);

  const correctCount = result?.correctCount ?? answers.filter((a) => a.isCorrect).length;
  const totalQuestions = result?.totalQuestions ?? answers.length;
  const totalPoints = result?.score ?? answers.reduce((sum, a) => sum + a.pointsEarned, 0);
  const tier = resultTier(correctCount, totalQuestions);
  const grid = resultGrid(answers);
  const hasRanks = !!(ranks?.category || ranks?.overall);
  const chase = ranks?.overall?.next_nickname && ranks.overall.next_score !== null ? ranks.overall : null;

  const text = shareText({
    categoryName,
    grid,
    correct: correctCount,
    total: totalQuestions,
    rank: ranks?.category?.rank ?? null,
  });
  const url = typeof window !== "undefined" ? window.location.href : "";

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text, url });
        return;
      } catch {
        // cancelled or unsupported: fall back to clipboard
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <GameShell>
      {tier.key === "perfect" && <Confetti />}
      <div className="flex flex-1 flex-col gap-4 pb-2">
        {/* Hero: dark band with the flag-stripe texture from the landing page */}
        <section className="game-pop relative overflow-hidden rounded-3xl bg-stone-950 px-6 pb-7 pt-8 text-center text-white shadow-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-[-25%] w-[70%] opacity-60"
            style={{
              background:
                "repeating-linear-gradient(115deg, #dc2626 0px, #dc2626 28px, #000 28px, #000 56px, #047857 56px, #047857 84px)",
              maskImage: "linear-gradient(to left, black 10%, transparent 80%)",
              WebkitMaskImage: "linear-gradient(to left, black 10%, transparent 80%)",
            }}
          />
          <div className="relative flex flex-col items-center gap-2">
            <span className="text-5xl" aria-hidden>
              {tier.emoji}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">{tier.headline}</h1>
            <p className="max-w-xs text-sm text-stone-300">{tier.sub}</p>

            <div className="mt-3 text-7xl font-black tabular-nums leading-none">
              {correctCount}
              <span className="text-stone-500">/{totalQuestions}</span>
            </div>
            <p className="text-sm font-semibold text-emerald-300">
              {totalPoints} points · {categoryName}
            </p>

            <div className="mt-2 flex gap-1.5" role="img" aria-label={`${correctCount} of ${totalQuestions} correct`}>
              {grid.map((cell, i) => (
                <span
                  key={i}
                  className={`game-tile-in h-3.5 w-3.5 rounded-[4px] ${CELL_CLASS[cell]}`}
                  style={{ animationDelay: `${200 + i * 70}ms` }}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-stone-400">
              On the board as <span className="font-semibold text-white">{handle}</span>
            </p>
          </div>
        </section>

        {error && (
          <p role="alert" className="text-center text-sm text-red-700">
            {error}
          </p>
        )}

        {/* Where you stand */}
        {!error && (ranks === null || hasRanks) && (
          <section
            className="game-pop grid grid-cols-2 gap-3 [animation-delay:120ms]"
            aria-label="Your global rank"
            aria-busy={ranks === null}
          >
            {[
              { label: `In ${categoryName}`, rank: ranks?.category },
              { label: "Overall", rank: ranks?.overall },
            ].map(({ label, rank }) => (
              <div key={label} className="flex flex-col items-center gap-0.5 rounded-2xl border border-stone-200 bg-white px-3 py-4 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-500">{label}</span>
                {ranks === null ? (
                  <span className="h-9 w-16 animate-pulse rounded-lg bg-stone-200" />
                ) : (
                  <span className="text-3xl font-black text-stone-900">{rank ? rankLabel(rank.rank) : "—"}</span>
                )}
                <span className="text-xs text-stone-400">globally</span>
              </div>
            ))}
          </section>
        )}

        {chase && (
          <Link
            href="/play"
            className="game-pop rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-900 [animation-delay:200ms] hover:bg-emerald-100"
          >
            <span className="font-bold">{chase.next_score! - chase.score} pts behind {chase.next_nickname}.</span>{" "}
            Play another category to catch up →
          </Link>
        )}

        {/* Share: WhatsApp first, it is where Kenyans share */}
        <section className="game-pop flex flex-col gap-3 [animation-delay:260ms]">
          <p className="text-center text-sm font-semibold text-stone-600">Think your friends can beat that?</p>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="grid min-h-14 place-items-center rounded-full bg-[#128C4A] text-lg font-bold text-white shadow-[0_10px_24px_rgba(18,140,74,0.28)] hover:brightness-110 active:scale-[0.98]"
          >
            Challenge friends on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => void handleShare()}
            className="min-h-12 rounded-full border-2 border-stone-300 bg-white font-bold text-stone-800 hover:bg-stone-100 active:scale-[0.98]"
          >
            {copied ? "Copied!" : "Share or copy result"}
          </button>
        </section>

        <div className="flex flex-col gap-2">
          <Link
            href={`/play/${categorySlug}`}
            className="grid min-h-14 place-items-center rounded-full bg-red-600 text-lg font-bold text-white shadow-[0_10px_24px_rgba(220,38,38,0.28)] hover:bg-red-500 active:scale-[0.98]"
          >
            Play again
          </Link>
          <Link
            href="/play"
            className="grid min-h-12 place-items-center rounded-full border-2 border-emerald-700 font-bold text-emerald-800 hover:bg-emerald-50"
          >
            Try another category
          </Link>
          <Link href="/" className="grid min-h-11 place-items-center text-sm font-semibold text-stone-500 underline">
            Back to home
          </Link>
        </div>
      </div>
    </GameShell>
  );
}
