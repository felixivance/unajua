"use client";

import { useState } from "react";
import { LetterTiles } from "./LetterTiles";
import { ResultsScreen } from "./ResultsScreen";
import { calculatePoints, isAnswerCorrect } from "@/lib/game/answer";
import type { AnsweredQuestion, Question } from "@/types/game";

type GameScreenProps = {
  categoryId: string;
  categoryName: string;
  questions: Question[];
  nickname: string;
};

type Phase = "question" | "feedback" | "results";

export function GameScreen({ categoryId, categoryName, questions, nickname }: GameScreenProps) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [answers, setAnswers] = useState<AnsweredQuestion[]>([]);

  const question = questions[index];

  function handleSubmit(submitted: string) {
    const correct = isAnswerCorrect(
      submitted,
      question.accepted_answer,
      question.alternative_answers
    );
    const pointsEarned = calculatePoints(correct);

    setAnswers((prev) => [
      ...prev,
      { question, submittedAnswer: submitted, isCorrect: correct, pointsEarned },
    ]);
    setPhase("feedback");
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

          <LetterTiles answer={question.accepted_answer} onSubmit={handleSubmit} />
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
          <div className="text-lg font-semibold text-gray-800">
            {lastAnswer.question.accepted_answer}
          </div>
          {lastAnswer.question.explanation && (
            <div className="max-w-sm rounded-xl bg-amber-50 p-4 text-sm text-gray-700">
              <span className="font-semibold">Did you know? </span>
              {lastAnswer.question.explanation}
              {lastAnswer.question.source_name && (
                <div className="mt-2 text-xs text-gray-500">
                  Source: {lastAnswer.question.source_name}
                </div>
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
