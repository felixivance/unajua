import Link from "next/link";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { signOutAdmin } from "@/lib/admin/actions";

export default async function AdminHomePage() {
  const { supabase, profile } = await requireAdmin();

  const { count: categoryCount } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true });
  const { count: questionCount } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile.nickname}</h1>
        <form action={signOutAdmin}>
          <button className="text-sm text-gray-500 underline">Sign out</button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/admin/categories"
          className="rounded-xl border border-gray-200 bg-white p-6 hover:border-emerald-400"
        >
          <div className="text-3xl font-bold text-emerald-700">{categoryCount ?? 0}</div>
          <div className="text-sm text-gray-600">Categories</div>
        </Link>
        <Link
          href="/admin/questions"
          className="rounded-xl border border-gray-200 bg-white p-6 hover:border-emerald-400"
        >
          <div className="text-3xl font-bold text-emerald-700">{questionCount ?? 0}</div>
          <div className="text-sm text-gray-600">Questions</div>
        </Link>
      </div>
    </div>
  );
}
