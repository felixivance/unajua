# Pre-commit checks

**Status:** Agreed. Tests in `__tests__/unit/repo/precommit.test.ts`.
**Layer:** local git hook. GitHub CI stays as the backstop.

## Why

Feedback from CI takes minutes and lands after the push. Typecheck and unit tests are fast (seconds), so they run before the commit is created.

## Acceptance criteria

- **AC-1** `git commit` runs `npm run precommit`, which runs `next typegen`, `tsc --noEmit` and `vitest run` (the same checks CI runs for the app).
- **AC-2** If any check fails, the commit is aborted and the failing output is shown.
- **AC-3** Hooks are versioned in `.githooks/`. `npm install` points git at them (`core.hooksPath`) via the `prepare` script, so there is no manual setup and no new dependency.
- **AC-4** `git commit --no-verify` skips the hook (escape hatch). CI still runs the same checks, so a skipped hook cannot merge a broken build.
- **AC-5** Out of scope: lint (`main` has pre-existing errors and CI already treats it as non-blocking), pgTAP database tests (need Docker and `supabase start`, too slow for a hook), staged-files-only runs, Windows support.

## Decisions (agreed)

1. Native `core.hooksPath` instead of husky/lint-staged: no dependency, one 3-line script. Proposed: yes.
2. Whole-repo checks rather than staged files only: the suite is seconds, and staged-only misses breakage in unstaged-but-related files. Proposed: yes.
3. Keep the CI job unchanged as a backstop. Proposed: yes.

## Test plan

`__tests__/unit/repo/precommit.test.ts` checks the wiring (there is no way to unit test git itself):

| AC | Test |
| --- | --- |
| AC-1 | `precommit` script contains `next typegen`, `tsc --noEmit` and `vitest run` |
| AC-1, AC-2 | `.githooks/pre-commit` exists, is executable, calls `npm run precommit` and does not swallow its exit code (`set -e`) |
| AC-3 | `prepare` script sets `core.hooksPath` to `.githooks` |

Manual check: introduce a type error, `git commit` is blocked; revert it, commit succeeds; `--no-verify` bypasses.
