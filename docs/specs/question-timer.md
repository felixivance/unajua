# Question timer with countdown progress bar

**Status:** Agreed (CTO approved the proposals below). Tests in `__tests__/unit/lib/game/questionTimer.test.ts`.
**Layer:** client only (`GameScreen`). No migration, no RPC change.
**Supersedes:** "No timer" in `docs/Unajua — Web Game Spec.md` (non-goals) and the "Ten questions. No clock." copy in `GameContainer`.

## Why

Puzzles currently have no time pressure. A per-question clock adds tension and keeps sessions short. Score is unchanged: no speed bonus.

## Acceptance criteria

- **AC-1** Each question has a 60 second limit (`QUESTION_TIME_LIMIT_MS = 60_000`, one constant).
- **AC-2** The clock starts when the question is shown and resets for every new question.
- **AC-3** *(amended: mobile layout)* A circular countdown ring sits at the bottom right, in the same row as Submit. The ring drains from full to empty with the clock and the whole seconds left (rounded up) are shown inside it.
- **AC-4** The clock stops during the feedback phase (after an answer is checked) and while a submission is in flight.
- **AC-5** When time reaches 0 while the question is unanswered, the app submits `"SKIP"` through the existing path. Result: 0 points, no answer reveal, next question (or results on the last one).
- **AC-6** If the player submits an answer and the request is in flight when time reaches 0, the player's answer stands. No `SKIP` is sent.
- **AC-7** Remaining time comes from a deadline timestamp, not counting ticks, so a backgrounded tab or throttled timers cannot give extra time.
- **AC-8** In the last 10 seconds the ring and number turn red and the number pops once per second (`game-tick`); otherwise emerald. Reduced motion: no pop, no ring transition.
- **AC-12** On a 360x600 phone the whole question screen (header, tallies, image, prompt, tiles, Submit, Skip, ring) fits without scrolling.
- **AC-9** Accessibility: bar is `role="progressbar"` with `aria-valuemin=0`, `aria-valuemax=60`, `aria-valuenow=<seconds left>`. Screen readers are not announced every second. `prefers-reduced-motion` removes bar transitions (same as the existing progress bar).
- **AC-10** Start screen copy changes from "No clock" to "60 seconds per question".
- **AC-11** Out of scope: server-side enforcement of the limit, storing `time_taken_ms`, speed bonus, pause/resume, per-difficulty limits, persisting the clock across reloads. A player can cheat the client clock; scores are leaderboard-only for now.

## Decisions (agreed)

1. Does a timeout count as "wrong" in the right/wrong tally, or as a skip? Proposed: skip (matches AC-5, and the existing tally already excludes `SKIP`).
2. Is 60s right for every difficulty? Proposed: yes for v1, tune from data.
3. Do we accept client-only enforcement? Proposed: yes, same stance as `admin-login-cooldown`.

## Design

- Pure logic in `src/lib/game/questionTimer.ts`: `secondsLeft(deadlineMs, nowMs)`, `fractionLeft(deadlineMs, nowMs, limitMs)`, `isExpired(deadlineMs, nowMs)`, `isUrgent(secondsLeft)`.
- `GameScreen` holds `deadline` in state, set when a question is shown, and a `setInterval` (250 ms) that updates `now` only while `phase === "question" && !busy`.
- Ring UI: `CountdownRing` is passed to `LetterTiles` as `trailing`, so the action row is `Skip · Submit · ring`.

## Test plan

Unit (Vitest, `__tests__/unit/lib/game/questionTimer.test.ts`, written before the implementation):

| AC | Test |
| --- | --- |
| AC-1 | limit constant is 60_000 |
| AC-3 | `fractionLeft` is 1 at start, 0.5 at 30s, 0 at 60s, never below 0 or above 1 |
| AC-3 | `secondsLeft` rounds up: 59.1s elapsed gives 1, exactly 60s gives 0 |
| AC-5 | `isExpired` false at 59_999 ms, true at 60_000 ms and after |
| AC-7 | results depend only on `deadline - now`, so a 5 minute gap gives 0, not a partial count |
| AC-8 | `isUrgent` false at 11, true at 10 |

Component behaviour (AC-2, AC-4, AC-5, AC-6, AC-9, AC-10) is checked manually until a jsdom/RTL runner exists, same caveat as `admin-login-cooldown`. If we add that runner, these move to fake-timer component tests.

Manual checklist: let one question expire (auto-skip); answer at 1s remaining on a slow network (answer wins); switch tab for 90s and return (skipped); reduced-motion on.
