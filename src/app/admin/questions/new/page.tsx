import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createQuestion } from "@/lib/admin/actions";
import { QuestionForm } from "@/components/admin/QuestionForm";

export default async function NewQuestionPage() {
  const { supabase } = await requireAdmin();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">New question</h1>
      <QuestionForm categories={categories ?? []} action={createQuestion} submitLabel="Create question" />
    </div>
  );
}
