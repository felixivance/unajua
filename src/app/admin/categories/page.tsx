import Link from "next/link";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createCategory, updateCategory } from "@/lib/admin/actions";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { CategoryToggle } from "./CategoryToggle";

type PageProps = {
  searchParams: Promise<{ edit?: string }>;
};

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  const { edit } = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data: categories }, { data: questions }] = await Promise.all([
    supabase.from("categories").select("id, slug, name, description, is_active").order("name"),
    supabase.from("questions").select("category_id, is_active"),
  ]);

  const liveCount = new Map<string, number>();
  const totalCount = new Map<string, number>();
  for (const question of questions ?? []) {
    totalCount.set(question.category_id, (totalCount.get(question.category_id) ?? 0) + 1);
    if (question.is_active) {
      liveCount.set(question.category_id, (liveCount.get(question.category_id) ?? 0) + 1);
    }
  }

  const editing = categories?.find((category) => category.id === edit);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Categories</h1>
        <p className="mt-1 text-stone-500">
          A category only shows up in the game once it is visible and has at least one published question.
        </p>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="mb-4 font-semibold text-stone-900">
          {editing ? `Edit ${editing.name}` : "New category"}
        </h2>
        {editing && (
          <p className="mb-4 text-sm">
            <Link href="/admin/categories" className="text-emerald-800 underline">
              Cancel edit
            </Link>
          </p>
        )}
        <CategoryForm
          key={editing?.id ?? "new"}
          action={editing ? updateCategory : createCategory}
          initialValues={editing}
          submitLabel={editing ? "Save category" : "Create category"}
        />
      </section>

      <div className="flex flex-col gap-3">
        {categories?.map((category) => {
          const live = liveCount.get(category.id) ?? 0;
          const total = totalCount.get(category.id) ?? 0;
          return (
            <div
              key={category.id}
              className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="font-semibold text-stone-900">{category.name}</div>
                <div className="text-sm text-stone-500">
                  /play/{category.slug} · {live} published
                  {total > live ? ` · ${total - live} draft` : ""}
                  {category.is_active && live === 0 ? " · add a published question to go live" : ""}
                </div>
                {category.description && (
                  <div className="mt-1 text-sm text-stone-600">{category.description}</div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/admin/questions?category=${category.id}`}
                  className="text-sm font-medium text-stone-600 underline"
                >
                  View questions
                </Link>
                <Link
                  href={`/admin/questions/new?category=${category.id}`}
                  className="text-sm font-semibold text-emerald-800 underline"
                >
                  Add questions
                </Link>
                <Link href={`/admin/categories?edit=${category.id}`} className="text-sm text-stone-600 underline">
                  Edit
                </Link>
                <CategoryToggle categoryId={category.id} isActive={category.is_active} />
              </div>
            </div>
          );
        })}
        {!categories?.length && (
          <div className="rounded-xl border border-dashed border-stone-300 px-6 py-10 text-center text-stone-500">
            No categories yet. Use the form above to add the first one.
          </div>
        )}
      </div>
    </div>
  );
}
