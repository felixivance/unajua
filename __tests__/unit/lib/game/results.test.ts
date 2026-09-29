// Spec: docs/specs/results-screen.md (AC numbers in test names)
import { describe, expect, test } from "vitest";
import { rankLabel, resultGrid, resultTier, shareText } from "@/lib/game/results";

describe("resultTier (AC-1)", () => {
  test("perfect only when every question is right", () => {
    expect(resultTier(10, 10).key).toBe("perfect");
    expect(resultTier(9, 10).key).toBe("sharp");
  });
  test("boundaries", () => {
    expect(resultTier(8, 10).key).toBe("sharp");
    expect(resultTier(7, 10).key).toBe("ok");
    expect(resultTier(5, 10).key).toBe("ok");
    expect(resultTier(4, 10).key).toBe("try");
  });
  test("no questions is not perfect", () => {
    expect(resultTier(0, 0).key).toBe("try");
  });
  test("every tier has copy", () => {
    for (const [c, t] of [[10, 10], [8, 10], [5, 10], [0, 10]]) {
      const tier = resultTier(c, t);
      expect(tier.headline).toBeTruthy();
      expect(tier.sub).toBeTruthy();
    }
  });
});

describe("resultGrid (AC-3)", () => {
  test("green, red, white in question order", () => {
    const answers = [
      { isCorrect: true, submittedAnswer: "Nairobi" },
      { isCorrect: false, submittedAnswer: "Kisumu" },
      { isCorrect: false, submittedAnswer: "SKIP" },
    ];
    expect(resultGrid(answers)).toEqual(["correct", "wrong", "skipped"]);
  });
});

describe("rankLabel (AC-4)", () => {
  test("rank 1 gets a crown", () => {
    expect(rankLabel(1)).toBe("#1 👑");
  });
  test("others are plain", () => {
    expect(rankLabel(7)).toBe("#7");
  });
});

describe("shareText (AC-6)", () => {
  const grid = ["correct", "wrong", "skipped"] as const;
  test("includes category, emoji grid, score, rank and challenge", () => {
    expect(shareText({ categoryName: "Kenyan Counties", grid: [...grid], correct: 1, total: 3, rank: 4 })).toBe(
      "🇰🇪 Unajua: Kenyan Counties\n🟩🟥⬜\n1/3 · #4 on the board\nCan you beat me?",
    );
  });
  test("omits the rank when unknown", () => {
    expect(shareText({ categoryName: "Brands", grid: [...grid], correct: 1, total: 3, rank: null })).toBe(
      "🇰🇪 Unajua: Brands\n🟩🟥⬜\n1/3\nCan you beat me?",
    );
  });
});
