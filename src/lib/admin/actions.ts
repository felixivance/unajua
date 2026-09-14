"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

export async function createCategory(formData: FormData) {
  const supabase = await assertAdmin();
  const slug = String(formData.get("slug") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  const { error } = await supabase.from("categories").insert({ slug, name, description });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
}

export async function toggleCategoryActive(categoryId: string, isActive: boolean) {
  const supabase = await assertAdmin();
  const { error } = await supabase
    .from("categories")
    .update({ is_active: isActive })
    .eq("id", categoryId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
}

function parseAlternatives(value: FormDataEntryValue | null): string[] {
  const raw = String(value ?? "").trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createQuestion(formData: FormData) {
  const supabase = await assertAdmin();

  const { error } = await supabase.from("questions").insert({
    category_id: String(formData.get("category_id")),
    prompt: String(formData.get("prompt") ?? "").trim(),
    image_url: String(formData.get("image_url") ?? "").trim() || null,
    accepted_answer: String(formData.get("accepted_answer") ?? "").trim(),
    alternative_answers: parseAlternatives(formData.get("alternative_answers")),
    explanation: String(formData.get("explanation") ?? "").trim() || null,
    source_name: String(formData.get("source_name") ?? "").trim() || null,
    source_url: String(formData.get("source_url") ?? "").trim() || null,
    difficulty: Number(formData.get("difficulty") ?? 1),
    is_active: formData.get("is_active") === "on",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}

export async function updateQuestion(questionId: string, formData: FormData) {
  const supabase = await assertAdmin();

  const { error } = await supabase
    .from("questions")
    .update({
      category_id: String(formData.get("category_id")),
      prompt: String(formData.get("prompt") ?? "").trim(),
      image_url: String(formData.get("image_url") ?? "").trim() || null,
      accepted_answer: String(formData.get("accepted_answer") ?? "").trim(),
      alternative_answers: parseAlternatives(formData.get("alternative_answers")),
      explanation: String(formData.get("explanation") ?? "").trim() || null,
      source_name: String(formData.get("source_name") ?? "").trim() || null,
      source_url: String(formData.get("source_url") ?? "").trim() || null,
      difficulty: Number(formData.get("difficulty") ?? 1),
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", questionId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}

export async function deleteQuestion(questionId: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("questions").delete().eq("id", questionId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/questions");
}

export async function signOutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
