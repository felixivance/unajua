// Spec: docs/specs/leaderboards.md. The ranking window lives only in SQL
// (leaderboard_since); this file has the display helpers.
export type Period = "day" | "week" | "all";

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
// Africa/Nairobi is UTC+3 all year (no daylight saving).
const NAIROBI_OFFSET_MS = 3 * HOUR;

export function parsePeriod(value: unknown): Period {
  return value === "day" || value === "week" ? value : "all";
}

export function timeAgo(playedAt: number, now: number) {
  const ms = now - playedAt;
  if (ms < 5 * SEC) return "just now";
  if (ms < MIN) return `${Math.floor(ms / SEC)}s ago`;
  if (ms < HOUR) return `${Math.floor(ms / MIN)}m ago`;
  if (ms < DAY) return `${Math.floor(ms / HOUR)}h ago`;
  return `${Math.floor(ms / DAY)}d ago`;
}

/** Epoch ms of the next Nairobi midnight (day) or Monday 00:00 (week). */
export function nextReset(period: "day" | "week", now: number) {
  const dayStart = Math.floor((now + NAIROBI_OFFSET_MS) / DAY) * DAY;
  const daysToAdd =
    period === "day" ? 1 : 7 - ((new Date(dayStart).getUTCDay() + 6) % 7);
  return dayStart + daysToAdd * DAY - NAIROBI_OFFSET_MS;
}

export function formatCountdown(ms: number) {
  if (ms >= DAY) return `${Math.floor(ms / DAY)}d ${Math.floor((ms % DAY) / HOUR)}h`;
  if (ms >= HOUR) return `${Math.floor(ms / HOUR)}h ${Math.floor((ms % HOUR) / MIN)}m`;
  if (ms >= MIN) return `${Math.floor(ms / MIN)}m`;
  return "<1m";
}
