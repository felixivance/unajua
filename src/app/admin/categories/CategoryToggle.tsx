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
      onClick={() => startTransition(() => toggleCategoryActive(categoryId, !isActive))}
      disabled={isPending}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
        isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {isActive ? "Published" : "Draft"}
    </button>
  );
}
