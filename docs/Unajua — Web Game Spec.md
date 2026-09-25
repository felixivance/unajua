# Unajua — Web Game Spec

**Product:** Unajua  
**Tagline:** How well do you know Kenya?  
**Status:** Source of truth for the **web game**. Recreate and finish this first.  
**Then:** Port the same gameplay to React Native against the same backend.  
**Not this document:** The long-range vision. That lives in [Unajua — Product Requirements Document (PRD)](./Unajua%20—%20Product%20Requirements%20Document%20(PRD).md).

---

## Sequencing (do not skip)

1. **Recreate / finish a working web game** with every feature listed as in-scope below.
2. Treat that web game as the product people can actually play.
3. **Only then** migrate player functionality to a React Native app.
4. Keep the Next.js admin dashboard on the web. Content operations stay here.

The React Native app is a second client of the same Supabase backend. It is not a rewrite of game rules, scoring, or content.

---

## What this product is

A Kenyan trivia / rebus game.

A round is **one category, about ten questions, no clock**. The player builds answers from **letter tiles**. After each submit they see correct/incorrect, the accepted answer, and an optional fun fact. A completed round posts a **nickname + score** to the public leaderboard.

Players do not need an account. Admins do.

---

## Stack (web)

| Layer | What we use |
|---|---|
| App | Next.js 16 App Router, React 19, TypeScript |
| UI | Tailwind CSS 4 |
| Data | Supabase (Postgres, Auth, Storage, RLS, RPCs) |
| Play writes | Next.js server actions calling Postgres functions |
| Guest identity | `localStorage` key `unajua_nickname` (max 24 chars) |

Product name is **Unajua**. Package name: `unajua-app`.

---

## Routes that must exist

### Public

| Path | What it does |
|---|---|
| `/` | Landing: how to play, playable categories, top 8 scores, stats (games played / categories / questions) |
| `/play` | Category picker. Only **active categories that have at least one active question**. |
| `/play/[categorySlug]` | Starts a round for that category. 404 if the slug is inactive or has no questions. |

### Admin (email/password, `profiles.is_admin = true`)

| Path | What it does |
|---|---|
| `/admin/login` | Sign in / sign up. Sign-up creates a profile; someone must then grant `is_admin`. |
| `/admin` | Counts of categories and questions; sign out. |
| `/admin/categories` | List, create (name / slug / description), toggle active. |
| `/admin/questions` | List with prompt, answer, published/draft, thumbnail. |
| `/admin/questions/new` | Create a question. |
| `/admin/questions/[id]` | Edit a question. Delete from the list. |

Middleware refreshes the auth cookie on `/admin/:path*`. Page access is enforced by `requireAdmin()`.

---

## Player features (must recreate)

These are live today. A recreated web game is incomplete until all of them work.

### Home

- Brand: **Unajua**
- Primary CTA to `/play`
- Three-step how-to: pick a category → solve ten rounds with letter tiles, no clock → climb the board
- Horizontal list of playable categories with icon, name, question count
- Leaderboard of completed games: nickname, category, score, question count. Empty state if none.
- Stats: completed games, playable category count, active question count
- Closing CTA + “made in Kenya” footer

### Play hub

- Grid of playable categories (name, description, question count, icon)
- Empty state if nothing is playable

### Nickname gate

- First visit: “What should we call you?”
- Nickname stored in `localStorage` and reused on later rounds
- Max 24 characters, trimmed, required
- Shown on the leaderboard. No email.

### A round

1. Server starts the game (`start_game`) and deals questions **without answers**.
2. Progress: `{category} · Question N of M`.
3. Optional image, then prompt, then letter tiles.
4. Player taps tiles into slots, can undo the last letter, submits only when the slot row is full.
5. Server checks the answer (`submit_game_answer`). Client never knows the answer before submit.
6. Feedback: **Correct! 🔥** or **Not quite!**, accepted answer, optional “Did you know?” + source name, `+N points` if correct.
7. Next question, or results after the last one.
8. Results: `{correct}/{total}`, `{score} points`, **Challenge a friend** (Web Share API, clipboard fallback), **Play again** → `/play`, **Back to home**.
9. Completing the round (`complete_game`) writes the official score. The client cannot insert or patch a score.

### Letter tiles

- Tiles and expected answer length come from the server.
- Tiles = letters of the **normalized accepted answer** plus **4 random decoy A–Z letters**, shuffled.
- Submit is disabled until every answer slot is filled.
- While a check is in flight, tiles are disabled.

### Sharing

Share text:

```text
🇰🇪 Unajua
I scored {correct}/{total} on {category}!
Can you beat me?
```

Plus the current page URL.

---

## Admin features (must recreate)

Admin is part of the web game, not a later mobile concern. Without it there is no content.

