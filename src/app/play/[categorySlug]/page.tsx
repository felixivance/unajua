import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GameContainer } from "@/components/game/GameContainer";

type PlayPageProps = {
  params: Promise<{ categorySlug: string }>;
};

export default async function PlayPage({ params }: PlayPageProps) {
  const { categorySlug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id, name")
    .eq("slug", categorySlug)
    .eq("is_active", true)
    .single();

  if (!category) notFound();

  const { data: sample } = await supabase
    .from("questions")
    .select("id")
    .eq("category_id", category.id)
    .eq("is_active", true)
    .limit(1);

  if (!sample?.length) notFound();

  return <GameContainer categoryId={category.id} categoryName={category.name} />;
}
