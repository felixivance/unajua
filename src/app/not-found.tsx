// Spec: docs/specs/not-found-page.md
import Link from 'next/link';

export const metadata = { title: 'Page not found | Unajua' };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-950">
      <section className="relative flex flex-1 flex-col overflow-hidden">
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

        <header className="relative mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
          <Link
            href="/"
            className="text-lg font-extrabold tracking-tight text-white"
          >
            Unajua
          </Link>
        </header>

        <div className="game-pop relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-6 px-4 pb-24 sm:px-6">
          <p
            aria-hidden="true"
            className="text-[9rem] font-extrabold leading-none tracking-tight text-red-500 sm:text-[14rem]"
          >
            404
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
            This page doesn&apos;t exist
          </h1>
          <p className="max-w-xl text-lg text-stone-300">
            Wrong turn, it happens. But you know Kenya, so prove it: pick a
            category and get back in the game.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/play"
              className="rounded-full bg-white px-10 py-4 text-lg font-bold text-red-600 shadow-lg transition hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Play now
            </Link>
            <Link
              href="/"
              className="rounded-full border border-white/25 px-6 py-3.5 text-base font-semibold text-white transition hover:border-white/50 hover:bg-white/10"
            >
              Home
            </Link>
            <Link
              href="/leaderboard"
              className="rounded-full border border-white/25 px-6 py-3.5 text-base font-semibold text-white transition hover:border-white/50 hover:bg-white/10"
            >
              Leaderboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
