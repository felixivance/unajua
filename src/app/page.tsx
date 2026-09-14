import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export default async function Home() {
  const supabase = await createClient();

  const { data: topGames } = await supabase
    .from("games")
    .select("id, score, total_questions, guest_nickname, categories(name)")
    .not("completed_at", "is", null)
    .order("score", { ascending: false })
    .limit(10);

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      <div className="h-1.5 w-full bg-gradient-to-r from-black via-red-600 to-emerald-700" />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-14 px-4 py-14 sm:py-20">
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="text-4xl">🇰🇪</span>
          <h1 className="text-5xl font-extrabold tracking-tight text-stone-900 sm:text-6xl">
            Tambua<span className="text-emerald-700"> Kenya</span>
          </h1>
          <p className="max-w-md text-lg text-stone-600">
            How well do you know Kenya? Play fast picture puzzles and trivia, then challenge
            your friends.
          </p>
          <Link
            href="/play"
            className="mt-2 rounded-full bg-red-600 px-12 py-4 text-xl font-bold text-white shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700"
          >
            Play now
          </Link>
        </div>

        <div className="w-full">
          <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-stone-500">
            🏆 Leaderboard
          </h2>

          <div className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            {topGames?.length ? (
              topGames.map((game, i) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between gap-4 border-b border-stone-100 px-5 py-3 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-sm font-bold text-stone-400">
                      {RANK_MEDALS[i] ?? `#${i + 1}`}
                    </span>
                    <div>
                      <div className="font-semibold text-stone-900">
                        {game.guest_nickname ?? "Anonymous"}
                      </div>
                      <div className="text-xs text-stone-500">
                        {(game.categories as unknown as { name: string } | null)?.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-700">{game.score} pts</div>
                    <div className="text-xs text-stone-400">{game.total_questions} questions</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-10 text-center text-stone-500">
                No scores yet — be the first on the board.
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-400">
        Tambua Kenya · Made with 🇰🇪
      </footer>
    </div>
  );
}
