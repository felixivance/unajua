# Game rules enforced by the database

**Status:** Agreed. Tests in `supabase/tests/database/game_rules.test.sql` (pgTAP, `supabase test db`).
**Why here:** the anon key is public, so Postgres, not the UI, decides what a player can see and what a score is worth. Web and the later mobile client both rely on this contract.

## Acceptance criteria

- **AC-1** `anon` can read a question's prompt, but not `accepted_answer`, `alternative_answers`, `explanation` or the source columns.
- **AC-2** `anon` cannot insert or update `games`, and cannot read `game_answers`. Scores cannot be written directly.
- **AC-3** `anon` cannot call `get_play_questions` or `check_question_answer` directly (they would leak answers). It can call `start_game`, `submit_game_answer`, `complete_game`.
- **AC-4** `start_game` deals letter tiles (answer letters plus 4 decoys) and `answer_length`, never the answer itself.
- **AC-5** `submit_game_answer` compares normalised text (case, spaces and punctuation ignored): a correct guess earns 100 points, a wrong one 0.
- **AC-6** A question that is not in the game, or one already answered, is rejected.
- **AC-7** `complete_game` rejects a game with unanswered questions.
- **AC-8** `complete_game` sets the score to the sum of `points_earned` for that game.
