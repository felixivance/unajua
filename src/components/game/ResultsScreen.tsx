"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { completeGame, type GameResult } from "@/lib/game/actions";
import {
  rankLabel,
  resultGrid,
  resultTier,
  shareText,
  type Cell,
} from "@/lib/game/results";
import { createClient } from "@/lib/supabase/client";
import type { AnsweredQuestion } from "@/types/game";

type ResultsScreenProps = {
  gameId: string;
  categoryName: string;
  categorySlug: string;
  answers: AnsweredQuestion[];
  handle: string;
};

type Rank = {
  rank: number;
  score: number;
  next_nickname: string | null;
  next_score: number | null;
};
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
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
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

export function ResultsScreen({
  gameId,
  categoryName,
  categorySlug,
  answers,
  handle,
}: ResultsScreenProps) {
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
        setError(
          err instanceof Error ? err.message : "Could not save that game.",
        );
      });
  }, [gameId]);

  // Ranks only make sense once the game is saved as completed.
  useEffect(() => {
    if (!result) return;
    const supabase = createClient();
    const lookup = (slug: string | null) =>
      supabase
        .rpc("get_player_rank", {
          p_period: "all",
          p_category_slug: slug,
          p_nickname: handle,
        })
        .then(({ data }) => ((data ?? []) as Rank[])[0] ?? null);
    Promise.all([lookup(categorySlug), lookup(null)])
      .then(([category, overall]) => setRanks({ category, overall }))
      .catch(() => setRanks({ category: null, overall: null }));
  }, [result, categorySlug, handle]);

  const correctCount =
    result?.correctCount ?? answers.filter((a) => a.isCorrect).length;
  const totalQuestions = result?.totalQuestions ?? answers.length;
  const totalPoints =
    result?.score ?? answers.reduce((sum, a) => sum + a.pointsEarned, 0);
  const tier = resultTier(correctCount, totalQuestions);
  const grid = resultGrid(answers);
  const hasRanks = !!(ranks?.category || ranks?.overall);
  const chase =
    ranks?.overall?.next_nickname && ranks.overall.next_score !== null
      ? ranks.overall
      : null;

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
    <div className="flex min-h-dvh flex-col bg-white">
      {tier.key === "perfect" && <Confetti />}

      {/* Hero: dark band, flag-stripe texture, oversized type (same recipe as the home page) */}
      <section className="relative overflow-hidden bg-stone-950">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-[-10%] w-[55%] opacity-90"
          style={{
            background:
              "repeating-linear-gradient(115deg, #dc2626 0px, #dc2626 40px, #000 40px, #000 80px, #047857 80px, #047857 120px)",
            maskImage: "linear-gradient(to left, black 20%, transparent 85%)",
            WebkitMaskImage:
              "linear-gradient(to left, black 20%, transparent 85%)",
          }}
        />

        <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6 sm:px-6">
          <Link
            href="/"
            className="text-lg font-extrabold tracking-tight text-white"
          >
            Unajua
          </Link>
          <Link
            href="/play"
            className="rounded-full border border-white/25 px-4 py-1.5 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/10"
          >
            ← Categories
          </Link>
        </header>

        <div className="relative mx-auto grid w-full max-w-5xl items-center gap-10 px-4 pb-16 pt-4 sm:px-6 sm:pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6">
          <div className="game-pop flex flex-col gap-5">
            <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-300">
              {tier.emoji} {categoryName}
            </span>
            <h1 className="text-5xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-7xl">
              {tier.headline}
            </h1>
            <p className="max-w-md text-lg text-stone-300">{tier.sub}</p>

            <div className="flex items-end gap-4">
              <div className="text-7xl font-black tabular-nums leading-none text-white">
                {correctCount}
                <span className="text-red-500">/{totalQuestions}</span>
              </div>
              <p className="pb-1 text-sm font-semibold text-emerald-300">
                {totalPoints} points
              </p>
            </div>

            <div
              className="flex gap-1.5"
              role="img"
              aria-label={`${correctCount} of ${totalQuestions} correct`}
            >
              {grid.map((cell, i) => (
                <span
                  key={i}
                  className={`game-tile-in h-4 w-4 rounded-[4px] ${CELL_CLASS[cell]}`}
                  style={{ animationDelay: `${200 + i * 70}ms` }}
                />
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href={`/play/${categorySlug}`}
                className="rounded-full bg-red-600 px-8 py-3.5 text-lg font-bold text-white shadow-xl shadow-red-950/40 transition hover:-translate-y-0.5 hover:bg-red-500 active:scale-[0.98]"
              >
                Play again
              </Link>
              <Link
                href="/play"
                className="rounded-full border border-white/25 px-8 py-3.5 text-lg font-bold text-white transition hover:border-white/50 hover:bg-white/10"
              >
                Another category
              </Link>
            </div>
            <p className="text-xs text-stone-400">
              On the board as{" "}
              <span className="font-semibold text-white">{handle}</span>
            </p>
            {error && (
              <p role="alert" className="text-sm text-red-300">
                {error}
              </p>
            )}
          </div>

          {/* Where you stand: glass card like the home page's rebus mark */}
          {!error && (ranks === null || hasRanks) && (
            <section
              className="game-pop flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm [animation-delay:120ms]"
              aria-label="Your global rank"
              aria-busy={ranks === null}
            >
              <h2 className="text-xs font-bold uppercase tracking-wide text-stone-400">
                Where you stand
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: categoryName, rank: ranks?.category },
                  { label: "Overall", rank: ranks?.overall },
                ].map(({ label, rank }) => (
                  <div
                    key={label}
                    className="flex flex-col gap-1 rounded-xl bg-white px-4 py-4 text-stone-900"
                  >
                    <span className="truncate text-xs font-bold uppercase tracking-wide text-stone-500">
                      {label}
                    </span>
                    {ranks === null ? (
                      <span className="h-10 w-16 animate-pulse rounded-lg bg-stone-200" />
                    ) : (
                      <span className="text-4xl font-black">
                        {rank ? rankLabel(rank.rank) : "—"}
                      </span>
                    )}
                    <span className="text-xs text-stone-400">globally</span>
                  </div>
                ))}
              </div>
              {chase && (
                <Link
                  href="/play"
                  className="text-sm text-stone-300 hover:text-white"
                >
                  <span className="font-bold text-emerald-300">
                    {chase.next_score! - chase.score} pts behind{" "}
                    {chase.next_nickname}.
                  </span>{" "}
                  Play another category to catch up →
                </Link>
              )}
            </section>
          )}
        </div>
      </section>

      {/* Share: tinted dot-grid band */}
      <Reveal>
        <section className="bg-dot-grid bg-emerald-50 py-16 sm:py-20">
          <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              <h2 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">
                Think your friends can beat that?
              </h2>
              <p className="text-stone-600">
                Send them your result. They see the score, not the answers, and
                the board does the rest.
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid min-h-14 place-items-center rounded-full bg-[#128C4A] px-8 text-lg font-bold text-white shadow-[0_10px_24px_rgba(18,140,74,0.28)] transition hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]"
                >
                  Challenge on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => void handleShare()}
                  className="min-h-14 rounded-full border-2 border-stone-300 bg-white px-8 font-bold text-stone-800 transition hover:bg-stone-100 active:scale-[0.98]"
                >
                  {copied ? "Copied!" : "Share or copy"}
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap rounded-2xl border border-emerald-100 bg-white p-6 font-sans text-lg leading-relaxed text-stone-800 shadow-sm">
              {text}
            </pre>
          </div>
        </section>
      </Reveal>

      {/* Closing CTA banner */}
      <Reveal>
        <section className="bg-red-600 py-16 sm:py-20">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-4 text-center sm:px-6">
            <h2 className="max-w-lg text-3xl font-extrabold text-white sm:text-4xl">
              Ready for another round?
            </h2>
            <Link
              href="/play"
              className="rounded-full bg-white px-10 py-4 text-lg font-bold text-red-600 shadow-lg transition hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Pick a category
            </Link>
          </div>
        </section>
      </Reveal>

      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-400">
        Unajua, made in Kenya 🇰🇪
      </footer>
    </div>
  );
}
