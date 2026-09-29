import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { iconForCategory } from '@/lib/game/categoryIcons';
import { getBoard } from '@/lib/game/leaderboardData';
import { Reveal } from '@/components/Reveal';

// Card header tints cycle through the flag colours.
const TINTS = ['bg-stone-950', 'bg-red-600', 'bg-emerald-700'];

export default async function PlayHubPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: activeQuestions }] = await Promise.all([
    supabase
      .from('categories')
      .select('id, slug, name, description')
      .eq('is_active', true)
      .order('name'),
    supabase.from('questions').select('category_id').eq('is_active', true),
  ]);

  const questionCounts = new Map<string, number>();
  for (const row of activeQuestions ?? []) {
    questionCounts.set(
      row.category_id,
      (questionCounts.get(row.category_id) ?? 0) + 1,
    );
  }

  const playableCategories = (categories ?? []).filter(
    (category) => (questionCounts.get(category.id) ?? 0) > 0,
  );

  // ponytail: one cached (60s) query per category for its top score; add a
  // single "best per category" RPC if the category list grows past ~20.
  const leaders = await Promise.all(
    playableCategories.map((c) => getBoard('all', c.slug)),
  );

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Hero: dark band, flag-stripe texture, oversized type (same recipe as the home page) */}
      <section className="relative overflow-hidden bg-stone-950">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-[-10%] w-[55%] opacity-90"
          style={{
            background:
              'repeating-linear-gradient(115deg, #dc2626 0px, #dc2626 40px, #000 40px, #000 80px, #047857 80px, #047857 120px)',
            maskImage: 'linear-gradient(to left, black 20%, transparent 85%)',
            WebkitMaskImage:
              'linear-gradient(to left, black 20%, transparent 85%)',
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
            href="/"
            className="rounded-full border border-white/25 px-4 py-1.5 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/10"
          >
            Home
          </Link>
        </header>

        <div className="game-pop relative mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pb-16 pt-4 sm:px-6 sm:pt-8">
          <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-300">
            {playableCategories.length}{' '}
            {playableCategories.length === 1 ? 'arena' : 'arenas'} ·{' '}
            {activeQuestions?.length ?? 0} puzzles
          </span>
          <h1 className="text-5xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-7xl">
            Choose your <span className="pl-4 text-red-500">arena.</span>
          </h1>
          <p className="max-w-md text-lg text-stone-300">
            Ten questions, 60 seconds each. Every category has its own board,
            and your best score in each one adds up.
          </p>
        </div>
      </section>

      {/* Categories: tinted dot-grid band */}
      <section className="bg-dot-grid flex-1 bg-emerald-50 py-16 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
          {playableCategories.length ? (
            playableCategories.map((category, i) => {
              const leader = leaders[i]?.[0];
              return (
                <Reveal key={category.slug} delay={i * 80}>
                  <Link
                    href={`/play/${category.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-lg"
                  >
                    <div
                      className={`relative flex items-center justify-between overflow-hidden px-6 py-5 ${TINTS[i % TINTS.length]}`}
                    >
                      <div
                        aria-hidden
                        className="absolute inset-y-0 right-0 w-1/2 opacity-30"
                        style={{
                          background:
                            'repeating-linear-gradient(115deg, #fff 0px, #fff 10px, transparent 10px, transparent 20px)',
                          maskImage:
                            'linear-gradient(to left, black, transparent)',
                          WebkitMaskImage:
                            'linear-gradient(to left, black, transparent)',
                        }}
                      />
                      <span className="relative text-5xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                        {iconForCategory(category.slug)}
                      </span>
                      <span className="relative rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold text-white">
                        {questionCounts.get(category.id) ?? 0} questions
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <div>
                        <div className="text-xl font-bold text-stone-900 group-hover:text-emerald-700">
                          {category.name}
                        </div>
                        {category.description && (
                          <div className="mt-1 text-sm text-stone-500">
                            {category.description}
                          </div>
                        )}
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-stone-100 pt-3 text-xs">
                        <span className="min-w-0 truncate font-semibold text-stone-500">
                          {leader ? (
                            <>
                              🏆 {leader.score} pts ·{' '}
                              <span className="text-stone-900">
                                {leader.nickname}
                              </span>
                            </>
                          ) : (
                            '🏆 No score yet. Be first.'
                          )}
                        </span>
                        <span className="shrink-0 text-sm font-extrabold text-emerald-700 transition group-hover:translate-x-1">
                          Play →
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center text-stone-500">
              No playable categories yet. Add questions in the admin to get
              started.
            </div>
          )}
        </div>
      </section>

      {/* Closing band */}
      <Reveal>
        <section className="bg-red-600 py-14">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-4 text-center sm:px-6">
            <h2 className="max-w-lg text-3xl font-extrabold text-white">
              Curious who is on top?
            </h2>
            <Link
              href="/leaderboard"
              className="rounded-full bg-white px-10 py-4 text-lg font-bold text-red-600 shadow-lg transition hover:-translate-y-0.5 active:scale-[0.98]"
            >
              See the leaderboard
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
