import Link from "next/link";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createQuestion } from "@/lib/admin/actions";
import { QuestionForm } from "@/components/admin/QuestionForm";

type PageProps = {
  searchParams: Promise<{ category?: string; added?: string }>;
};

export default async function NewQuestionPage({ searchParams }: PageProps) {
  const { category, added } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: categories } = await supabase.from("categories").select("id, name").order("name");

  if (!categories?.length) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-stone-900">New question</h1>
        <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-10 text-center">
          <p className="text-stone-600">Create a category first, then add puzzles to it.</p>
          <Link
            href="/admin/categories"
            className="mt-3 inline-flex min-h-11 items-center font-semibold text-emerald-800 underline"
          >
            Create a category
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/questions" className="text-sm font-medium text-stone-500 hover:text-stone-800">
          ← Questions
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">New question</h1>
      </div>
      {added && (
        <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Saved. Add the next one below.
        </p>
      )}
      <QuestionForm
        categories={categories}
        action={createQuestion}
        submitLabel="Save question"
        allowAddAnother
        defaultCategoryId={category}
      />
    </div>
  );
}
