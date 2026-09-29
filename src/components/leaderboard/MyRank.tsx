"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getStoredNickname } from "@/lib/game/nickname";
import type { Period } from "@/lib/game/leaderboard";

type Rank = { rank: number; score: number; next_nickname: string | null; next_score: number | null };

// Per-player, so it is fetched in the browser and never cached with the public board.
export function MyRank({ period, category }: { period: Period; category: string | null }) {
  const [state, setState] = useState<Rank | null | "loading">("loading");

  useEffect(() => {
    let live = true;
    const nickname = getStoredNickname();
    const lookup = nickname
      ? createClient()
          .rpc("get_player_rank", { p_period: period, p_category_slug: category, p_nickname: nickname })
          .then(({ data }) => ((data ?? []) as Rank[])[0] ?? null)
      : Promise.resolve(null);
    void lookup.then((rank) => {
      if (live) setState(rank);
    });
    return () => {
      live = false;
    };
  }, [period, category]);

  if (state === "loading") return <div className="h-12" aria-hidden />;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-stone-900 px-5 py-3 text-white">
      {state ? (
        <p className="text-sm">
          <span className="font-extrabold">You&apos;re #{state.rank}</span>
          <span className="text-stone-300">
            {" · "}
            {state.score} pts
            {state.next_nickname && state.next_score !== null
              ? ` · ${state.next_score - state.score} pts behind ${state.next_nickname}`
              : " · top of the board"}
          </span>
        </p>
      ) : (
        <p className="text-sm text-stone-300">Play a category to get ranked.</p>
      )}
      <Link href="/play" className="text-sm font-bold text-emerald-300 hover:underline">
        Play
      </Link>
    </div>
  );
}
