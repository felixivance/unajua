"use client";

import { useState } from "react";
import { LetterTiles } from "./LetterTiles";
import { ResultsScreen } from "./ResultsScreen";
import { checkAnswer } from "@/lib/game/actions";
import type { AnsweredQuestion, PlayQuestion } from "@/types/game";

type GameScreenProps = {
  categoryId: string;
  categoryName: string;
  questions: PlayQuestion[];
  nickname: string;
};

type Phase = "question" | "feedback" | "results";

export function GameScreen({ categoryId, categoryName, questions, nickname }: GameScreenProps) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [answers, setAnswers] = useState<AnsweredQuestion[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = questions[index];

  async function handleSubmit(submitted: string) {
    setBusy(true);
    setError(null);
    try {
      const result = await checkAnswer(question.id, submitted);
      setAnswers((prev) => [
        ...prev,
        {
          question,
          submittedAnswer: submitted,
          isCorrect: result.isCorrect,
          pointsEarned: result.pointsEarned,
          acceptedAnswer: result.acceptedAnswer,
          explanation: result.explanation,
          sourceName: result.sourceName,
        },
      ]);
      setPhase("feedback");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check that answer.");
    } finally {
      setBusy(false);
    }
  }

  function handleNext() {
    if (index + 1 >= questions.length) {
      setPhase("results");
    } else {
      setIndex((prev) => prev + 1);
      setPhase("question");
    }
  }

  if (phase === "results") {
    return (
      <ResultsScreen
        categoryId={categoryId}
        categoryName={categoryName}
        answers={answers}
        nickname={nickname}
      />
    );
  }

  const lastAnswer = answers[answers.length - 1];

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center gap-8 px-4 py-10">
      <div className="w-full text-center text-sm font-semibold text-emerald-700">
        {categoryName} · Question {index + 1} of {questions.length}
      </div>

      {phase === "question" && (
        <>
          {question.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={question.image_url}
              alt="Guess this"
              className="max-h-60 w-full rounded-xl object-contain"
            />
          )}

          <h1 className="text-center text-2xl font-bold text-gray-900">{question.prompt}</h1>

          <LetterTiles
            key={question.id}
            letters={question.letter_tiles}
            answerLength={question.answer_length}
            disabled={busy}
            onSubmit={handleSubmit}
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
        </>
      )}

      {phase === "feedback" && lastAnswer && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className={`text-3xl font-extrabold ${
              lastAnswer.isCorrect ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {lastAnswer.isCorrect ? "Correct! 🔥" : "Not quite!"}
          </div>
          <div className="text-lg font-semibold text-gray-800">{lastAnswer.acceptedAnswer}</div>
          {lastAnswer.explanation && (
            <div className="max-w-sm rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
              <span className="font-semibold">Did you know? </span>
              {lastAnswer.explanation}
              {lastAnswer.sourceName && (
                <div className="mt-2 text-xs text-amber-900">Source: {lastAnswer.sourceName}</div>
              )}
            </div>
          )}
          {lastAnswer.isCorrect && (
            <div className="text-sm font-medium text-emerald-700">
              +{lastAnswer.pointsEarned} points
            </div>
          )}
          <button
            onClick={handleNext}
            className="rounded-full bg-emerald-600 px-10 py-3 text-lg font-bold text-white"
          >
            {index + 1 >= questions.length ? "See results" : "Next question"}
          </button>
        </div>
      )}
    </div>
  );
}
