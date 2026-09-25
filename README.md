# Unajua

How well do you know Kenya?

Unajua is a trivia game about Kenyan brands, places, people, and everyday facts. A round is one category, ten questions, no clock. You build each answer from letter tiles. When the round ends, a nickname and score land on a public leaderboard.

Players do not need an account. Admins do.

## Play

1. Pick a category that has at least one published question.
2. Solve ten prompts. Tiles include the real letters and decoys. There is no timer.
3. After each guess, the game shows right or wrong, the accepted answer, and an optional fact.
4. Finish the round. The score is posted under the nickname stored on this device.

Routes: `/` (home, board, stats), `/play` (categories), `/play/[categorySlug]` (a round).

## Where the rules live

The browser is a client of three Postgres functions: `start_game`, `submit_game_answer`, and `complete_game`. Next.js server actions call them. The anon key is public, so the database, not the UI, decides what a player can see and what a score is worth.

**Answers stay in the database until a guess is submitted.** `SELECT` on `questions` is limited to the prompt, image, and difficulty. `start_game` returns letter tiles and the answer length. The accepted answer comes back only from `submit_game_answer`.

**The client cannot submit a score.** Direct writes to `games` and `game_answers` are revoked. `complete_game` sets the score to `sum(points_earned)` for that game. An edited frontend cannot post 10/10.

**Guests are a nickname, not a user.** The name is kept in `localStorage` (`unajua_nickname`, 24 characters). Accounts exist for content editors. `profiles.is_admin` must be granted by hand after sign-up. Middleware refreshes the session on `/admin`; `requireAdmin()` is what blocks the pages.

A later mobile client can call the same functions. It should not reimplement dealing, checking, or scoring.

## 🧠 Engineering decisions

**Why Next.js first?** The web app is how the game loop gets validated before a native client. A mobile app would be another caller of the same Postgres functions, not a second implementation of the rules.

**Why Supabase?** The first version needs authentication, Postgres, storage, and row-level security. Those ship with the database, so there is no separate API service to run.

**Why letter tiles instead of a text field?** The player can only use the letters dealt for that question. Checking the guess is a normalized comparison, and pasting an answer from another tab is not the interaction.

## Stack

| | |
|---|---|
| App | Next.js 16 App Router, React 19, TypeScript |
| UI | Tailwind CSS 4 |
| Data | Supabase: Postgres, Auth, Storage, row-level security |
| Play | Server actions → `security definer` RPCs |

## Run it

```bash
npm install
cp .env.local.example .env.local
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`, then apply `supabase/migrations` to that project (`supabase db push`, or the SQL files in order).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin is at `/admin/login`. Sign up, then set `is_admin` on that row in `profiles` before the dashboard will load.

## Layout

```
src/app/                  home, play, admin
src/lib/game/actions.ts   start, submit, complete
src/lib/admin/            editor actions, requireAdmin
supabase/migrations/      schema, seeds, game RPCs
```

The web game contract is in [docs/Unajua — Web Game Spec.md](docs/Unajua%20—%20Web%20Game%20Spec.md).
