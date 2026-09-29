"use client";

import { useEffect, useState } from "react";
import { formatCountdown, nextReset, timeAgo } from "@/lib/game/leaderboard";

// null until mounted, so server HTML and first client render match.
function useNow(intervalMs: number) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, intervalMs);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [intervalMs]);
  return now;
}

export function TimeAgo({ at }: { at: string }) {
  const now = useNow(5000);
  return (
    <time dateTime={at}>
      {now === null ? "" : timeAgo(Date.parse(at), now)}
    </time>
  );
}

export function ResetsIn({ period }: { period: "day" | "week" }) {
  const now = useNow(30_000);
  if (now === null) return null;
  return <span>Resets in {formatCountdown(nextReset(period, now) - now)}</span>;
}
