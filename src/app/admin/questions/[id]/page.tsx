import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { updateQuestion } from "@/lib/admin/actions";
import { QuestionForm } from "@/components/admin/QuestionForm";

type EditQuestionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditQuestionPage({ params }: EditQuestionPageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const [{ data: categories }, { data: question }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("questions").select("*").eq("id", id).single(),
  ]);

  if (!question) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/questions" className="text-sm font-medium text-stone-500 hover:text-stone-800">
          ← Questions
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">Edit question</h1>
      </div>
      <QuestionForm
        categories={categories ?? []}
        initialValues={question}
        action={updateQuestion}
        submitLabel="Save changes"
      />
    </div>
  );
}
