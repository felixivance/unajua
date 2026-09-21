import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GameContainer } from "@/components/game/GameContainer";
import type { PlayQuestion } from "@/types/game";

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

  const { data: questions, error } = await supabase.rpc("get_play_questions", {
    p_category_id: category.id,
  });

  if (error || !questions?.length) notFound();

  return (
    <GameContainer
      categoryId={category.id}
      categoryName={category.name}
      questions={questions as PlayQuestion[]}
    />
  );
}
