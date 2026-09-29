// ponytail: client-side only; a player can bypass the clock. Server-side
// enforcement (time_taken_ms) is out of scope, see docs/specs/question-timer.md.
export const QUESTION_TIME_LIMIT_MS = 60_000;
export const URGENT_SECONDS = 10;

export function secondsLeft(deadline: number, now: number) {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

export function fractionLeft(deadline: number, now: number, limitMs = QUESTION_TIME_LIMIT_MS) {
  return Math.min(1, Math.max(0, (deadline - now) / limitMs));
}

export function isExpired(deadline: number, now: number) {
  return now >= deadline;
}

export function isUrgent(seconds: number) {
  return seconds <= URGENT_SECONDS;
}
