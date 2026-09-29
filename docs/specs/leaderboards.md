# Leaderboards: daily, weekly, all-time, per category

**Status:** Implemented in code, pending migration 0010 on the hosted DB. Decisions 1-6 are agreed (CTO/product). Decision 7 (device token) and 8 (`unstable_cache`) are proposals that need a yes before implementation.
**Tests (written first, red until built):**
- `__tests__/unit/lib/game/leaderboard.test.ts` (Vitest)
- `__tests__/unit/lib/game/nickname.test.ts` (Vitest, new `generateUniqueHandle` cases)
- `supabase/tests/database/leaderboard.test.sql` (pgTAP, `supabase test db`)

**Layer:** Postgres (ranking + nickname claims), one server-rendered section, one small client widget.
**Supersedes:** the single all-time "Top 10" on `src/app/page.tsx` (best single games, one player can fill every slot).
**Amends:** `docs/specs/game-rules-db.md`: `start_game` gains a `p_token` argument (AC-10 below), so its pgTAP calls change.

## Why

Players see one static all-time list, so a newcomer can never appear and there is no reason to come back tomorrow. The board should (a) give everyone a fresh race every day and week, (b) reward trying more categories, and (c) show a small, reachable target ("40 pts behind Kip") instead of a wall of rows.

## Rules in one paragraph

A player is a nickname. Their score on a board is the **sum of their best completed game per category** inside the board's time window. A category board is the same rule with one category, which is just their best game there. Boards are ordered by score, then by who reached that score first.

## Decisions

1. **Timezone / week:** `Africa/Nairobi` (UTC+3, no daylight saving). Day starts 00:00 Nairobi. Week starts Monday 00:00 Nairobi. *(agreed)*
2. **Identity:** nickname, case-insensitive. Nicknames must be unique, enforced when a nickname is generated, typed, and at `start_game`. *(agreed; mechanism is decision 7)*
3. **Overall formula:** sum of best game per category. Not average, not flat total. *(agreed)*
4. **Only completed games count** (`completed_at is not null`). *(agreed)*
5. **Freshness:** boards may be up to 60 s old. *(agreed)*
6. **Categories are read from the database** at render time. "Kenyan Counties" is a content seed, not code. *(agreed)*
7. **Proposed: device token.** A nickname is claimed by a random UUID kept in `localStorage`. Same device can reuse its nickname; any other token is refused. Not a login: clearing storage loses the claim, same stance as the question timer ("client-side trust, leaderboard-only stakes"). Signed-in identity is out of scope.
8. **Proposed: cache with `unstable_cache({ revalidate: 60 })`**, not `use cache`. `use cache` needs `cacheComponents: true`, which changes caching for the whole app. `unstable_cache` is marked replaced in Next 16, so leave a `ponytail:` comment to migrate when we adopt Cache Components.
9. **Home default tab is All-time / All categories** (from the brief). Day and Week are one tap away.

## Acceptance criteria

### Ranking (database)

- **AC-1** `get_leaderboard(p_period, p_category_slug, p_limit)` takes `p_period` of `day | week | all`. `day` counts games with `completed_at` at or after today 00:00 Nairobi, `week` since Monday 00:00 Nairobi, `all` has no lower bound. An unknown period raises an error.
- **AC-2** Only games with `completed_at` set count. Started or abandoned games never appear.
- **AC-3** A player's score is the sum, over categories, of their best game score in the window. With `p_category_slug` set, only that category counts. An unknown slug returns no rows.
- **AC-4** One row per player, keyed by `lower(trim(guest_nickname))`. The displayed name is the most recent spelling.
- **AC-5** Order is score descending, then `reached_at` ascending, then nickname. `reached_at` is the latest `completed_at` among the games that were counted (the moment the player got to that total). `rank` is the row number, so ties are never shared.
- **AC-6** Each row returns `rank, nickname, score, categories_played, reached_at`. `p_limit` is clamped to 1..50 (default 10).
- **AC-7** `get_player_rank(p_period, p_category_slug, p_nickname)` returns `rank, score, next_nickname, next_score` (the player directly above; null at rank 1). No row if the nickname has no counted game in the window.
- **AC-8** `anon` can execute both functions. `anon` cannot select from `players`.

### Unique nicknames

- **AC-9** `claim_nickname(p_nickname, p_token)` returns true when the nickname (case- and space-insensitive) is free or already held by the same token, and false when another token holds it. A first successful claim stores it.
- **AC-10** `start_game(p_category_id, p_nickname, p_token)` claims the nickname first and raises `Nickname taken` when another token holds it. (Same body as today otherwise.)
- **AC-11** `generateUniqueHandle(isFree)` returns the first of up to 5 random handles for which `isFree` resolves true. If all 5 are taken it tries up to 5 more with a 4-digit suffix appended (still ≤ 24 chars), then throws.
- **AC-12** The player token is created once (`crypto.randomUUID()`) and kept under `unajua_player_token`. First-time visitors get a unique handle via AC-11 and claim it immediately.
- **AC-13** Renaming to a taken nickname shows "That nickname is taken" and keeps the current one. Nothing is stored locally until the claim succeeds.
- **AC-14** Existing games keep their nicknames. Legacy duplicates merge into one player on the boards (AC-4); the first `claim_nickname` for that name wins it.

### Pages

