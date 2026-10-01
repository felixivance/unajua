// Spec: docs/specs/resume-game.md (AC numbers in test names)
import { describe, expect, test } from "vitest";
import { toResumed, type ResumeRow } from "@/lib/game/resume";

const row = (n: number, answered: boolean, correct = true): ResumeRow => ({
  game_id: "g1",
  question_id: `q${n}`,
  category_id: "c1",
  prompt: `p${n}`,
  image_url: null,
  difficulty: 1,
  letter_tiles: ["A"],
  answer_length: 1,
  remaining_ms: 42_000,
  submitted_answer: answered ? (correct ? "A" : "SKIP") : null,
  is_correct: answered ? correct : null,
  points_earned: answered ? (correct ? 100 : 0) : null,
});

describe("toResumed", () => {
  test("AC-2 keeps question order and turns answered rows into answers", () => {
    const r = toResumed([row(1, true), row(2, true, false), row(3, false)])!;
    expect(r.gameId).toBe("g1");
    expect(r.questions.map((q) => q.id)).toEqual(["q1", "q2", "q3"]);
    expect(r.answers.map((a) => a.question.id)).toEqual(["q1", "q2"]);
    expect(r.answers.map((a) => a.pointsEarned)).toEqual([100, 0]);
    expect(r.answers[1].submittedAnswer).toBe("SKIP");
  });
  test("AC-6 carries the server's remaining time", () => {
    expect(toResumed([row(1, false)])!.remainingMs).toBe(42_000);
  });
  test("AC-7 fully answered game has answers.length === questions.length", () => {
    const r = toResumed([row(1, true), row(2, true)])!;
    expect(r.answers.length).toBe(r.questions.length);
  });
  test("AC-4 no rows (expired, completed, wrong device) is null", () => {
    expect(toResumed([])).toBeNull();
  });
});
