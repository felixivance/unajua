import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { iconForCategory } from "@/lib/game/categoryIcons";

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
    <div className="flex min-h-screen flex-col bg-stone-50">
      <div className="h-1.5 w-full bg-gradient-to-r from-black via-red-600 to-emerald-700" />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-stone-900">Choose a challenge</h1>
            <p className="text-stone-500">Pick a category, 10 questions, no clock.</p>
          </div>
          <Link href="/" className="text-sm text-stone-500 underline">
            Home
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {playableCategories.length ? (
            playableCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/play/${category.slug}`}
                className="group flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{iconForCategory(category.slug)}</span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                    {questionCounts.get(category.id) ?? 0} questions
                  </span>
                </div>
                <div className="text-lg font-bold text-stone-900 group-hover:text-emerald-700">
                  {category.name}
                </div>
                {category.description && (
                  <div className="text-sm text-stone-500">{category.description}</div>
                )}
              </Link>
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
