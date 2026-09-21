"use client";

import { useActionState, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { normalizeAnswer } from "@/lib/admin/slug";
import type { ActionState } from "@/lib/admin/actions";

type Category = { id: string; name: string };

type QuestionFormValues = {
  id?: string;
  category_id?: string;
  prompt?: string;
  image_url?: string | null;
  accepted_answer?: string;
  alternative_answers?: string[];
  explanation?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  difficulty?: number;
  is_active?: boolean;
};

type QuestionFormProps = {
  categories: Category[];
  initialValues?: QuestionFormValues;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  allowAddAnother?: boolean;
  defaultCategoryId?: string;
};

const FIELD =
  "rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 placeholder:text-stone-500 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20";

const DIFFICULTY = [
  { value: 1, label: "Easy" },
  { value: 2, label: "Medium" },
  { value: 3, label: "Hard" },
] as const;

export function QuestionForm({
  categories,
  initialValues,
  action,
  submitLabel,
  allowAddAnother,
  defaultCategoryId,
}: QuestionFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const [imageUrl, setImageUrl] = useState(initialValues?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [answer, setAnswer] = useState(initialValues?.accepted_answer ?? "");
  const [alts, setAlts] = useState<string[]>(initialValues?.alternative_answers ?? []);
  const [altDraft, setAltDraft] = useState("");
  const letters = useMemo(() => normalizeAnswer(answer).split("").filter(Boolean), [answer]);

  async function uploadFile(file: File) {
    setUploading(true);
    setUploadError(null);
    const supabase = createClient();
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;
    const { error } = await supabase.storage.from("question-images").upload(path, file);
    if (error) {
      setUploadError(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("question-images").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploading(false);
  }

  function addAlt(value: string) {
    const next = value.trim();
    if (!next || alts.includes(next)) {
      setAltDraft("");
      return;
    }
    setAlts([...alts, next]);
    setAltDraft("");
  }

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {initialValues?.id && <input type="hidden" name="id" value={initialValues.id} />}
      <input type="hidden" name="image_url" value={imageUrl} />
      <input type="hidden" name="alternative_answers" value={alts.join(", ")} />

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      )}

      <section className="flex flex-col gap-5 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">The puzzle</h2>
          <p className="mt-1 text-sm text-stone-500">This is what players see and spell.</p>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-800">
          Category
          <select
            name="category_id"
            required
            defaultValue={initialValues?.category_id ?? defaultCategoryId ?? ""}
            className={FIELD}
          >
            <option value="" disabled>
              Choose a category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-stone-800">Image</span>
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) void uploadFile(file);
            }}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center text-sm text-stone-600 hover:border-emerald-500 hover:bg-emerald-50/50"
          >
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadFile(file);
              }}
            />
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="Question" className="max-h-40 object-contain" />
            ) : (
              <span>{uploading ? "Uploading…" : "Drop an image here, or click to upload"}</span>
            )}
          </label>
          {uploadError && <p className="text-sm text-red-700">{uploadError}</p>}
          {imageUrl && (
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="self-start text-sm text-stone-600 underline"
            >
              Remove image
            </button>
          )}
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-800">
          Prompt
          <input
            name="prompt"
            required
            defaultValue={initialValues?.prompt}
            placeholder="Which company does this logo belong to?"
            className={FIELD}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-800">
          Accepted answer
          <input
            name="accepted_answer"
            required
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Safaricom"
            className={`${FIELD} uppercase`}
          />
          <span className="font-normal text-stone-500">
            Spaces and punctuation are stripped. Players spell the letters below.
          </span>
        </label>

        <div aria-live="polite">
          {letters.length ? (
            <div className="flex flex-wrap gap-1.5">
              {letters.map((letter, i) => (
                <span
                  key={`${letter}-${i}`}
                  className="grid h-10 w-10 place-items-center rounded-md border-2 border-emerald-600 bg-white text-sm font-bold text-emerald-900"
                >
                  {letter}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-400">Tiles appear as you type the answer.</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-stone-800">Also accept</span>
          <div className="flex flex-wrap gap-2">
            {alts.map((alt) => (
              <span
                key={alt}
                className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-800"
              >
                {alt}
                <button
                  type="button"
                  aria-label={`Remove ${alt}`}
                  onClick={() => setAlts(alts.filter((item) => item !== alt))}
                  className="grid h-5 w-5 place-items-center rounded-full text-stone-500 hover:bg-stone-200 hover:text-stone-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            value={altDraft}
            onChange={(e) => setAltDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addAlt(altDraft);
              }
            }}
            onBlur={() => addAlt(altDraft)}
            placeholder="M-PESA, then Enter"
            className={FIELD}
          />
          <span className="text-sm text-stone-500">Other spellings players might try. Press Enter to add.</span>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-stone-800">Difficulty</legend>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTY.map((item) => (
              <label key={item.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="difficulty"
                  value={item.value}
                  defaultChecked={(initialValues?.difficulty ?? 1) === item.value}
                  className="peer sr-only"
                />
                <span className="inline-flex min-h-11 items-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 peer-checked:border-emerald-700 peer-checked:bg-emerald-700 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-600">
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <details
        className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"
        open={Boolean(initialValues?.explanation || initialValues?.source_name || initialValues?.source_url)}
      >
        <summary className="cursor-pointer text-lg font-semibold text-stone-900">
          After they guess
          <span className="ml-2 text-sm font-normal text-stone-500">optional</span>
        </summary>
        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-800">
            Fun fact
            <textarea
              name="explanation"
              rows={3}
              defaultValue={initialValues?.explanation ?? ""}
              placeholder="Safaricom launched M-PESA in 2007."
              className={FIELD}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-800">
              Source name
              <input
                name="source_name"
                defaultValue={initialValues?.source_name ?? ""}
                placeholder="Safaricom"
                className={FIELD}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-800">
              Source URL
              <input
                name="source_url"
                type="url"
                defaultValue={initialValues?.source_url ?? ""}
                placeholder="https://"
                className={FIELD}
              />
            </label>
          </div>
        </div>
      </details>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-stone-800">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={initialValues?.is_active ?? true}
            className="mt-1 h-4 w-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
          />
          <span>
            <span className="font-medium">Publish now</span>
            <span className="mt-0.5 block text-stone-500">
              Players only see published questions in live categories.
            </span>
          </span>
        </label>

        <div className="flex flex-wrap gap-2">
          {allowAddAnother && (
            <button
              type="submit"
              name="intent"
              value="add_another"
              disabled={pending || uploading}
              className="min-h-11 cursor-pointer rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-60"
            >
              Save and add another
            </button>
          )}
          <button
            type="submit"
            disabled={pending || uploading}
            className="min-h-11 cursor-pointer rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {pending ? "Saving…" : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
