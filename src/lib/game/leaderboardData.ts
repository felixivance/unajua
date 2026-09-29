import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { Period } from "@/lib/game/leaderboard";

export type BoardRow = {
  rank: number;
  nickname: string;
  score: number;
  categories_played: number;
  reached_at: string;
};

export type BoardCategory = { slug: string; name: string };

// Cookie-free client: cached results must not depend on the visitor.
const anon = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// ponytail: unstable_cache is marked replaced by `use cache` in Next 16; migrate
// when we enable cacheComponents (it changes caching app-wide).
export const getBoard = unstable_cache(
  async (period: Period, category: string | null): Promise<BoardRow[]> => {
    const { data, error } = await anon().rpc("get_leaderboard", {
      p_period: period,
      p_category_slug: category,
      p_limit: 10,
    });
    if (error) throw new Error(error.message);
    return (data ?? []) as BoardRow[];
  },
  ["leaderboard"],
  { revalidate: 60 },
);

/** Active categories that have at least one active question. */
export const getBoardCategories = unstable_cache(
  async (): Promise<BoardCategory[]> => {
    const supabase = anon();
    const [{ data: categories }, { data: questions }] = await Promise.all([
      supabase.from("categories").select("id, slug, name").eq("is_active", true).order("name"),
      supabase.from("questions").select("category_id").eq("is_active", true),
    ]);
    const withQuestions = new Set((questions ?? []).map((q) => q.category_id));
    return (categories ?? [])
      .filter((c) => withQuestions.has(c.id))
      .map(({ slug, name }) => ({ slug, name }));
  },
  ["board-categories"],
  { revalidate: 60 },
);
