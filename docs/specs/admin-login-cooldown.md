# Admin login: attempt cooldown

**Status:** Agreed. Tests in `__tests__/unit/lib/admin/loginCooldown.test.ts`.
**Layer:** client only (`AdminLoginForm`). Supabase's server-side rate limit owns real brute-force protection.

## Acceptance criteria

- **AC-1** Given 2 consecutive failed sign-ins, when a 3rd fails, the form locks for 15 seconds.
- **AC-2** While locked, submitting does not call Supabase and the button is disabled.
- **AC-3** While locked, the form shows "Too many attempts. Try again in Ns." with N counting down.
- **AC-4** When the lock starts, the failure count resets to 0; after 15s the form accepts input again with a fresh count.
- **AC-5** Failures 1 and 2 do not lock and show Supabase's error message.
- **AC-6** Out of scope: server-side limiting, persisting the lock across reloads.

## Test coverage

AC-1, AC-4, AC-5 and the AC-3 countdown maths: unit tests on the pure functions in `src/lib/admin/loginCooldown.ts`.
AC-2 and the AC-3 copy are component behaviour. There is no component test runner yet (jsdom/RTL), so they are checked manually until one is added.
