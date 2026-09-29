import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { LeaderboardSection } from '@/components/leaderboard/LeaderboardSection';
import { parsePeriod } from '@/lib/game/leaderboard';
import { getBoard, getBoardCategories } from '@/lib/game/leaderboardData';

export const metadata = { title: 'Leaderboard | Unajua' };

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const period = parsePeriod(sp.period);
  const categories = await getBoardCategories();
  const category = categories.find((c) => c.slug === sp.category)?.slug ?? null;
  const rows = await getBoard(period, category);

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
            href="/play"
            className="rounded-full border border-white/25 px-4 py-1.5 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/10"
          >
            Play
          </Link>
        </header>

        <div className="game-pop relative mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pb-16 pt-4 sm:px-6 sm:pt-8">
          <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-300">
            🏆 Top 10 · updates every minute
          </span>
          <h1 className="text-5xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-7xl">
            Who knows <span className="pl-4 text-red-500">Kenya best?</span>
          </h1>
          <p className="max-w-2xl text-lg text-stone-300">
            Your score is your best game in each category, added up. Play more
            categories to climb. Daily and weekly boards reset at midnight
            Nairobi time.
          </p>
        </div>
      </section>

      {/* Board: neutral band, same section as the home page */}
      <section className="flex-1 bg-stone-100 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <LeaderboardSection
            rows={rows}
            period={period}
            category={category}
            categories={categories}
            basePath="/leaderboard"
            limit={10}
            showTitle={false}
          />
        </div>
      </section>

      <Reveal>
        <section className="bg-red-600 py-14">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-4 text-center sm:px-6">
            <h2 className="max-w-lg text-3xl font-extrabold text-white">
              Not on the board yet?
            </h2>
            <Link
              href="/play"
              className="rounded-full bg-white px-10 py-4 text-lg font-bold text-red-600 shadow-lg transition hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Play now
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
