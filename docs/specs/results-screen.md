# Results screen: celebrate, rank, share

**Status:** Draft. Tests in `__tests__/unit/lib/game/results.test.ts`.
**Layer:** client only (`ResultsScreen`), reads `get_player_rank` from `docs/specs/leaderboards.md`. No migration.

## Why

The end of a game is the moment of highest emotion and the best moment to bring people back. Today it is a bare score and one button. The screen should (1) react to how they did, (2) say where they stand on the global board, (3) give them a reason to play another category, and (4) make sharing one tap, in the channel Kenyans actually use (WhatsApp).

Patterns used: Wordle-style emoji result grid (compact, spoiler-free, recognisable in a chat), Duolingo/Kahoot tiered praise and "you climbed" framing, and a near-miss target ("N pts behind X") which was the strongest replay prompt in the leaderboard brainstorm.

## Acceptance criteria

- **AC-1** Headline tier by score ratio: perfect (all correct, at least 1 question) "Perfect score!"; 80% or more "Sharp!"; 50% or more "Not bad!"; below "Good try!". Each tier has a one-line sub-message.
- **AC-2** Perfect score fires confetti. Confetti is CSS-only, decorative (`aria-hidden`, `pointer-events: none`), uses the flag colours, and is disabled under `prefers-reduced-motion`. No new dependency.
- **AC-3** A row of one square per question: green correct, red wrong, white skipped (`SKIP`), in question order.
- **AC-4** After the game is saved, show the player's rank in this category and overall (all-time) using `get_player_rank`. Copy: `#3 in Kenyan Counties`, `#7 overall`. Rank 1 gets a crown line. If the lookup fails or returns nothing, the rank card is hidden; the screen never blocks on it.
- **AC-5** Under the ranks, a chase line when someone is ahead in the overall board: `40 pts behind Kip. Play another category to catch up.` linking to `/play`.
- **AC-6** Share text is: `🇰🇪 Unajua: <Category>`, the emoji grid, `<correct>/<total> · #<rank> on the board` (rank omitted when unknown), `Can you beat me?`.
- **AC-7** Two share actions: WhatsApp (`https://wa.me/?text=<encoded text + url>`) and a generic Share (Web Share API, falling back to clipboard). Copy feedback is inline ("Copied!"), not `alert`.
- **AC-8** "Play again" is the same category; "More categories" goes to `/play`.

## Out of scope

Server-rendered share image (Open Graph), count-up animation, sound, per-question review.

## Test plan

Unit (Vitest): AC-1 tier boundaries (10/10, 8/10, 5/10, 4/10, 0/0), AC-3 grid mapping and order, AC-6 text with and without rank, AC-4 `rankLabel` wording. Confetti, layout, share buttons and clipboard (AC-2, AC-7) are manual until a component test runner exists.
