"use client";

import { useEffect, useState } from "react";
import { GameScreen } from "./GameScreen";
import Link from "next/link";
import { iconForCategory } from "@/lib/game/categoryIcons";
import { claimNickname, resumeGame, startGame, type GameSession } from "@/lib/game/actions";
import type { ResumedGame } from "@/lib/game/resume";
import { clearGameId, loadGameId, saveGameId } from "@/lib/game/resume";
import {
  generateUniqueHandle,
  getOrCreateToken,
  getStoredNickname,
  storeNickname,
} from "@/lib/game/nickname";

type GameContainerProps = {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  description: string | null;
  leader: { nickname: string; score: number } | null;
};

export function GameContainer({
  categoryId,
  categoryName,
  categorySlug,
  description,
  leader,
}: GameContainerProps) {
  const [handle, setHandle] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<GameSession | ResumedGame | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [renameError, setRenameError] = useState<string | null>(null);

  useEffect(() => {
    const token = getOrCreateToken();
    const stored = getStoredNickname();
    (async () => {
      let next = stored;
      try {
        // Claim the stored name (older players never did); if it is taken, pick a fresh one.
        if (!next || !(await claimNickname(next, token))) {
          next = await generateUniqueHandle((h) => claimNickname(h, token));
          storeNickname(next);
        }
      } catch {
        // Offline or server error: keep what we have; start_game re-checks the claim.
      }
      setHandle(next);
      setDraft(next ?? "");

      // Pick up an in-progress game; the server decides if it is still valid.
      const savedId = loadGameId(categorySlug);
      if (savedId && next) {
        try {
          const resumed = await resumeGame(savedId, token);
          if (resumed) setSession(resumed);
          else clearGameId(categorySlug);
        } catch {
          // Offline: leave the saved id for the next load.
        }
      }
      setHydrated(true); // after resume, so Start can't race a restored game
    })();
  }, [categorySlug]);

  async function saveHandle(value: string) {
    const trimmed = value.trim().slice(0, 24);
    if (!trimmed) return;
    setRenameError(null);
    try {
      if (!(await claimNickname(trimmed, getOrCreateToken()))) {
        setRenameError("That nickname is taken");
        return;
      }
    } catch (err) {
      setRenameError(
        err instanceof Error ? err.message : "Could not save that name.",
      );
      return;
    }
    storeNickname(trimmed);
    setHandle(trimmed);
    setDraft(trimmed);
    setRenaming(false);
  }

  async function handleStart() {
    if (!handle || starting) return;
    setStarting(true);
    setStartError(null);
    try {
      const next = await startGame(categoryId, handle, getOrCreateToken());
      saveGameId(categorySlug, next.gameId);
      setSession(next);
    } catch (err) {
      setStartError(
        err instanceof Error ? err.message : "Could not start the game.",
      );
      setStarting(false);
    }
  }

  if (session && handle) {
    return (
      <GameScreen
        gameId={session.gameId}
        categoryName={categoryName}
        categorySlug={categorySlug}
        questions={session.questions}
        initialAnswers={"answers" in session ? session.answers : undefined}
        initialRemainingMs={"remainingMs" in session ? session.remainingMs : undefined}
        handle={handle}
      />
    );
  }

  return (
    <div className="game-root flex min-h-dvh flex-col bg-white">
      {/* Hero: same dark flag-stripe band as the home page */}
      <section className="relative flex-1 overflow-hidden bg-stone-950">
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
              {iconForCategory(categorySlug)} Ready?
            </span>
            <h1 className="text-5xl font-extrabold leading-[1.02] tracking-tight text-white text-balance sm:text-7xl">
              {categoryName}
            </h1>
            {description && (
              <p className="max-w-md text-lg text-stone-300">{description}</p>
            )}

            <ul className="flex flex-wrap gap-2 text-sm font-bold text-white">
              {["10 questions", "60 seconds each", "100 pts per answer"].map(
                (chip) => (
                  <li
                    key={chip}
                    className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5"
                  >
                    {chip}
                  </li>
                ),
              )}
            </ul>

            {leader && (
              <p className="text-sm text-stone-300">
                🏆 Top score here:{" "}
                <span className="font-bold text-white">{leader.score} pts</span>{" "}
                by{" "}
                <span className="font-bold text-white">{leader.nickname}</span>.
                Think you can match it?
              </p>
            )}
          </div>

          {/* Player card: glass like the home page's rebus mark */}
          <div className="game-pop flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm [animation-delay:120ms]">
            <h2 className="text-xs font-bold uppercase tracking-wide text-stone-400">
              Your name on the board
            </h2>
            <div className="rounded-xl bg-white px-5 py-4">
              {renaming ? (
                <form
                  className="flex flex-col gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void saveHandle(draft);
                  }}
                >
                  <label className="sr-only" htmlFor="nickname">
                    Your name on the board
                  </label>
                  <input
                    id="nickname"
                    autoFocus
                    value={draft}
                    maxLength={24}
                    onChange={(e) => setDraft(e.target.value)}
                    className="rounded-lg border border-stone-300 px-3 py-2.5 text-center text-lg font-semibold text-stone-900 outline-none placeholder:text-stone-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                  {renameError && (
                    <p role="alert" className="text-sm text-red-700">
                      {renameError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRenameError(null);
                        setDraft(handle ?? "");
                        setRenaming(false);
                      }}
                      className="min-h-11 flex-1 rounded-full border border-stone-300 text-sm font-semibold text-stone-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!draft.trim()}
                      className="min-h-11 flex-1 rounded-full bg-stone-900 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <div className="text-2xl font-extrabold text-stone-900">
                    {hydrated ? handle : "…"}
                  </div>
                  <button
                    type="button"
                    onClick={() => setRenaming(true)}
                    className="min-h-11 text-sm font-semibold text-emerald-800 underline"
                  >
                    Change name
                  </button>
                </div>
              )}
            </div>

            {startError && (
              <p role="alert" className="text-sm text-red-300">
                {startError}
              </p>
            )}

            <button
              type="button"
              onClick={() => void handleStart()}
              disabled={!hydrated || !handle || starting}
              className="min-h-14 rounded-full bg-red-600 px-10 text-lg font-bold text-white shadow-xl shadow-red-950/40 transition hover:-translate-y-0.5 hover:bg-red-500 active:scale-[0.98] disabled:opacity-60"
            >
              {starting ? "Dealing questions…" : "Start playing"}
            </button>
          </div>
        </div>
      </section>

      {/* How scoring works */}
      <section className="bg-dot-grid bg-emerald-50 py-12">
        <div className="mx-auto grid max-w-5xl gap-4 px-4 text-sm sm:grid-cols-3 sm:px-6">
          {[
            [
              "⏱️",
              "Beat the clock",
              "Answer inside 60 seconds. When time runs out the question is skipped.",
            ],
            [
              "🧩",
              "Build the answer",
              "Tap the letter tiles to spell it out. Decoy letters are mixed in.",
            ],
            [
              "🏆",
              "Climb the board",
              "Your best game per category counts. Try more categories to rank higher overall.",
            ],
          ].map(([emoji, title, body]) => (
            <div
              key={title}
              className="flex flex-col gap-1 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
            >
              <span className="text-2xl" aria-hidden>
                {emoji}
              </span>
              <span className="font-bold text-stone-900">{title}</span>
              <span className="text-stone-500">{body}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
