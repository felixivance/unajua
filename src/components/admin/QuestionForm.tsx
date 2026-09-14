"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
};

export function QuestionForm({
  categories,
  initialValues,
  action,
  submitLabel,
}: QuestionFormProps) {
  const [imageUrl, setImageUrl] = useState(initialValues?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

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

  return (
    <form action={action} className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        Category
        <select
          name="category_id"
          required
          defaultValue={initialValues?.category_id}
          className="rounded-lg border border-gray-300 px-4 py-2"
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        Prompt
        <input
          name="prompt"
          required
          defaultValue={initialValues?.prompt}
          placeholder="Which company does this logo belong to?"
          className="rounded-lg border border-gray-300 px-4 py-2"
        />
      </label>

      <div className="flex flex-col gap-2 text-sm font-medium text-gray-700">
        Image
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {uploading && <span className="text-gray-500">Uploading...</span>}
        {uploadError && <span className="text-red-600">{uploadError}</span>}
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Preview" className="h-32 w-32 rounded object-contain" />
        )}
        <input type="hidden" name="image_url" value={imageUrl} />
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        Accepted answer
        <input
          name="accepted_answer"
          required
          defaultValue={initialValues?.accepted_answer}
          placeholder="SAFARICOM"
          className="rounded-lg border border-gray-300 px-4 py-2 uppercase"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        Alternative answers (comma separated)
        <input
          name="alternative_answers"
          defaultValue={initialValues?.alternative_answers?.join(", ")}
          placeholder="M-PESA, M PESA"
          className="rounded-lg border border-gray-300 px-4 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        Explanation / fun fact
        <textarea
          name="explanation"
          defaultValue={initialValues?.explanation ?? ""}
          className="rounded-lg border border-gray-300 px-4 py-2"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Source name
          <input
            name="source_name"
            defaultValue={initialValues?.source_name ?? ""}
            className="rounded-lg border border-gray-300 px-4 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Source URL
          <input
            name="source_url"
            defaultValue={initialValues?.source_url ?? ""}
            className="rounded-lg border border-gray-300 px-4 py-2"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        Difficulty (1-3)
        <input
          name="difficulty"
          type="number"
          min={1}
          max={3}
          defaultValue={initialValues?.difficulty ?? 1}
          className="w-24 rounded-lg border border-gray-300 px-4 py-2"
        />
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <input type="checkbox" name="is_active" defaultChecked={initialValues?.is_active ?? false} />
        Published
      </label>

      <button
        type="submit"
        disabled={uploading}
        className="self-start rounded-lg bg-emerald-600 px-6 py-2 font-semibold text-white disabled:opacity-60"
      >
        {submitLabel}
      </button>
    </form>
  );
}
