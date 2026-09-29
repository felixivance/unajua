import { describe, expect, test } from "vitest";
import {
  COOLDOWN_SECONDS,
  registerFailure,
  secondsLeft,
} from "@/lib/admin/loginCooldown";

const NOW = 1_000_000;

describe("registerFailure", () => {
  test("AC-5: failures 1 and 2 do not lock", () => {
    expect(registerFailure(0, NOW)).toEqual({ failCount: 1, lockedUntil: 0 });
    expect(registerFailure(1, NOW)).toEqual({ failCount: 2, lockedUntil: 0 });
  });

  test("AC-1: the 3rd consecutive failure locks for 15s", () => {
    expect(COOLDOWN_SECONDS).toBe(15);
    expect(registerFailure(2, NOW).lockedUntil).toBe(NOW + 15_000);
  });

  test("AC-4: locking resets the failure count", () => {
    expect(registerFailure(2, NOW).failCount).toBe(0);
  });
});

describe("secondsLeft", () => {
  test("AC-3: counts down and rounds up", () => {
    const lockedUntil = NOW + 15_000;
    expect(secondsLeft(lockedUntil, NOW)).toBe(15);
    expect(secondsLeft(lockedUntil, NOW + 1)).toBe(15);
    expect(secondsLeft(lockedUntil, NOW + 14_001)).toBe(1);
  });

  test("AC-4: unlocked once the time has passed, never negative", () => {
    expect(secondsLeft(NOW + 15_000, NOW + 15_000)).toBe(0);
    expect(secondsLeft(NOW + 15_000, NOW + 99_000)).toBe(0);
    expect(secondsLeft(0, NOW)).toBe(0);
  });
});