- Email/password auth via Supabase.
- Only `is_admin` profiles can read drafts or write content.
- **Categories:** create, list, activate/deactivate. Inactive categories disappear from play.
- **Questions:** create, edit, delete, publish/unpublish.
- **Question fields:** category, prompt, image, accepted answer, alternative answers (comma-separated), explanation, source name, source URL, difficulty 1–3, published flag.
- **Image upload** to the public `question-images` storage bucket; form stores the public URL.
- New questions default to **draft** unless “Published” is checked.

Content style for rebus images: [rebus-puzzle-style.md](./rebus-puzzle-style.md).

---

## Backend contract (do not reimplement in the client)

This is the shared API. The web app already uses it. React Native must use it later. Do not score, deal, or persist games in the browser / app.

### Tables

**`categories`**  
`id`, `slug` (unique), `name`, `description`, `is_active`, `created_at`

**`questions`**  
`id`, `category_id`, `prompt`, `image_url`, `accepted_answer`, `alternative_answers[]`, `explanation`, `source_name`, `source_url`, `difficulty` (1–3), `is_active`, `created_at`

Public SELECT on questions is **column-stripped**. Anon may read: `id`, `category_id`, `prompt`, `image_url`, `difficulty`, `is_active`, `created_at`. They cannot read answers, alternatives, explanation, or sources via table SELECT.

**`profiles`**  
`id` (auth user), `nickname`, `is_admin`, `created_at`  
Created automatically on signup. Used for admin, not for guest play.

**`games`**  
`id`, `profile_id` (unused for guests), `category_id`, `guest_nickname`, `score`, `total_questions`, `question_ids[]`, `completed_at`, `created_at`  
Anon can **read** completed games for the leaderboard. Anon **cannot** insert, update, or delete.

**`game_answers`**  
`id`, `game_id`, `question_id`, `submitted_answer`, `is_correct`, `time_taken_ms` (unused), `points_earned`, `created_at`  
Unique on `(game_id, question_id)`. Anon has **no** table access; writes go through RPC only.

**Storage:** public bucket `question-images`. Admins upload; anyone can read.

### Play RPCs (anon + authenticated may execute)

| Function | Input | Output | Rules |
|---|---|---|---|
| `start_game(category_id, nickname)` | active category, nickname | `game_id` + play questions | Nickname trimmed, max 24, non-empty. Inserts `games` with `score = 0` and frozen `question_ids`. Returns no answers. |
| `submit_game_answer(game_id, question_id, submitted)` | in-progress game | check result + points | Question must belong to that game. Game must not be completed. One answer per question. |
| `complete_game(game_id)` | game id | `score`, `correct_count`, `total_questions` | All dealt questions must be answered. Score = **sum of stored `points_earned`**. Idempotent if already completed. |

Internal helpers (not granted to anon after the games migration):

- `normalize_answer(text)` → uppercase, strip non-alphanumeric
- `get_play_questions(category_id)` → up to 10 active questions + tiles + `answer_length`
- `check_question_answer(question_id, submitted)` → match against accepted + alternatives

### Play DTO (what the client is allowed to see before submit)

```ts
type PlayQuestion = {
  id: string
  category_id: string
  prompt: string
  image_url: string | null
  difficulty: number
  letter_tiles: string[]
  answer_length: number
}
```

### Scoring (current rule)

- Correct: **100 points**
- Incorrect: **0**
- `difficulty` is stored but **does not change points yet**
- No timer, no speed bonus, no hints
- Skip is allowed: client submits `SKIP` through `submit_game_answer` (0 points) and advances immediately. Do not show the accepted answer or explanation. Do not increment the session wrong count.

A client-supplied score is rejected. Direct `INSERT`/`UPDATE` on `games` / `game_answers` as anon is denied.

### Answer matching

1. Normalize submitted text and every candidate (`accepted_answer` plus `alternative_answers`).
2. Exact match after normalize = correct.
3. After submit, the UI may show `accepted_answer`, `explanation`, and `source_name`. That reveal is allowed **only after** the server check.

---

## Game loop (exact)

```text
Open site
  → /play
  → pick category
  → nickname (once, then remembered)
  → start_game
  → for each question:
        show prompt + image + tiles
        submit_game_answer
        show feedback
  → complete_game
  → results + share / play again
```

A category with zero active questions is not a valid start.

---

## Seeded content (baseline, not the whole catalog)

Migrations seed:

- **Kenyan Brands** (`kenyan-brands`) — sample questions (KICC, Safaricom, M-PESA, EABL, Kenya Airways, …)
- **Kenyan Companies** (`kenyan-companies`) — category row; questions added in admin

Category icons in the UI are keyed by slug (`kenyan-brands`, `kenyan-companies`, `kenyan-places`, `kenyan-people`, `kenya-trivia`, `nostalgia`, `county-rebus`). Unknown slugs get a default target icon.

---

## Web-complete gate

Do **not** start React Native until a stranger can do all of this on the web without an engineer sitting next to them:

