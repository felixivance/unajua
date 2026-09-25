"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ponytail: client-side only, bypassable by a direct API call — real
// brute-force protection is Supabase's server-side rate limit. This just
// stops a careless retry loop/script from hammering the form.
const MAX_ATTEMPTS_BEFORE_COOLDOWN = 3;
const COOLDOWN_SECONDS = 15;

export function AdminLoginForm({ notAdminError }: { notAdminError: boolean }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const secondsLeft = Math.max(0, Math.ceil((lockedUntil - now) / 1000));
  const isLocked = secondsLeft > 0;

  useEffect(() => {
    if (!isLocked) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isLocked]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLocked) return;
    setError(null);
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      const nextFailCount = failCount + 1;
      setFailCount(nextFailCount);
      if (nextFailCount >= MAX_ATTEMPTS_BEFORE_COOLDOWN) {
        setFailCount(0);
        setLockedUntil(Date.now() + COOLDOWN_SECONDS * 1000);
        setNow(Date.now());
      }
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="text-center text-2xl font-bold text-stone-900">Unajua Admin</h1>

        {notAdminError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
            That account doesn&apos;t have admin access.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-800">
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-stone-300 px-4 py-2.5 text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-800">
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-stone-300 px-4 py-2.5 text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
          </label>
          {error && !isLocked && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          {isLocked && (
            <p role="alert" className="text-sm text-red-700">
              Too many attempts. Try again in {secondsLeft}s.
            </p>
          )}
          <button
            type="submit"
            disabled={loading || isLocked}
            className="min-h-11 cursor-pointer rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            Sign in
          </button>
        </form>
        <Link href="/" className="text-center text-sm text-stone-500 underline">
          Back to the game
        </Link>
      </div>
    </div>
  );
}
