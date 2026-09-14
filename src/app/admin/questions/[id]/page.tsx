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

  const updateQuestionWithId = updateQuestion.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Edit question</h1>
      <QuestionForm
        categories={categories ?? []}
        initialValues={question}
        action={updateQuestionWithId}
        submitLabel="Save changes"
      />
    </div>
  );
}
