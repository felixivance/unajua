'use client';

import { useEffect, useState } from 'react';
import { LetterTiles } from './LetterTiles';
import { ResultsScreen } from './ResultsScreen';
import { GameShell } from './GameShell';
import { submitGameAnswer } from '@/lib/game/actions';
import {
  QUESTION_TIME_LIMIT_MS,
  fractionLeft,
  isExpired,
  isUrgent,
  secondsLeft,
} from '@/lib/game/questionTimer';
import type { AnsweredQuestion, PlayQuestion } from '@/types/game';

type GameScreenProps = {
  gameId: string;
  categoryName: string;
  categorySlug: string;
  questions: PlayQuestion[];
  handle: string;
  /** Set when resuming after a refresh (docs/specs/resume-game.md). */
  initialAnswers?: AnsweredQuestion[];
  initialRemainingMs?: number;
};

type Phase = 'question' | 'feedback' | 'results';

export function GameScreen({
  gameId,
  categoryName,
  categorySlug,
  questions,
  handle,
  initialAnswers = [],
  initialRemainingMs = QUESTION_TIME_LIMIT_MS,
}: GameScreenProps) {
  const [index, setIndex] = useState(
    Math.min(initialAnswers.length, questions.length - 1),
  );
  const [phase, setPhase] = useState<Phase>(
    initialAnswers.length >= questions.length ? 'results' : 'question',
  );
  const [answers, setAnswers] = useState<AnsweredQuestion[]>(initialAnswers);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deadline, setDeadline] = useState(
    () => Date.now() + initialRemainingMs,
  );
  const [now, setNow] = useState(() => Date.now());

  const question = questions[index];
  const answered = answers.length;
  const right = answers.filter((a) => a.isCorrect).length;
  const wrong = answers.filter(
    (a) => !a.isCorrect && a.submittedAnswer !== 'SKIP',
  ).length;
  const progress = questions.length ? (answered / questions.length) * 100 : 0;

  async function handleSubmit(submitted: string) {
    setBusy(true);
    setError(null);
    const startedAt = Date.now();
    try {
      const result = await submitGameAnswer(gameId, question.id, submitted);
      setAnswers((prev) => [
        ...prev,
        {
          question,
          submittedAnswer: submitted,
          isCorrect: result.isCorrect,
          pointsEarned: result.pointsEarned,
          acceptedAnswer: submitted === 'SKIP' ? '' : result.acceptedAnswer,
          explanation: submitted === 'SKIP' ? null : result.explanation,
          sourceName: submitted === 'SKIP' ? null : result.sourceName,
        },
      ]);
      if (submitted === 'SKIP') {
        handleNext();
      } else {
        setPhase('feedback');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not check that answer.',
      );
      // AC-4: in-flight time doesn't count; keep at least 5s so a failed auto-skip can't loop.
      setDeadline((d) =>
        Math.max(d + (Date.now() - startedAt), Date.now() + 5_000),
      );
    } finally {
      setBusy(false);
    }
  }

  function handleNext() {
    if (index + 1 >= questions.length) {
      setPhase('results');
    } else {
      setIndex((prev) => prev + 1);
      setPhase('question');
      setDeadline(Date.now() + QUESTION_TIME_LIMIT_MS);
      setNow(Date.now());
    }
  }

  const ticking = phase === 'question' && !busy;

  // AC-5/AC-6: only runs while not busy, so an in-flight answer wins.
  useEffect(() => {
    if (!ticking) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (isExpired(deadline, t)) void handleSubmit('SKIP');
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticking, deadline, index]);

  if (phase === 'results') {
    return (
      <ResultsScreen
        gameId={gameId}
        categoryName={categoryName}
        categorySlug={categorySlug}
        answers={answers}
        handle={handle}
      />
    );
  }

  const lastAnswer = answers[answers.length - 1];
  const secs = secondsLeft(deadline, now);

  return (
    <GameShell
      trailing={
        <span className="text-sm font-bold tabular-nums text-stone-700">
          {Math.min(index + 1, questions.length)}/{questions.length}
        </span>
      }
    >
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold">
          <span className="text-stone-600">{categoryName}</span>
          <span className="tabular-nums text-stone-500">
            <span className="text-emerald-700">{right} right</span>
            <span className="mx-1.5 text-stone-300">·</span>
            <span className="text-red-600">{wrong} wrong</span>
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
          <div
            className="h-full bg-emerald-700 transition-[width] duration-300 ease-out motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {phase === 'question' && (
        <div
          key={question.id}
          className="game-pop flex flex-col items-center gap-7"
        >
          <div className="flex w-full items-center gap-3">
            <div
              role="progressbar"
              aria-label="Time left"
              aria-valuemin={0}
              aria-valuemax={QUESTION_TIME_LIMIT_MS / 1000}
              aria-valuenow={secs}
              className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200"
            >
              <div
                className={`h-full ${isUrgent(secs) ? 'bg-red-600' : 'bg-emerald-700'}`}
                style={{ width: `${fractionLeft(deadline, now) * 100}%` }}
              />
            </div>
            <span
              className={`w-9 text-right text-sm font-bold tabular-nums ${
                isUrgent(secs) ? 'text-red-600' : 'text-stone-700'
              }`}
            >
              {secs}s
            </span>
          </div>
          {question.image_url && (
            <div className="w-full overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_8px_24px_rgba(28,25,23,0.08)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={question.image_url}
                alt="Guess this"
                className="mx-auto max-h-56 object-contain"
              />
            </div>
          )}

          <h1 className="text-center text-2xl font-extrabold tracking-tight text-stone-900 text-balance">
            {question.prompt}
          </h1>

          <LetterTiles
            key={question.id}
            letters={question.letter_tiles}
            answerLength={question.answer_length}
            disabled={busy}
            onSubmit={handleSubmit}
          />
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleSubmit('SKIP')}
            className="min-h-11 text-sm font-semibold text-stone-500 underline disabled:opacity-50"
          >
            Skip
          </button>
        </div>
      )}

      {phase === 'feedback' && lastAnswer && (
        <div className="flex flex-col items-center gap-5 text-center">
          <div
            className={`text-4xl font-extrabold tracking-tight ${
              lastAnswer.isCorrect
                ? 'game-pop text-emerald-700'
                : 'game-shake text-red-600'
            }`}
          >
            {lastAnswer.isCorrect ? 'Correct!' : 'Not quite'}
          </div>
          <div
            className={`text-2xl font-extrabold tracking-tight text-stone-900 ${
              lastAnswer.isCorrect ? '' : 'game-shake'
            }`}
          >
            {lastAnswer.acceptedAnswer}
          </div>
          {lastAnswer.explanation && (
            <div className="w-full max-w-sm rounded-2xl bg-amber-50 px-5 py-4 text-left text-sm text-amber-950 tracking-wider">
              <span className="font-semibold">Did you know? </span>
              {lastAnswer.explanation}
              {lastAnswer.sourceName && (
                <div className="mt-2 text-xs text-amber-900">
                  Source: {lastAnswer.sourceName}
                </div>
              )}
            </div>
          )}
          {lastAnswer.isCorrect && (
            <div className="text-sm font-bold text-emerald-700">
              +{lastAnswer.pointsEarned} points
            </div>
          )}
          <button
            onClick={handleNext}
            className="min-h-14 rounded-full bg-emerald-700 px-10 text-lg font-bold text-white hover:bg-emerald-800 active:scale-[0.98]"
          >
            {index + 1 >= questions.length ? 'See results' : 'Next question'}
          </button>
        </div>
      )}
    </GameShell>
  );
}
