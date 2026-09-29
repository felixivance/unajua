import { describe, expect, test } from "vitest";
import {
  QUESTION_TIME_LIMIT_MS,
  fractionLeft,
  isExpired,
  isUrgent,
  secondsLeft,
} from "@/lib/game/questionTimer";

const START = 1_000_000;
const DEADLINE = START + QUESTION_TIME_LIMIT_MS;

describe("questionTimer", () => {
  test("AC-1: limit is 60 seconds", () => {
    expect(QUESTION_TIME_LIMIT_MS).toBe(60_000);
  });

  test("AC-3: fractionLeft runs from 1 to 0 and is clamped", () => {
    expect(fractionLeft(DEADLINE, START)).toBe(1);
    expect(fractionLeft(DEADLINE, START + 30_000)).toBe(0.5);
    expect(fractionLeft(DEADLINE, DEADLINE)).toBe(0);
    expect(fractionLeft(DEADLINE, DEADLINE + 5_000)).toBe(0);
    expect(fractionLeft(DEADLINE, START - 5_000)).toBe(1);
  });

  test("AC-3: secondsLeft rounds up", () => {
    expect(secondsLeft(DEADLINE, START)).toBe(60);
    expect(secondsLeft(DEADLINE, START + 59_100)).toBe(1);
    expect(secondsLeft(DEADLINE, DEADLINE)).toBe(0);
  });

  test("AC-5: isExpired flips exactly at the deadline", () => {
    expect(isExpired(DEADLINE, DEADLINE - 1)).toBe(false);
    expect(isExpired(DEADLINE, DEADLINE)).toBe(true);
    expect(isExpired(DEADLINE, DEADLINE + 1)).toBe(true);
  });

  test("AC-7: a long gap (backgrounded tab) is fully expired, not partial", () => {
    const now = START + 5 * 60_000;
    expect(secondsLeft(DEADLINE, now)).toBe(0);
    expect(isExpired(DEADLINE, now)).toBe(true);
  });

  test("AC-8: urgent at 10 seconds or less", () => {
    expect(isUrgent(11)).toBe(false);
    expect(isUrgent(10)).toBe(true);
    expect(isUrgent(0)).toBe(true);
  });
});
