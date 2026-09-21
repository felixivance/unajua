"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { slugify } from "@/lib/admin/slug";
import type { ActionState } from "@/lib/admin/actions";

type CategoryFormProps = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  initialValues?: { id: string; name: string; slug: string; description: string | null };
  submitLabel: string;
};

const FIELD =
  "rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 placeholder:text-stone-500 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20";

export function CategoryForm({ action, initialValues, submitLabel }: CategoryFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const [name, setName] = useState(initialValues?.name ?? "");
  const formRef = useRef<HTMLFormElement>(null);
  const slug = initialValues?.slug ?? slugify(name);

  useEffect(() => {
    if (state.ok && !initialValues) {
      formRef.current?.reset();
      setName("");
    }
  }, [state, initialValues]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      {initialValues && <input type="hidden" name="id" value={initialValues.id} />}
      <input type="hidden" name="slug" value={slug} />

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      )}
      {state.ok && !initialValues && (
        <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Category added. Add questions to it so it appears in the game.
        </p>
      )}

      <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-800">
        Name
        <input
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Kenyan Wildlife"
          className={FIELD}
        />
      </label>

      <p className="text-sm text-stone-500">
        Play URL: <span className="font-medium text-stone-700">/play/{slug || "…"}</span>
        {initialValues ? " · renaming does not change the URL" : null}
      </p>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-800">
        Description <span className="font-normal text-stone-500">(optional)</span>
        <textarea
          name="description"
          rows={2}
          defaultValue={initialValues?.description ?? ""}
          placeholder="Logos, slogans, and brands from home."
          className={FIELD}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 cursor-pointer self-start rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
