import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { iconForCategory } from "@/lib/game/categoryIcons";
import { Reveal } from "@/components/Reveal";

const BADGE_TINTS = ["bg-stone-900", "bg-red-600", "bg-emerald-700"];

export default async function PlayHubPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: activeQuestions }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, name, description")
      .eq("is_active", true)
      .order("name"),
    supabase.from("questions").select("category_id").eq("is_active", true),
  ]);

  const questionCounts = new Map<string, number>();
  for (const row of activeQuestions ?? []) {
    questionCounts.set(row.category_id, (questionCounts.get(row.category_id) ?? 0) + 1);
  }

  const playableCategories = (categories ?? []).filter(
    (category) => (questionCounts.get(category.id) ?? 0) > 0
  );

  return (
    <div className="bg-dot-grid flex min-h-screen flex-col bg-stone-50">
      <div className="h-1.5 w-full bg-gradient-to-r from-black via-red-600 to-emerald-700" />

      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-6 sm:px-6">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-stone-900">
          Unajua
        </Link>
        <Link
          href="/"
          className="rounded-full border border-stone-300 px-4 py-1.5 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-white"
        >
          Home
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 pb-16 sm:px-6">
        <Reveal>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-stone-900">
              Choose your arena
            </h1>
            <p className="mt-1 text-stone-500">Pick a category, ten questions, no clock.</p>
          </div>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2">
          {playableCategories.length ? (
            playableCategories.map((category, i) => (
              <Reveal key={category.slug} delay={i * 80}>
                <Link
                  href={`/play/${category.slug}`}
                  className="group flex h-full flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`grid h-12 w-12 place-items-center rounded-xl text-2xl shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${BADGE_TINTS[i % BADGE_TINTS.length]}`}
                    >
                      {iconForCategory(category.slug)}
                    </span>
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-500">
                      {questionCounts.get(category.id) ?? 0} questions
                    </span>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-stone-900 group-hover:text-emerald-700">
                      {category.name}
                    </div>
                    {category.description && (
                      <div className="mt-1 text-sm text-stone-500">{category.description}</div>
                    )}
                  </div>
                </Link>
              </Reveal>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-stone-300 px-6 py-10 text-center text-stone-500">
              No playable categories yet. Add questions in the admin to get started.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
