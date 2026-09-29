# 404 page: lost, but not stuck

**Status:** Draft. Tests in `__tests__/unit/app/not-found.test.tsx`.
**Layer:** client/server UI only (`src/app/not-found.tsx`). No data, no migration.

## Why

Mistyped links, old shares and unknown category slugs (`/play/nope`, which calls `notFound()`) land on the default Next.js 404: white, unbranded, and a dead end. A wrong turn should still feel like Unajua and put the player one tap from a game.

## Acceptance criteria

- **AC-1** `src/app/not-found.tsx` renders for both unmatched URLs and `notFound()` calls (root segment).
- **AC-2** Same look as the other pages: dark hero band with flag-stripe texture, brand link to `/`, oversized type. Exactly one `h1`. The `404` is visible but decorative to screen readers (`aria-hidden`); the `h1` carries the message.
- **AC-3** Copy is in the game's voice and blames the page, not the player: headline "This page doesn't exist" plus one sentence pointing to a game.
- **AC-4** Primary action "Play now" links to `/play`. Secondary links: "Home" (`/`) and "Leaderboard" (`/leaderboard`).
- **AC-5** `metadata.title` is `Page not found | Unajua`.
- **AC-6** Static server component: no client JS, no data fetching. Entrance animation reuses `game-pop`, which already honours `prefers-reduced-motion`.

## Out of scope

Per-route 404s (admin keeps the root one), search box, Swahili copy, suggested categories.

## Test plan

Vitest renders the component to static HTML (`react-dom/server`, node env) and asserts AC-2 to AC-5. Visual match is checked manually in the browser.
