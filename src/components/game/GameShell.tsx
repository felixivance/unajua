import Link from "next/link";

export function GameShell({
  children,
  backHref = "/play",
  backLabel = "Categories",
  trailing,
}: {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="game-root flex min-h-dvh flex-col bg-stone-50">
      <div className="h-1.5 w-full bg-gradient-to-r from-black via-red-600 to-emerald-700" />
      <header className="mx-auto flex w-full max-w-lg items-center justify-between gap-3 px-4 py-2">
        <Link
          href={backHref}
          className="rounded-full border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-700 hover:bg-white min-h-9"
        >
          ← {backLabel}
        </Link>
        <Link href="/" className="text-sm font-extrabold tracking-tight text-stone-900">
          Unajua
        </Link>
        {trailing ?? <span className="w-[4.5rem]" aria-hidden />}
      </header>
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-4">{children}</div>
    </div>
  );
}
