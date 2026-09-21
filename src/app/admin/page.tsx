import Link from "next/link";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { signOutAdmin } from "@/lib/admin/actions";

export default async function AdminHomePage() {
  const { supabase, profile } = await requireAdmin();

  const [{ data: categories }, { data: questions }] = await Promise.all([
    supabase.from("categories").select("id, name, slug, is_active").order("name"),
    supabase.from("questions").select("id, category_id, is_active"),
  ]);

  const publishedByCategory = new Map<string, number>();
  const draftByCategory = new Map<string, number>();
  for (const question of questions ?? []) {
    const map = question.is_active ? publishedByCategory : draftByCategory;
    map.set(question.category_id, (map.get(question.category_id) ?? 0) + 1);
  }

  const published = questions?.filter((q) => q.is_active).length ?? 0;
  const drafts = (questions?.length ?? 0) - published;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Hi, {profile.nickname}</h1>
          <p className="mt-1 text-stone-500">
            {published} live question{published === 1 ? "" : "s"}
            {drafts ? ` · ${drafts} draft${drafts === 1 ? "" : "s"}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/questions/new"
            className="inline-flex min-h-11 items-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Add question
          </Link>
          <form action={signOutAdmin}>
            <button className="min-h-11 cursor-pointer px-2 text-sm text-stone-500 underline">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">Categories</h2>
          <Link href="/admin/categories" className="text-sm font-medium text-emerald-800 underline">
            Manage
          </Link>
        </div>

        {categories?.length ? (
          <div className="flex flex-col gap-2">
            {categories.map((category) => {
              const live = publishedByCategory.get(category.id) ?? 0;
              const hidden = draftByCategory.get(category.id) ?? 0;
              return (
                <div
                  key={category.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3"
                >
                  <div>
                    <div className="font-medium text-stone-900">{category.name}</div>
                    <div className="text-sm text-stone-500">
                      {live} published
                      {hidden ? ` · ${hidden} draft` : ""}
                      {!category.is_active ? " · hidden from play" : live === 0 ? " · not on play screen yet" : ""}
                    </div>
                  </div>
                  <Link
                    href={`/admin/questions/new?category=${category.id}`}
                    className="text-sm font-semibold text-emerald-800 underline"
                  >
                    Add questions
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-stone-300 px-6 py-10 text-center">
            <p className="text-stone-600">No categories yet. Start with one, then add questions.</p>
            <Link
              href="/admin/categories"
              className="mt-3 inline-flex min-h-11 items-center font-semibold text-emerald-800 underline"
            >
              Create a category
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
