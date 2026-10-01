// Spec: docs/specs/resume-game.md
// The browser keeps only the game id; questions, answers and the clock come from resume_game.
import type { AnsweredQuestion, PlayQuestion } from "@/types/game";

export type ResumeRow = {
  game_id: string;
  question_id: string;
  category_id: string;
  prompt: string;
  image_url: string | null;
  difficulty: number;
  letter_tiles: string[];
  answer_length: number;
  remaining_ms: number;
  submitted_answer: string | null;
  is_correct: boolean | null;
  points_earned: number | null;
};

export type ResumedGame = {
  gameId: string;
  questions: PlayQuestion[];
  answers: AnsweredQuestion[];
  remainingMs: number;
};

export function toResumed(rows: ResumeRow[]): ResumedGame | null {
  if (rows.length === 0) return null;
  const questions: PlayQuestion[] = rows.map((r) => ({
    id: r.question_id,
    category_id: r.category_id,
    prompt: r.prompt,
    image_url: r.image_url,
    difficulty: r.difficulty,
    letter_tiles: r.letter_tiles,
    answer_length: r.answer_length,
  }));
  // Answers are stored in order, so the answered rows are a prefix of the question list.
  const answers: AnsweredQuestion[] = [];
  rows.forEach((r, i) => {
    if (r.submitted_answer === null) return;
    answers.push({
      question: questions[i],
      submittedAnswer: r.submitted_answer,
      isCorrect: r.is_correct === true,
      pointsEarned: r.points_earned ?? 0,
      acceptedAnswer: "",
      explanation: null,
      sourceName: null,
    });
  });
  return { gameId: rows[0].game_id, questions, answers, remainingMs: rows[0].remaining_ms };
}

const key = (categorySlug: string) => `unajua_game_${categorySlug}`;

export function saveGameId(categorySlug: string, gameId: string) {
  window.localStorage.setItem(key(categorySlug), gameId);
}

export function loadGameId(categorySlug: string): string | null {
  return window.localStorage.getItem(key(categorySlug));
}

export function clearGameId(categorySlug: string) {
  window.localStorage.removeItem(key(categorySlug));
}
