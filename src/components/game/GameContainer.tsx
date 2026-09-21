"use client";

import { useEffect, useState } from "react";
import { GameScreen } from "./GameScreen";
import { startGame, type GameSession } from "@/lib/game/actions";
import { getStoredNickname, storeNickname } from "@/lib/game/nickname";

type GameContainerProps = {
  categoryId: string;
  categoryName: string;
};

export function GameContainer({ categoryId, categoryName }: GameContainerProps) {
  const [nickname, setNickname] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<GameSession | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    setNickname(getStoredNickname());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!nickname) return;
    let cancelled = false;
    setStartError(null);
    // ponytail: Strict Mode can start a second unfinished game; those rows never complete.
    startGame(categoryId, nickname)
      .then((next) => {
        if (!cancelled) setSession(next);
      })
      .catch((err) => {
        if (!cancelled) {
          setStartError(err instanceof Error ? err.message : "Could not start the game.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [nickname, categoryId]);

  function handleStart(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim().slice(0, 24);
    if (!trimmed) return;
    storeNickname(trimmed);
    setNickname(trimmed);
  }

  if (!hydrated) return null;

  if (!nickname) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="text-2xl font-bold text-stone-900">What should we call you?</div>
        <p className="text-sm text-stone-500">
          Your nickname appears on the leaderboard. No email needed.
        </p>
        <form onSubmit={handleStart} className="flex w-full flex-col gap-3">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Nickname"
            maxLength={24}
            className="rounded-lg border border-stone-300 px-4 py-3 text-center text-lg"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="rounded-full bg-emerald-600 px-8 py-3 text-lg font-bold text-white disabled:opacity-50"
          >
            Start playing
          </button>
        </form>
      </div>
    );
  }

  if (startError) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-lg font-semibold text-stone-900">Could not start</div>
        <p className="text-sm text-red-600">{startError}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm items-center justify-center px-4 text-sm text-stone-500">
        Starting game…
      </div>
    );
  }

  return (
    <GameScreen
      gameId={session.gameId}
      categoryName={categoryName}
      questions={session.questions}
    />
  );
}
