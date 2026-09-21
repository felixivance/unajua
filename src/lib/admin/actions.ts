"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizeAnswer, slugify } from "@/lib/admin/slug";

export type ActionState = { error?: string; ok?: boolean };

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) throw new Error("Not an admin");

  return supabase;
}

function parseAlternatives(value: FormDataEntryValue | null): string[] {
  const raw = String(value ?? "").trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function friendlyError(message: string) {
  if (message.includes("duplicate key") || message.includes("unique")) {
    return "That name or URL is already in use.";
  }
  return message;
}

function questionFields(formData: FormData) {
  const accepted = String(formData.get("accepted_answer") ?? "").trim();
  const letters = normalizeAnswer(accepted);
  if (!String(formData.get("category_id") ?? "").trim()) {
    return { error: "Pick a category." } as const;
  }
  if (!String(formData.get("prompt") ?? "").trim()) {
    return { error: "Write a prompt." } as const;
  }
  if (!letters) {
    return { error: "Answer needs at least one letter or number." } as const;
  }
  return {
    category_id: String(formData.get("category_id")),
    prompt: String(formData.get("prompt") ?? "").trim(),
    image_url: String(formData.get("image_url") ?? "").trim() || null,
    accepted_answer: accepted,
    alternative_answers: parseAlternatives(formData.get("alternative_answers")),
    explanation: String(formData.get("explanation") ?? "").trim() || null,
    source_name: String(formData.get("source_name") ?? "").trim() || null,
    source_url: String(formData.get("source_url") ?? "").trim() || null,
    difficulty: Math.min(3, Math.max(1, Number(formData.get("difficulty") ?? 1) || 1)),
    is_active: formData.get("is_active") === "on",
  };
}

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await assertAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || name);
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!name || !slug) return { error: "Give the category a name." };

  const { error } = await supabase.from("categories").insert({ slug, name, description });
  if (error) return { error: friendlyError(error.message) };

  revalidatePath("/admin/categories");
  revalidatePath("/admin");
  revalidatePath("/play");
  return { ok: true };
}

export async function updateCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!id) return { error: "Missing category." };
  if (!name) return { error: "Give the category a name." };

  const { error } = await supabase.from("categories").update({ name, description }).eq("id", id);
  if (error) return { error: friendlyError(error.message) };

  revalidatePath("/admin/categories");
  revalidatePath("/admin");
  revalidatePath("/play");
  redirect("/admin/categories");
}

export async function toggleCategoryActive(categoryId: string, isActive: boolean) {
  const supabase = await assertAdmin();
  const { error } = await supabase
    .from("categories")
    .update({ is_active: isActive })
    .eq("id", categoryId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
  revalidatePath("/admin");
  revalidatePath("/play");
}

export async function createQuestion(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await assertAdmin();
  const fields = questionFields(formData);
  if ("error" in fields) return fields;

  const { error } = await supabase.from("questions").insert(fields);
  if (error) return { error: friendlyError(error.message) };

  revalidatePath("/admin/questions");
  revalidatePath("/admin");
  revalidatePath("/play");

  if (formData.get("intent") === "add_another") {
    redirect(`/admin/questions/new?category=${fields.category_id}&added=1`);
  }
  redirect("/admin/questions");
}

export async function updateQuestion(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing question." };

  const fields = questionFields(formData);
  if ("error" in fields) return fields;

  const { error } = await supabase.from("questions").update(fields).eq("id", id);
  if (error) return { error: friendlyError(error.message) };

  revalidatePath("/admin/questions");
  revalidatePath("/admin");
  revalidatePath("/play");
  redirect("/admin/questions");
}

export async function deleteQuestion(questionId: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("questions").delete().eq("id", questionId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/questions");
  revalidatePath("/admin");
  revalidatePath("/play");
}

export async function signOutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
