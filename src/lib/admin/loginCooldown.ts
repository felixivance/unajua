// ponytail: client-side only, bypassable by a direct API call — real
// brute-force protection is Supabase's server-side rate limit. This just
// stops a careless retry loop/script from hammering the form.
export const MAX_ATTEMPTS_BEFORE_COOLDOWN = 3;
export const COOLDOWN_SECONDS = 15;

export function registerFailure(failCount: number, now: number) {
  const next = failCount + 1;
  return next >= MAX_ATTEMPTS_BEFORE_COOLDOWN
    ? { failCount: 0, lockedUntil: now + COOLDOWN_SECONDS * 1000 }
    : { failCount: next, lockedUntil: 0 };
}

export function secondsLeft(lockedUntil: number, now: number) {
  return Math.max(0, Math.ceil((lockedUntil - now) / 1000));
}
