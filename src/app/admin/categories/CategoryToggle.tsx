"use client";

import { useTransition } from "react";
import { toggleCategoryActive } from "@/lib/admin/actions";

export function CategoryToggle({
  categoryId,
  isActive,
}: {
  categoryId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => toggleCategoryActive(categoryId, !isActive))}
      disabled={isPending}
      className={`min-h-11 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60 ${
        isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-500"
      }`}
    >
      {isActive ? "Visible" : "Hidden"}
    </button>
  );
}
