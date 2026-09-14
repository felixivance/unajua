import Link from "next/link";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { DeleteQuestionButton } from "./DeleteQuestionButton";

export default async function AdminQuestionsPage() {
  const { supabase } = await requireAdmin();
  const { data: questions } = await supabase
    .from("questions")
    .select("id, prompt, accepted_answer, is_active, image_url, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
        <Link
          href="/admin/questions/new"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
        >
          New question
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {questions?.map((question) => (
          <div
            key={question.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex items-center gap-3">
              {question.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={question.image_url}
                  alt=""
                  className="h-12 w-12 rounded object-contain"
                />
              )}
              <div>
                <div className="font-medium text-gray-900">{question.prompt}</div>
                <div className="text-sm text-gray-500">
                  {(question.categories as unknown as { name: string } | null)?.name} · Answer:{" "}
                  {question.accepted_answer} ·{" "}
                  <span className={question.is_active ? "text-emerald-600" : "text-gray-400"}>
                    {question.is_active ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 gap-3 text-sm">
              <Link href={`/admin/questions/${question.id}`} className="text-emerald-700 underline">
                Edit
              </Link>
              <DeleteQuestionButton questionId={question.id} />
            </div>
          </div>
        ))}
        {!questions?.length && (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
            No questions yet.
          </div>
        )}
      </div>
    </div>
  );
}
