-- Spec: docs/specs/leaderboards.md (AC numbers in test names)
begin;
select plan(22);

-- Fixtures: own categories so seeded data cannot interfere. Games are inserted
-- as superuser (anon cannot write games, see game_rules.test.sql AC-2).
insert into categories (id, slug, name) values
  ('00000000-0000-0000-0000-00000000d001', 'lb-a', 'LB A'),
  ('00000000-0000-0000-0000-00000000d002', 'lb-b', 'LB B');

-- Nairobi-relative times so the test does not depend on when it runs.
create temp table t_now as
  select date_trunc('day', now() at time zone 'Africa/Nairobi') at time zone 'Africa/Nairobi' as day_start,
         date_trunc('week', now() at time zone 'Africa/Nairobi') at time zone 'Africa/Nairobi' as week_start;
grant select on t_now to anon;

-- Otieno: A 300 + A 500 (best 500) + B 200 => 700. Two spellings, one player.
-- Wanjiku: A 700 => 700, but reached later than Otieno => ranks below.
-- Kip: A 900 completed yesterday (outside day, inside all); B 100 today.
-- Ghost: 1000 but never completed.
insert into games (category_id, guest_nickname, score, total_questions, completed_at)
select c, n, s, 10, t from (values
  ('00000000-0000-0000-0000-00000000d001'::uuid, 'Otieno',   300, (select day_start + interval '1 hour'  from t_now)),
  ('00000000-0000-0000-0000-00000000d001'::uuid, ' otieno ', 500, (select day_start + interval '2 hours' from t_now)),
  ('00000000-0000-0000-0000-00000000d002'::uuid, 'Otieno',   200, (select day_start + interval '3 hours' from t_now)),
  ('00000000-0000-0000-0000-00000000d001'::uuid, 'Wanjiku',  700, (select day_start + interval '4 hours' from t_now)),
  ('00000000-0000-0000-0000-00000000d001'::uuid, 'Kip',      900, (select day_start - interval '1 hour'  from t_now)),
  ('00000000-0000-0000-0000-00000000d002'::uuid, 'Kip',      100, (select day_start + interval '5 hours' from t_now))
) as v(c, n, s, t);
insert into games (category_id, guest_nickname, score, total_questions, completed_at)
values ('00000000-0000-0000-0000-00000000d001', 'Ghost', 1000, 10, null);

set local role anon;

-- AC-8: anon can call, cannot read players.
select lives_ok($$select * from get_leaderboard('all', null, 10)$$, 'AC-8: anon can call get_leaderboard');
select lives_ok($$select * from get_player_rank('all', null, 'Otieno')$$, 'AC-8: anon can call get_player_rank');
select throws_ok($$select * from players$$, '42501', null, 'AC-8: anon cannot read players');

-- AC-1: window and bad period. Scoped to the fixture categories via the slug.
select throws_ok($$select * from get_leaderboard('month', null, 10)$$, 'P0001', null, 'AC-1: unknown period raises');
select is(
  (select nickname from get_leaderboard('day', 'lb-a', 10) where lower(nickname) = 'kip'),
  null, 'AC-1: yesterday''s game is outside the day window');
select is(
  (select score from get_leaderboard('all', 'lb-a', 10) where lower(nickname) = 'kip'),
  900, 'AC-1: all-time has no lower bound');
select is(
  (select count(*)::int from get_leaderboard('week', 'lb-a', 10) where lower(nickname) = 'kip'),
  (select case when (select day_start from t_now) - interval '1 hour' >= (select week_start from t_now) then 1 else 0 end),
  'AC-1: week window starts Monday 00:00 Nairobi');

-- AC-2
select is(
  (select count(*)::int from get_leaderboard('all', 'lb-a', 10) where lower(nickname) = 'ghost'),
  0, 'AC-2: an uncompleted game is ignored');

-- AC-3
select is(
  (select score from get_leaderboard('all', 'lb-a', 10) where lower(nickname) = 'otieno'),
  500, 'AC-3: category board counts only the best game');
select is(
  (select score from get_leaderboard('day', null, 50) where lower(nickname) = 'otieno'),
  700, 'AC-3: overall sums best game per category (500 + 200)');
select is(
  (select count(*)::int from get_leaderboard('all', 'no-such-category', 10)),
  0, 'AC-3: unknown slug returns nothing');

-- AC-4
select is(
  (select count(*)::int from get_leaderboard('day', null, 50) where lower(trim(nickname)) = 'otieno'),
  1, 'AC-4: differently spelled nicknames are one player');

-- AC-5: Otieno and Wanjiku both 700 on day/all; Otieno reached it at +3h, Wanjiku at +4h.
select is(
  (select array_agg(lower(trim(nickname)) order by rank)
   from get_leaderboard('day', null, 50) where lower(trim(nickname)) in ('otieno', 'wanjiku')),
  array['otieno', 'wanjiku'], 'AC-5: tie broken by earliest reached_at');
select is(
  (select array_agg(rank order by rank) from get_leaderboard('day', null, 50)),
  (select array_agg(g order by g) from generate_series(1, (select count(*)::int from get_leaderboard('day', null, 50))) g),
  'AC-5: ranks are 1..n with no repeats');

-- AC-6
select ok((select count(*) from get_leaderboard('all', null, 500)) <= 50, 'AC-6: limit is clamped to 50');
select is(
  (select categories_played from get_leaderboard('day', null, 50) where lower(trim(nickname)) = 'otieno'),
  2, 'AC-6: categories_played is returned');

-- AC-7
select is(
  (select rank from get_player_rank('day', null, 'wanjiku')),
  (select rank from get_leaderboard('day', null, 50) where lower(trim(nickname)) = 'wanjiku'),
  'AC-7: player rank matches the board');
select is(
  (select next_nickname from get_player_rank('day', null, 'wanjiku')),
  (select nickname from get_leaderboard('day', null, 50) where lower(trim(nickname)) = 'otieno'),
  'AC-7: next player is the one directly above');
select is(
  (select count(*)::int from get_player_rank('day', null, 'nobody-here')),
  0, 'AC-7: absent player returns no row');

-- AC-9 / AC-10 (as anon: both are callable by players)
select is(claim_nickname('Nairobi Simba', '00000000-0000-0000-0000-0000000000f1'), true, 'AC-9: free name is claimed');
select is(claim_nickname(' nairobi  SIMBA ', '00000000-0000-0000-0000-0000000000f2'), false,
  'AC-9: another token cannot take it (case and spacing ignored)');
select throws_ok(
  $$select * from start_game('00000000-0000-0000-0000-00000000d001', 'nairobi simba', '00000000-0000-0000-0000-0000000000f2')$$,
  'P0001', 'Nickname taken', 'AC-10: start_game refuses a taken nickname');

select * from finish();
rollback;
