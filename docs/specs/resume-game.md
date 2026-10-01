# Resume a game after refresh

**Status:** Agreed (server-trusted design, server-side question clock, 24h expiry). Tests in `__tests__/unit/lib/game/resume.test.ts`.
**Layer:** migration `0011_resume_game.sql`, `src/lib/game/resume.ts`, `GameContainer`, `GameScreen`.

## Why

A refresh mid-game currently drops the player back to the start screen and the game is lost. Players should continue where they were.

## Why no encrypted score in localStorage

The score is never client-supplied: `submit_game_answer` writes `points_earned` and `complete_game` sums it. Client-side encryption cannot protect anything because the key ships to the browser. So the browser stores only the `gameId`, and everything else is read back from the server.

## Acceptance criteria

- **AC-1** `start_game` result is remembered: `localStorage["unajua_game_<categorySlug>"] = gameId`.
- **AC-2** On load, if a saved id exists, `resume_game(gameId, token)` restores the game: same questions in the same order, the answers already given, and the current question.
- **AC-3** Only the device that owns the nickname (matching `players.token`) can resume a game.
- **AC-4** A game resumes only if it is not completed and was created less than 24 hours ago. Otherwise `resume_game` returns no rows, the saved id is cleared and the start screen shows.
- **AC-5** Score and tallies shown after a resume are derived from the server's `game_answers`, never from localStorage.
- **AC-6** The clock is server-side: `games.question_started_at` is set when the game starts and again each time an answer is stored. `resume_game` returns `remaining_ms = max(0, 60s - (now - question_started_at))`. A refresh cannot restore a full 60 seconds. If `remaining_ms` is 0 the existing timer auto-skips the question.
- **AC-7** If every question is already answered, resume goes straight to the results screen.
- **AC-8** Replaying an answered question is already rejected by the unique index on `game_answers (game_id, question_id)` ("Already answered").

## Known limits

- Time spent on the feedback screen counts against the next question if the player refreshes during it (the server cannot see the feedback phase).
- Letter tiles are rebuilt on resume, so the decoy letters and tile order differ.
- The explanation reveal for already-answered questions is not restored.
- The server does not reject a late answer; it only fixes the clock on resume. A player who never refreshes can still extend the client clock (same stance as `question-timer.md`).
- The 60s limit is duplicated in SQL (`resume_game`) and `QUESTION_TIME_LIMIT_MS`.
- Resume is per browser, not across devices.

## Test plan

Unit: `toResumed` maps rows to a session (questions in order, answered rows become answers, `remainingMs`, empty rows give `null`).
Manual: answer 3 questions, refresh (resumes at question 4 with the same score); refresh repeatedly on question 4 (clock keeps falling); edit the saved id to a random uuid (start screen); complete the game and refresh (start screen).
