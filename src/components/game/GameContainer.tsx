"use client";

import { useEffect, useState } from "react";
import { GameScreen } from "./GameScreen";
import { GameShell } from "./GameShell";
import { claimNickname, startGame, type GameSession } from "@/lib/game/actions";
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
};

export function GameContainer({ categoryId, categoryName, categorySlug }: GameContainerProps) {
  const [handle, setHandle] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<GameSession | null>(null);
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
      setHydrated(true);
    })();
  }, []);

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
      setRenameError(err instanceof Error ? err.message : "Could not save that name.");
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
      setSession(next);
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "Could not start the game.");
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
        handle={handle}
      />
    );
  }

  return (
    <GameShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <div className="game-pop flex flex-col items-center gap-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-stone-900 text-balance">
            {categoryName}
          </h1>
          <p className="text-stone-500">Ten questions. 60 seconds each. Your name hits the board.</p>
        </div>

        <div className="game-pop w-full max-w-sm rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(28,25,23,0.08)] [animation-delay:80ms]">
          {renaming ? (
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                void saveHandle(draft);
              }}
            >
              <label className="flex flex-col gap-1.5 text-left text-sm font-medium text-stone-800">
                Your name on the board
                <input
                  autoFocus
                  value={draft}
                  maxLength={24}
                  onChange={(e) => setDraft(e.target.value)}
                  className="rounded-lg border border-stone-300 px-3 py-2.5 text-center text-lg font-semibold text-stone-900 outline-none placeholder:text-stone-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </label>
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
              <div className="text-xl font-extrabold text-stone-900">
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
          <p role="alert" className="text-sm text-red-700">
            {startError}
          </p>
        )}

        <button
          type="button"
          onClick={() => void handleStart()}
          disabled={!hydrated || !handle || starting}
          className="game-pop min-h-14 w-full max-w-sm rounded-full bg-red-600 px-10 text-lg font-bold text-white shadow-[0_10px_24px_rgba(220,38,38,0.28)] [animation-delay:140ms] hover:bg-red-500 active:scale-[0.98] disabled:opacity-60"
        >
          {starting ? "Dealing questions…" : "Start playing"}
        </button>
      </div>
    </GameShell>
  );
}
