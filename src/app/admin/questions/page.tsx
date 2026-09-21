import Link from "next/link";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { DeleteQuestionButton } from "./DeleteQuestionButton";

type PageProps = {
  searchParams: Promise<{ category?: string; status?: string; q?: string }>;
};

export default async function AdminQuestionsPage({ searchParams }: PageProps) {
  const { category, status, q } = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: categories } = await supabase.from("categories").select("id, name").order("name");

  let questionsQuery = supabase
    .from("questions")
    .select("id, prompt, accepted_answer, is_active, image_url, category_id, categories(name)")
    .order("created_at", { ascending: false });
  if (category) questionsQuery = questionsQuery.eq("category_id", category);
  if (status === "published") questionsQuery = questionsQuery.eq("is_active", true);
  if (status === "draft") questionsQuery = questionsQuery.eq("is_active", false);
  if (q?.trim()) questionsQuery = questionsQuery.ilike("prompt", `%${q.trim()}%`);
  const { data: questions } = await questionsQuery;
  const filtersOn = Boolean(category || status || q);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Questions</h1>
          <p className="mt-1 text-stone-500">Drafts stay hidden. Publish them to put them in play.</p>
        </div>
        <Link
          href={category ? `/admin/questions/new?category=${category}` : "/admin/questions/new"}
          className="inline-flex min-h-11 items-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          New question
        </Link>
      </div>

      <form className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-stone-600">
          Category
          <select
            name="category"
            defaultValue={category ?? ""}
            className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900"
          >
            <option value="">All categories</option>
            {categories?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-40 flex-col gap-1 text-xs font-medium text-stone-600">
          Status
          <select
            name="status"
            defaultValue={status ?? ""}
            className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900"
          >
            <option value="">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </label>
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-stone-600">
          Search
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search prompts"
            className="min-h-11 rounded-lg border border-stone-300 px-3 text-sm text-stone-900"
          />
        </label>
        <button className="min-h-11 cursor-pointer rounded-lg bg-stone-900 px-4 text-sm font-semibold text-white">
          Filter
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {questions?.map((question) => (
          <div
            key={question.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              {question.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={question.image_url}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-lg object-contain"
                />
              ) : (
                <div className="h-12 w-12 shrink-0 rounded-lg bg-stone-100" aria-hidden />
              )}
              <div className="min-w-0">
                <div className="truncate font-medium text-stone-900">{question.prompt}</div>
                <div className="text-sm text-stone-500">
                  {(question.categories as unknown as { name: string } | null)?.name} ·{" "}
                  {question.accepted_answer} ·{" "}
                  <span className={question.is_active ? "text-emerald-700" : "text-stone-400"}>
                    {question.is_active ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-sm">
              <Link
                href={`/admin/questions/${question.id}`}
                className="font-semibold text-emerald-800 underline"
              >
                Edit
              </Link>
              <DeleteQuestionButton questionId={question.id} />
            </div>
          </div>
        ))}
        {!questions?.length && (
          <div className="rounded-xl border border-dashed border-stone-300 px-6 py-10 text-center">
            <p className="text-stone-600">
              {filtersOn ? "No questions match those filters." : "No questions yet. Add the first puzzle."}
            </p>
            <Link
              href={filtersOn ? "/admin/questions" : "/admin/questions/new"}
              className="mt-3 inline-flex min-h-11 items-center font-semibold text-emerald-800 underline"
            >
              {filtersOn ? "Clear filters" : "New question"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
