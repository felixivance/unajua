import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { iconForCategory } from '@/lib/game/categoryIcons';
import { Reveal } from '@/components/Reveal';

const RANK_MEDALS = ['🥇', '🥈', '🥉'];
const RANK_RING = ['ring-amber-300', 'ring-stone-300', 'ring-orange-300'];

const STEPS = [
  {
    emoji: '🧩',
    title: 'Pick a category',
    body: 'Brands, companies, places, faces.',
    tint: 'bg-stone-900',
  },
  {
    emoji: '⌨️',
    title: 'Solve the clue',
    body: 'Ten rounds, letter tiles, no clock.',
    tint: 'bg-red-600',
  },
  {
    emoji: '🏆',
    title: 'Climb the board',
    body: 'Post your score under a nickname.',
    tint: 'bg-emerald-700',
  },
];

export default async function Home() {
  const supabase = await createClient();

  const [
    { data: topGames },
    { data: categories },
    { data: activeQuestions },
    { count: gamesPlayed },
  ] = await Promise.all([
    supabase
      .from('games')
      .select('id, score, total_questions, guest_nickname, categories(name)')
      .not('completed_at', 'is', null)
      .order('score', { ascending: false })
      .limit(8),
    supabase
      .from('categories')
      .select('id, slug, name')
      .eq('is_active', true)
      .order('name'),
    supabase.from('questions').select('category_id').eq('is_active', true),
    supabase
      .from('games')
      .select('id', { count: 'exact', head: true })
      .not('completed_at', 'is', null),
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
  const totalQuestions = activeQuestions?.length ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Hero: dark color-block band, flag-stripe texture, oversized type */}
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
          <span className="text-lg font-extrabold tracking-tight text-white">
            Tambua<span className="text-emerald-400"> Kenya</span>
          </span>
          <Link
            href="/play"
            className="rounded-full border border-white/25 px-4 py-1.5 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/10"
          >
            Play
          </Link>
        </header>

        <div className="relative mx-auto grid w-full max-w-5xl items-center gap-10 px-4 pb-20 pt-6 sm:px-6 sm:pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6">
          <div className="flex flex-col gap-6 ">
            <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-300">
              Kenyan trivia, unlocked
            </span>
            <h1 className="text-6xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-7xl">
              How well do
              <br />
              you know <span className="text-red-500">Kenya?</span>
            </h1>
            <p className="max-w-md text-lg text-stone-300">
              Rebus puzzles and rapid-fire trivia on Kenyan brands, places and
              people. Ten questions, no clock, bragging rights on the line.
            </p>
            <div>
              <Link
                href="/play"
                className="inline-block rounded-full bg-red-600 px-10 py-4 text-lg font-bold text-white shadow-xl shadow-red-950/40 transition active:scale-[0.98] hover:-translate-y-0.5 hover:bg-red-500"
              >
                Play now
              </Link>
            </div>
          </div>

          <RebusMark />
        </div>
      </section>

      {/* How to play: white band, animated level path */}
      <Reveal>
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="mb-10 text-2xl font-extrabold text-stone-900">
              How to play
            </h2>
            <div className="relative grid gap-10 sm:grid-cols-3">
              <div className="absolute top-8 right-0 left-0 hidden border-t-2 border-dashed border-stone-300 sm:block" />
              {STEPS.map((step, i) => (
                <Reveal
                  key={step.title}
                  delay={i * 120}
                  className="relative flex flex-col gap-3"
                >
                  <div className="group relative w-fit">
                    <span
                      className={`grid h-16 w-16 place-items-center rounded-full text-2xl text-white shadow-lg ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${step.tint}`}
                    >
                      {step.emoji}
                    </span>
                    <span className="absolute -top-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-stone-900 text-[11px] font-extrabold text-white ring-2 ring-white">
                      {i + 1}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-stone-900">
                    {step.title}
                  </div>
                  <div className="text-sm text-stone-500">{step.body}</div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Categories teaser: tinted band, horizontal scroll strip, real content */}
      {playableCategories.length > 0 && (
        <Reveal>
          <section className="bg-dot-grid bg-emerald-50 py-16 sm:py-20">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <div className="mb-6 flex items-end justify-between">
                <h2 className="text-2xl font-extrabold text-stone-900">
                  Choose your arena
                </h2>
                <Link
                  href="/play"
                  className="text-sm font-semibold text-emerald-700 hover:underline"
                >
                  See all
                </Link>
              </div>
              <div className="flex snap-x gap-4 overflow-x-auto pb-2">
                {playableCategories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/play/${category.slug}`}
                    className="group flex w-40 shrink-0 snap-start flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-lg"
                  >
                    <span className="text-3xl transition-transform duration-300 group-hover:scale-125">
                      {iconForCategory(category.slug)}
                    </span>
                    <span className="font-bold text-stone-900 group-hover:text-emerald-700">
                      {category.name}
                    </span>
                    <span className="text-xs font-semibold text-stone-400">
                      {questionCounts.get(category.id) ?? 0} questions
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </Reveal>
      )}

      {/* Leaderboard: clean ranked list on a neutral band */}
      <Reveal>
        <section className="bg-stone-100 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-stone-900">
                Leaderboard
              </h2>
              {!!topGames?.length && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 motion-reduce:animate-none" />
                  Updated live
                </span>
              )}
            </div>

            <div className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              {topGames?.length ? (
                topGames.map((game, i) => (
                  <div
                    key={game.id}
                    className={`flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-stone-50 ${
                      i < topGames.length - 1 ? 'border-b border-stone-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`grid h-9 w-9 place-items-center rounded-full text-sm font-extrabold ${
                          i < 3
                            ? `bg-white text-stone-900 ring-2 ${RANK_RING[i]}`
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {RANK_MEDALS[i] ?? `#${i + 1}`}
                      </span>
                      <div>
                        <div className="font-semibold text-stone-900">
                          {game.guest_nickname ?? 'Anonymous'}
                        </div>
                        <div className="text-xs text-stone-500">
                          {
                            (
                              game.categories as unknown as {
                                name: string;
                              } | null
                            )?.name
                          }
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-emerald-700">
                        {game.score} pts
                      </div>
                      <div className="text-xs text-stone-400">
                        {game.total_questions} questions
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-10 text-center text-stone-500">
                  No scores yet. Be the first on the board.
                </div>
              )}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Stats strip: warm tinted band, real numbers */}
      <Reveal>
        <section className="bg-amber-50 py-16 sm:py-20">
          <div className="mx-auto grid max-w-5xl grid-cols-3 gap-4 px-4 text-center sm:px-6">
            <div className="flex flex-col gap-1 rounded-2xl border border-amber-100 bg-white py-6 shadow-sm">
              <span className="text-3xl font-extrabold text-stone-900">
                {gamesPlayed ?? 0}
              </span>
              <span className="text-xs font-semibold text-stone-500">
                games played
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl border border-amber-100 bg-white py-6 shadow-sm">
              <span className="text-3xl font-extrabold text-stone-900">
                {playableCategories.length}
              </span>
              <span className="text-xs font-semibold text-stone-500">
                categories
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl border border-amber-100 bg-white py-6 shadow-sm">
              <span className="text-3xl font-extrabold text-stone-900">
                {totalQuestions}
              </span>
              <span className="text-xs font-semibold text-stone-500">
                puzzles to crack
              </span>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Closing CTA banner */}
      <Reveal>
        <section className="bg-red-600 py-16 sm:py-20">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-4 text-center sm:px-6">
            <h2 className="max-w-lg text-3xl font-extrabold text-white sm:text-4xl">
              Think you know Kenya better than your friends?
            </h2>
            <Link
              href="/play"
              className="rounded-full bg-white px-10 py-4 text-lg font-bold text-red-600 shadow-lg transition active:scale-[0.98] hover:-translate-y-0.5"
            >
              Play now
            </Link>
          </div>
        </section>
      </Reveal>

      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-400">
        Tambua Kenya, made in Kenya 🇰🇪
      </footer>
    </div>
  );
}

function RebusMark() {
  return (
    <div
      className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-10 backdrop-blur-sm"
      aria-hidden
    >
      <span className="grid h-16 w-16 place-items-center rounded-xl bg-white text-2xl font-black text-stone-900">
        NA
      </span>
      <span className="text-2xl font-bold text-white/40">+</span>
      <span className="grid h-16 w-16 place-items-center rounded-xl bg-emerald-600 text-3xl">
        🪨
      </span>
      <span className="text-2xl font-bold text-white/40">=</span>
      <span className="grid h-16 place-items-center rounded-xl bg-red-600 px-3 text-lg font-black text-white">
        NAROK
      </span>
    </div>
  );
}
