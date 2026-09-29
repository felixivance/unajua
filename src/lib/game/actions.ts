"use server";

import { createClient } from "@/lib/supabase/server";
import type { PlayQuestion } from "@/types/game";

export type AnswerCheck = {
  isCorrect: boolean;
  acceptedAnswer: string;
  explanation: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  pointsEarned: number;
};

export type GameSession = {
  gameId: string;
  questions: PlayQuestion[];
};

export type GameResult = {
  score: number;
  correctCount: number;
  totalQuestions: number;
};

type StartRow = {
  game_id: string;
  question_id: string;
  category_id: string;
  prompt: string;
  image_url: string | null;
  difficulty: number;
  letter_tiles: string[];
  answer_length: number;
};

type CheckRow = {
  is_correct: boolean;
  accepted_answer: string;
  explanation: string | null;
  source_name: string | null;
  source_url: string | null;
  points_earned: number;
};

type CompleteRow = {
  score: number;
  correct_count: number;
  total_questions: number;
};

function firstRow<T>(data: T[] | T | null): T | null {
  if (!data) return null;
  return Array.isArray(data) ? (data[0] ?? null) : data;
}

export async function claimNickname(nickname: string, token: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("claim_nickname", {
    p_nickname: nickname,
    p_token: token,
  });
  if (error) throw new Error(error.message);
  return data === true;
}

export async function startGame(
  categoryId: string,
  nickname: string,
  token: string
): Promise<GameSession> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_game", {
    p_category_id: categoryId,
    p_nickname: nickname,
    p_token: token,
  });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as StartRow[];
  if (rows.length === 0) throw new Error("No questions in this category.");

  return {
    gameId: rows[0].game_id,
    questions: rows.map((row) => ({
      id: row.question_id,
      category_id: row.category_id,
      prompt: row.prompt,
      image_url: row.image_url,
      difficulty: row.difficulty,
      letter_tiles: row.letter_tiles,
      answer_length: row.answer_length,
    })),
  };
}

export async function submitGameAnswer(
  gameId: string,
  questionId: string,
  submitted: string
): Promise<AnswerCheck> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_game_answer", {
    p_game_id: gameId,
    p_question_id: questionId,
    p_submitted: submitted,
  });

  if (error) throw new Error(error.message);

  const row = firstRow(data) as CheckRow | null;
  if (!row) throw new Error("Could not check that answer.");

  return {
    isCorrect: row.is_correct,
    acceptedAnswer: row.accepted_answer,
    explanation: row.explanation,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    pointsEarned: row.points_earned,
  };
}

export async function completeGame(gameId: string): Promise<GameResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("complete_game", {
    p_game_id: gameId,
  });

  if (error) throw new Error(error.message);

  const row = firstRow(data) as CompleteRow | null;
  if (!row) throw new Error("Could not save that game.");

  return {
    score: row.score,
    correctCount: row.correct_count,
    totalQuestions: row.total_questions,
  };
}
