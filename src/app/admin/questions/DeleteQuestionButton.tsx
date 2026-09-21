"use client";

import { useTransition } from "react";
import { deleteQuestion } from "@/lib/admin/actions";

export function DeleteQuestionButton({ questionId }: { questionId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Delete this question? Players will no longer see it.")) return;
    startTransition(() => deleteQuestion(questionId));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="min-h-11 cursor-pointer px-1 text-sm font-medium text-red-700 underline disabled:opacity-60"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
