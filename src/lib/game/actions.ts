"use server";

import { createClient } from "@/lib/supabase/server";

export type AnswerCheck = {
  isCorrect: boolean;
  acceptedAnswer: string;
  explanation: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  pointsEarned: number;
};

type CheckRow = {
  is_correct: boolean;
  accepted_answer: string;
  explanation: string | null;
  source_name: string | null;
  source_url: string | null;
  points_earned: number;
};

export async function checkAnswer(
  questionId: string,
  submitted: string
): Promise<AnswerCheck> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_question_answer", {
    p_question_id: questionId,
    p_submitted: submitted,
  });

  if (error) throw new Error(error.message);

  const row = (Array.isArray(data) ? data[0] : data) as CheckRow | null;
  if (!row) throw new Error("Question not found");

  return {
    isCorrect: row.is_correct,
    acceptedAnswer: row.accepted_answer,
    explanation: row.explanation,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    pointsEarned: row.points_earned,
  };
}