- **AC-15** Home shows a leaderboard section with a podium of the top 3, a period control (Today / This week / All-time) and category chips (All + one per category). State lives in the URL: `?period=day|week|all&category=<slug>`. Invalid values fall back to `all` and All. The control uses links, so it works without JS.
- **AC-16** `/leaderboard` shows the top 10 with the same control and URL params, plus the podium styling for ranks 1-3. Home links to it ("See top 10").
- **AC-17** Category chips list active categories that have at least one active question, read from the database. Empty categories are not offered.
- **AC-18** Boards are fetched server-side with `unstable_cache`, `revalidate: 60`, keyed by period + category. The section is one fetch of 10 rows; home slices 3.
- **AC-19** "Your position" is a client component. It reads the stored nickname, calls `get_player_rank`, and renders: `You're #14 · 300 pts behind Kip`, or `You're #1` at the top, or `Play a category to get ranked` when there is no row. It is never cached with the public board.
- **AC-20** Every row shows when the score was reached using `timeAgo(reached_at, now)`, refreshed every 5 s on the client (rendered client-side so a cached page never shows a stale label).
- **AC-21** `timeAgo`: under 5 s `just now`; under a minute `Ns ago`; then `Nm ago`, `Nh ago`, `Nd ago` (floored). A time in the future reads `just now`.
- **AC-22** Day and Week tabs show `Resets in <countdown>` computed from `nextReset`. `formatCountdown`: 1 day or more `2d 4h`; 1 hour or more `3h 12m`; a minute or more `12m`; otherwise `<1m`.
- **AC-23** Empty board copy: "No scores yet. Be the first on the board." with a Play link.
- **AC-24** Accessibility: the period control marks the active link with `aria-current="page"`; medals carry text ("1st") for screen readers; row animations respect `prefers-reduced-motion`.

### Out of scope (v1)

Live activity feed, friend rivals, badges, streaks, county boards, signed-in identity, pagination past 50, server-enforced timing, seasonal resets. Revisit once daily boards show players replaying.

## Design

- **Migration `0010_leaderboards.sql`:** `players(nickname_key text primary key, nickname text not null, token uuid not null, created_at)` with RLS on and no policies for `anon`; `claim_nickname`; `start_game` replaced with the 3-arg version; `get_leaderboard`; `get_player_rank`. Ranking is `security definer` over `games`, grouped by `lower(trim(guest_nickname))` and category (`max(score)`), then summed. Window uses `date_trunc('day'|'week', now() at time zone 'Africa/Nairobi')` (Postgres weeks start Monday). Existing indexes on `games (completed_at)` and `(score)` are enough.
- **`src/lib/game/leaderboard.ts` (pure):** `timeAgo(playedAt, now)`, `nextReset(period, now)`, `formatCountdown(ms)`. Nairobi is a fixed UTC+3 offset, so `nextReset` needs no timezone library. The window itself lives only in SQL, so there is one source of truth for who is on the board.
- **`src/lib/game/nickname.ts`:** add `generateUniqueHandle`, `getOrCreateToken`. `GameContainer` uses them and calls `claim_nickname` on rename.
- **UI:** `src/components/leaderboard/` with `Leaderboard` (server, takes rows), `PeriodTabs`, `CategoryChips`, `MyRank` (client). `src/app/leaderboard/page.tsx` new; the home Top 10 block is replaced.
- **Gamification without weight:** podium of 3 on home, one pinned personal line with the gap to the next player, the reset countdown, "played 5m ago" on rows. Nothing else.

## Test plan

Unit (Vitest), written before implementation:

| AC | Test |
| --- | --- |
| AC-11 | first free candidate returned; 3 taken then free; all 5 taken then suffix (≤ 24 chars, ends in 4 digits); everything taken throws |
| AC-21 | 4 s `just now`, 5 s `5s ago`, 59 s, 60 s `1m ago`, 59m59s, 1 h, 23 h, 24 h `1d ago`, future `just now` |
| AC-22 | `nextReset` day: 13:00 Nairobi gives next midnight; 22:00 UTC is already tomorrow in Nairobi; exactly midnight gives the following midnight |
| AC-22 | `nextReset` week: Tuesday gives next Monday 00:00 Nairobi; Sunday 23:59:59 gives one second later; exactly Monday 00:00 gives the Monday after |
| AC-22 | `formatCountdown` at 2d4h, 3h12m, 12m, 30 s |

Database (pgTAP, `supabase/tests/database/leaderboard.test.sql`), fixtures use their own categories:

| AC | Test |
| --- | --- |
| AC-1 | a game completed yesterday is excluded from `day`, included in `all`; week boundary at Monday 00:00 Nairobi; bad period raises |
| AC-2 | an uncompleted game is ignored |
| AC-3 | two games in one category count once (the best); two categories sum; category filter counts one; unknown slug returns nothing |
| AC-4 | `"Otieno"` and `" otieno "` are one row |
| AC-5 | equal scores: earlier `reached_at` ranks higher; ranks are 1..n without repeats |
| AC-6 | `p_limit` 500 returns at most 50; columns as specified |
| AC-7 | rank, score and next player correct; rank 1 has null next; absent player returns no row |
| AC-8 | `anon` can call both functions and cannot `select` from `players` |
| AC-9 | free name claimed; same token again true; other token false; case and spacing ignored |
| AC-10 | `start_game` with a taken name raises `Nickname taken`; with own token works |

Not automated (manual until a jsdom/RTL runner exists): AC-12, AC-13, AC-15 to AC-20, AC-23, AC-24.

Manual checklist: two browsers, same nickname (second is refused); finish a game and see it on Today within 60 s; switch tabs and chips and reload the URL; player outside the top 10 sees the gap line; empty day at 00:00 Nairobi; reduced motion on.
