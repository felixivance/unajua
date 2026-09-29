-- Spec: docs/specs/game-rules-db.md (AC numbers in test names)
begin;
select plan(17);

-- Fixtures: own category so seeded data cannot interfere.
insert into categories (id, slug, name)
values ('00000000-0000-0000-0000-00000000c001', 'pgtap-cat', 'pgTAP');
insert into questions (id, category_id, prompt, accepted_answer, explanation)
values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000c001',
   'Mobile money?', 'M-Pesa', 'secret fact'),
  ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-00000000c001',
   'Capital?', 'Nairobi', null);

set local role anon;

-- AC-1
select lives_ok(
  $$select id, prompt from questions where category_id = '00000000-0000-0000-0000-00000000c001'$$,
  'AC-1: anon can read question prompts');
select throws_ok($$select accepted_answer from questions$$, '42501', null,
  'AC-1: anon cannot read accepted_answer');
select throws_ok($$select explanation from questions$$, '42501', null,
  'AC-1: anon cannot read explanation');

-- AC-2
select throws_ok(
  $$insert into games (category_id, score) values ('00000000-0000-0000-0000-00000000c001', 10)$$,
  '42501', null, 'AC-2: anon cannot insert a game');
select throws_ok($$update games set score = 1000$$, '42501', null,
  'AC-2: anon cannot update a game score');
select throws_ok($$select * from game_answers$$, '42501', null,
  'AC-2: anon cannot read game_answers');

-- AC-3
select throws_ok(
  $$select * from get_play_questions('00000000-0000-0000-0000-00000000c001')$$,
  '42501', null, 'AC-3: anon cannot call get_play_questions');
select throws_ok(
  $$select * from check_question_answer('00000000-0000-0000-0000-0000000000a1', 'x')$$,
  '42501', null, 'AC-3: anon cannot call check_question_answer');

-- AC-4: start a game as anon, keep its id for later steps.
select set_config('t.game', (
  select game_id::text
  from start_game('00000000-0000-0000-0000-00000000c001', 'Tester') limit 1), true);
select ok(current_setting('t.game') <> '', 'AC-3: anon can start_game');

select is(
  (select count(*)::int from start_game('00000000-0000-0000-0000-00000000c001', 'Tester')
   where answer_length = 5 and cardinality(letter_tiles) = 9),
  1, 'AC-4: "M-Pesa" deals 5 letters + 4 decoys and exposes only its length');

-- AC-7: nothing answered yet.
select throws_ok(
  format($$select * from complete_game(%L)$$, current_setting('t.game')::uuid),
  'P0001', 'Game incomplete', 'AC-7: cannot complete with unanswered questions');

-- AC-5: normalised match earns points, wrong earns none.
select is(
  (select points_earned from submit_game_answer(current_setting('t.game')::uuid,
     '00000000-0000-0000-0000-0000000000a1', ' m pesa ')),
  100, 'AC-5: normalised correct answer earns 100');
select is(
  (select points_earned from submit_game_answer(current_setting('t.game')::uuid,
     '00000000-0000-0000-0000-0000000000a2', 'Mombasa')),
  0, 'AC-5: wrong answer earns 0');

-- AC-6
select throws_ok(
  format($$select * from submit_game_answer(%L, '00000000-0000-0000-0000-0000000000a1', 'x')$$,
    current_setting('t.game')::uuid),
  'P0001', 'Already answered', 'AC-6: a question cannot be answered twice');
select throws_ok(
  format($$select * from submit_game_answer(%L, gen_random_uuid(), 'x')$$,
    current_setting('t.game')::uuid),
  'P0001', 'Question not in this game', 'AC-6: question outside the game is rejected');

-- AC-8
select is(
  (select score from complete_game(current_setting('t.game')::uuid)),
  100, 'AC-8: score is the sum of points_earned');

reset role;
select is(
  (select score from games where id = current_setting('t.game')::uuid),
  100, 'AC-8: stored score matches');

select * from finish();
rollback;
