import Link from "next/link";
import { LeaderboardSection } from "@/components/leaderboard/LeaderboardSection";
import { parsePeriod } from "@/lib/game/leaderboard";
import { getBoard, getBoardCategories } from "@/lib/game/leaderboardData";

export const metadata = { title: "Leaderboard | Unajua" };

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
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
      <Link href="/" className="w-fit text-sm font-semibold text-stone-500 hover:text-stone-900">
        ← Unajua
      </Link>
      <LeaderboardSection
        rows={rows}
        period={period}
        category={category}
        categories={categories}
        basePath="/leaderboard"
        limit={10}
      />
    </main>
  );
}