- [ ] Land on `/`, understand the game, tap Play
- [ ] Pick a category that has questions
- [ ] Set a nickname once, play a full round of letter-tile questions
- [ ] See feedback (correct/incorrect, answer, fun fact when present)
- [ ] See results with the **server** score
- [ ] Appear on the home leaderboard after completing
- [ ] Share a score (native share or clipboard)
- [ ] Play another category without re-entering a nickname
- [ ] Admin can sign in, add a category, add a published question with image, and that question appears in play
- [ ] Admin can unpublish a question / deactivate a category and it leaves play
- [ ] Anon cannot read answers from `questions` or write scores to `games`

Until those boxes are true, keep working on the web app.

---

## Gaps in the current web app (fix on web, still before RN)

These exist in code today. Close them as part of “working web game,” not as mobile work.

| Gap | Why it matters |
|---|---|
| React Strict Mode can call `start_game` twice | Orphan in-progress game rows |
| Leaderboard badge says “Updated live” but the page is server-rendered | Misleading |
| `source_url` is stored and returned, never shown | Attribution incomplete |
| `difficulty` does not affect points | Field is dead weight in play |
| TanStack Query is installed and wrapped, unused | Extra surface, no behavior |
| Admin login still sits inside the admin chrome layout | Confusing for non-admins |

Optional polish that is still web-complete-adjacent:

- Show source as a link when `source_url` exists
- One `start_game` per mount (ignore the second Strict Mode call, or reuse the session)

---

## Out of scope until the web game is done

The PRD describes a much larger product. **Do not build these on the way to a working web game** (and do not require them before RN unless you explicitly promote them):

- Player accounts, profiles, streaks, badges
- Timers and speed scoring
- Hints, “almost there”
- Daily challenge, friend vs friend, party mode
- Audio / video questions
- Per-category leaderboard pages, global seasons
- Analytics, ads, monetization
- Admin: users, review queue, reports
- App Store / Play Store / Expo project

If a feature is not in **Player features**, **Admin features**, or **Web-complete gate**, it is not required to recreate the current game.

---

## Later: per-question share cards (do not build yet)

Share-a-score already exists on the results screen. A later pass should let a player share **one question** as a card to WhatsApp / Instagram / X, with a link back to the app.

Intended shape (when we pick this up):

- A “Share this puzzle” action on the **feedback** screen only (after submit or skip). Never before the answer is revealed — that would leak the puzzle without the pay-in.
- A generated image card (same 16:9 rebus style): question image or prompt, the accepted answer, a one-line explanation, Unajua wordmark, and `unajua` play URL (category deep link if we have one).
- Native `navigator.share` with the image file + text fallback (`Guessed NAROK on Unajua — your turn: {url}`). WhatsApp and Instagram pick up the image; clipboard fallback is text + URL.
- Do not require an account. Do not put the next unanswered question on the card.
- Track later, not now: share tap count is a vanity metric, not a launch blocker.

---

## React Native migration (after the gate)

When the web game is complete:

1. **Keep** Supabase schema, RLS, RPCs, storage, and the Next.js admin.
2. **Port** the player loop only: home/play equivalent, nickname, tiles, feedback, results, share, leaderboard.
3. Call the same three RPCs: `start_game`, `submit_game_answer`, `complete_game`.
4. Do not put answers, scoring, or game inserts in the mobile client.
5. Guest nickname can stay device-local (same idea as `unajua_nickname`).
6. Web remains the content CMS and the SEO / share landing page.

Suggested RN shape later: Expo + TypeScript, talking to the existing project URL + anon key. Not a second database.

---

## File map (current web implementation)

Use this when recreating or reviewing:

| Area | Files |
|---|---|
| Home | `src/app/page.tsx` |
| Play hub | `src/app/play/page.tsx` |
| Category round | `src/app/play/[categorySlug]/page.tsx` |
| Game UI | `src/components/game/GameContainer.tsx`, `GameScreen.tsx`, `LetterTiles.tsx`, `ResultsScreen.tsx` |
| Server actions | `src/lib/game/actions.ts` |
| Nickname | `src/lib/game/nickname.ts` |
| Types | `src/types/game.ts` |
| Admin | `src/app/admin/**`, `src/lib/admin/**`, `src/components/admin/QuestionForm.tsx` |
| Auth refresh | `src/middleware.ts` |
| Schema | `supabase/migrations/0001_init.sql` … `0009_shuffle_play_questions.sql` |

Integrity migrations to preserve:

- `0006_hide_question_answers.sql` — strip answers from public SELECT
- `0007_server_side_games.sql` — server-side insert/score
- `0008_fix_start_game.sql` — `start_game` returns `game_id` + `question_id` (no ambiguous `id`)

---

## Related docs

| Doc | Role |
|---|---|
| [PRD](./Unajua%20—%20Product%20Requirements%20Document%20(PRD).md) | Vision, later markets, mobile-first original plan. Do not treat as the web MVP checklist. |
| [Rebus style](./rebus-puzzle-style.md) | How to draw rebus question images |

When this spec and the PRD disagree about what to build **now**, this spec wins until the web game is complete.
