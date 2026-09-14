import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createCategory } from "@/lib/admin/actions";
import { CategoryToggle } from "./CategoryToggle";

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name, description, is_active")
    .order("name");

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-gray-900">Categories</h1>

      <div className="flex flex-col gap-3">
        {categories?.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
          >
            <div>
              <div className="font-semibold text-gray-900">{category.name}</div>
              <div className="text-sm text-gray-500">/{category.slug}</div>
              {category.description && (
                <div className="mt-1 text-sm text-gray-600">{category.description}</div>
              )}
            </div>
            <CategoryToggle categoryId={category.id} isActive={category.is_active} />
          </div>
        ))}
      </div>

      <form action={createCategory} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900">New category</h2>
        <input
          name="name"
          placeholder="Name (e.g. Kenyan Wildlife)"
          required
          className="rounded-lg border border-gray-300 px-4 py-2"
        />
        <input
          name="slug"
          placeholder="Slug (e.g. kenyan-wildlife)"
          required
          pattern="[a-z0-9-]+"
          className="rounded-lg border border-gray-300 px-4 py-2"
        />
        <textarea
          name="description"
          placeholder="Description (optional)"
          className="rounded-lg border border-gray-300 px-4 py-2"
        />
        <button className="self-start rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white">
          Create category
        </button>
      </form>
    </div>
  );
}
