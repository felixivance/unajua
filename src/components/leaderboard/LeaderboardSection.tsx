import Link from 'next/link';
import type { BoardCategory, BoardRow } from '@/lib/game/leaderboardData';
import type { Period } from '@/lib/game/leaderboard';
import { MyRank } from './MyRank';
import { ResetsIn, TimeAgo } from './LiveText';

const PERIODS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'all', label: 'All-time' },
];
const MEDALS = ['🥇', '🥈', '🥉'];
const PLACES = ['1st', '2nd', '3rd'];
const STEPS = [
  { height: 'h-36', color: 'bg-gradient-to-b from-amber-400 to-amber-600' },
  { height: 'h-28', color: 'bg-gradient-to-b from-stone-400 to-stone-600' },
  { height: 'h-24', color: 'bg-gradient-to-b from-orange-400 to-orange-700' },
];

type Props = {
  rows: BoardRow[];
  period: Period;
  category: string | null;
  categories: BoardCategory[];
  basePath: string;
  /** 3 = podium only (home); 10 = podium plus ranks 4-10. */
  limit: 3 | 10;
  summary?: string;
};

function href(basePath: string, period: Period, category: string | null) {
  const params = new URLSearchParams({ period });
  if (category) params.set('category', category);
  return `${basePath}?${params}#leaderboard`;
}

const pill = (active: boolean) =>
  `rounded-full px-4 py-1.5 text-sm font-semibold transition ${
    active
      ? 'bg-stone-900 text-white'
      : 'border border-stone-300 bg-white text-stone-700 hover:border-stone-500'
  }`;

export function LeaderboardSection({
  rows,
  period,
  category,
  categories,
  basePath,
  limit,
  summary,
}: Readonly<Props>) {
  const podium = rows.slice(0, 3);
  const rest = limit === 10 ? rows.slice(3, 10) : [];

  return (
    <div id="leaderboard" className="flex scroll-mt-6 flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-2xl font-extrabold text-stone-900">Leaderboard</h2>
        <span className="text-sm font-semibold text-stone-500">
          {period !== 'all' && <ResetsIn period={period} />}
          {period !== 'all' && summary ? ' · ' : ''}
          {summary}
        </span>
      </div>

      <div className="flex justify-between">
        <nav
          aria-label="Leaderboard category"
          className="flex snap-x gap-2 overflow-x-auto pb-1"
        >
          {[{ slug: null, name: 'All' }, ...categories].map((c) => (
            <Link
              key={c.slug ?? 'all'}
              href={href(basePath, period, c.slug)}
              scroll={false}
              aria-current={c.slug === category ? 'page' : undefined}
              className={`shrink-0 ${pill(c.slug === category)}`}
            >
              {c.name}
            </Link>
          ))}
        </nav>
        <nav aria-label="Leaderboard period" className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <Link
              key={p.value}
              href={href(basePath, p.value, category)}
              scroll={false}
              aria-current={p.value === period ? 'page' : undefined}
              className={pill(p.value === period)}
            >
              {p.label}
            </Link>
          ))}
        </nav>
      </div>

      <MyRank period={period} category={category} />

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white px-6 py-10 text-center text-stone-500">
          No scores yet. Be the first on the board.{' '}
          <Link
            href="/play"
            className="font-semibold text-emerald-700 underline"
          >
            Play
          </Link>
        </div>
      ) : (
        <>
          <ol className="grid grid-cols-3 items-end gap-2 sm:gap-4">
            {[1, 0, 2].map((i) => {
              const row = podium[i];
              if (!row) return <li key={i} />;
              const step = STEPS[i];
              return (
                <li
                  key={row.rank}
                  className="flex min-w-0 flex-col items-center"
                >
                  <div
                    className="game-pop flex w-full min-w-0 flex-col items-center gap-0.5 pb-2 text-center"
                    style={{ animationDelay: `${300 + i * 120}ms` }}
                  >
                    <span
                      className={`${i === 0 ? 'text-5xl' : 'text-4xl'}`}
                      aria-hidden
                    >
                      {i === 0 ? '👑' : MEDALS[i]}
                    </span>
                    <span className="sr-only">{PLACES[i]}</span>
                    <span className="w-full truncate text-sm font-bold text-stone-900">
                      {row.nickname}
                    </span>
                    <span className="text-xs text-stone-500">
                      <TimeAgo at={row.reached_at} />
                    </span>
                  </div>
                  <div
                    className={`podium-rise flex w-full flex-col items-center justify-start gap-1 rounded-t-2xl pt-3 text-white shadow-lg ${step.height} ${step.color}`}
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    <span
                      className="text-3xl font-black leading-none"
                      aria-hidden
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-extrabold">
                      {row.score} pts
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>

          {rest.length > 0 && (
            <ol
              start={4}
              className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
            >
              {rest.map((row) => (
                <li
                  key={row.rank}
                  className="flex items-center justify-between gap-4 border-b border-stone-100 px-5 py-3 last:border-b-0"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-stone-100 text-sm font-extrabold text-stone-500">
                      {row.rank}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-stone-900">
                        {row.nickname}
                      </div>
                      <div className="text-xs text-stone-400">
                        <TimeAgo at={row.reached_at} />
                      </div>
                    </div>
                  </div>
                  <span className="font-extrabold text-emerald-700">
                    {row.score} pts
                  </span>
                </li>
              ))}
            </ol>
          )}
        </>
      )}

      {limit === 3 && rows.length > 0 && (
        <Link
          href={`/leaderboard?${new URLSearchParams({ period, ...(category ? { category } : {}) })}`}
          className="w-fit text-sm font-semibold text-emerald-700 hover:underline"
        >
          See top 10
        </Link>
      )}
    </div>
  );
}
