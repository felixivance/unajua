import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, nickname")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/admin/login?error=not_admin");

  return { supabase, user, profile };
}
