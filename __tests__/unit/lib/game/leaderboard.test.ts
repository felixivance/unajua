// Spec: docs/specs/leaderboards.md (AC numbers in test names)
import { describe, expect, test } from "vitest";
import { formatCountdown, nextReset, timeAgo } from "@/lib/game/leaderboard";

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
// Nairobi is UTC+3, so 00:00 Nairobi is 21:00 UTC the day before.
const nairobi = (y: number, m: number, d: number, h = 0, min = 0, s = 0) =>
  Date.UTC(y, m - 1, d, h - 3, min, s);

describe("timeAgo (AC-21)", () => {
  const now = nairobi(2026, 9, 29, 12);
  const ago = (ms: number) => timeAgo(now - ms, now);

  test("under 5s is 'just now'", () => {
    expect(ago(0)).toBe("just now");
    expect(ago(4_999)).toBe("just now");
  });
  test("seconds", () => {
    expect(ago(5 * SEC)).toBe("5s ago");
    expect(ago(59_999)).toBe("59s ago");
  });
  test("minutes, hours, days floor", () => {
    expect(ago(MIN)).toBe("1m ago");
    expect(ago(HOUR - 1)).toBe("59m ago");
    expect(ago(HOUR)).toBe("1h ago");
    expect(ago(DAY - 1)).toBe("23h ago");
    expect(ago(DAY)).toBe("1d ago");
    expect(ago(3 * DAY + HOUR)).toBe("3d ago");
  });
  test("a time in the future reads 'just now'", () => {
    expect(timeAgo(now + 10 * MIN, now)).toBe("just now");
  });
});

describe("nextReset day (AC-22)", () => {
  test("afternoon Nairobi resets at the next Nairobi midnight", () => {
    const now = nairobi(2026, 9, 29, 13);
    expect(nextReset("day", now)).toBe(nairobi(2026, 9, 30));
  });
  test("22:00 UTC is already tomorrow in Nairobi", () => {
    const now = Date.UTC(2026, 8, 29, 22, 0);
    expect(nextReset("day", now)).toBe(nairobi(2026, 10, 1));
  });
  test("exactly midnight belongs to the new day", () => {
    const now = nairobi(2026, 9, 30);
    expect(nextReset("day", now)).toBe(nairobi(2026, 10, 1));
  });
  test("one millisecond before midnight resets in one millisecond", () => {
    const now = nairobi(2026, 9, 30) - 1;
    expect(nextReset("day", now)).toBe(now + 1);
  });
});

describe("nextReset week (AC-22)", () => {
  test("Tuesday resets next Monday 00:00 Nairobi", () => {
    const now = nairobi(2026, 9, 29, 13); // Tuesday
    expect(nextReset("week", now)).toBe(nairobi(2026, 10, 5));
  });
  test("Sunday 23:59:59 resets one second later", () => {
    const now = nairobi(2026, 10, 4, 23, 59, 59);
    expect(nextReset("week", now)).toBe(nairobi(2026, 10, 5));
  });
  test("exactly Monday 00:00 belongs to the new week", () => {
    const now = nairobi(2026, 10, 5);
    expect(nextReset("week", now)).toBe(nairobi(2026, 10, 12));
  });
});

describe("formatCountdown (AC-22)", () => {
  test("days and hours", () => {
    expect(formatCountdown(2 * DAY + 4 * HOUR + 5 * MIN)).toBe("2d 4h");
  });
  test("hours and minutes", () => {
    expect(formatCountdown(3 * HOUR + 12 * MIN + 30 * SEC)).toBe("3h 12m");
  });
  test("minutes", () => {
    expect(formatCountdown(12 * MIN)).toBe("12m");
  });
  test("under a minute", () => {
    expect(formatCountdown(30 * SEC)).toBe("<1m");
    expect(formatCountdown(0)).toBe("<1m");
  });
});
