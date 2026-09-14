"use client";

import { useTransition } from "react";
import { deleteQuestion } from "@/lib/admin/actions";

export function DeleteQuestionButton({ questionId }: { questionId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Delete this question?")) return;
    startTransition(() => deleteQuestion(questionId));
  }

  return (
    <button onClick={handleClick} disabled={isPending} className="text-red-600 underline">
      Delete
    </button>
  );
}
