-- Games are created/scored only via SECURITY DEFINER RPCs.
-- Score is always sum(game_answers.points_earned), never a client-supplied value.

alter table games
  add column if not exists question_ids uuid[] not null default '{}';

create unique index if not exists game_answers_game_question_uidx
  on game_answers (game_id, question_id);

drop policy if exists "anyone can create a game" on games;
drop policy if exists "owners can update their own game" on games;
drop policy if exists "anyone can insert game answers" on game_answers;
drop policy if exists "game answers are publicly readable" on game_answers;

revoke insert, update, delete on table games from public, anon, authenticated;
revoke insert, update, delete, select on table game_answers from public, anon, authenticated;

create or replace function public.start_game(p_category_id uuid, p_nickname text)
returns table (
  game_id uuid,
  id uuid,
  category_id uuid,
  prompt text,
  image_url text,
  difficulty smallint,
  letter_tiles text[],
  answer_length integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  nick text;
begin
  nick := left(trim(coalesce(p_nickname, '')), 24);
  if nick = '' then
    raise exception 'Invalid nickname';
  end if;

  return query
  with dealt as materialized (
    select * from get_play_questions(p_category_id)
  ), created as (
    insert into games (category_id, guest_nickname, total_questions, question_ids, score)
    select p_category_id, nick, count(*)::int, array_agg(dealt.id), 0
    from dealt
    having count(*) > 0
    returning id
  )
  select
    created.id,
    dealt.id,
    dealt.category_id,
    dealt.prompt,
    dealt.image_url,
    dealt.difficulty,
    dealt.letter_tiles,
    dealt.answer_length
  from created
  cross join dealt;
end;
$$;

create or replace function public.submit_game_answer(
  p_game_id uuid,
  p_question_id uuid,
  p_submitted text
)
returns table (
  is_correct boolean,
  accepted_answer text,
  explanation text,
  source_name text,
  source_url text,
  points_earned integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  g games%rowtype;
  chk record;
begin
  select * into g from games where games.id = p_game_id;
  if not found then
    raise exception 'Game not found';
  end if;
  if g.completed_at is not null then
    raise exception 'Game already completed';
  end if;
  if g.question_ids is null or not (p_question_id = any (g.question_ids)) then
    raise exception 'Question not in this game';
  end if;

  select * into chk from check_question_answer(p_question_id, p_submitted);

  insert into game_answers (
    game_id, question_id, submitted_answer, is_correct, points_earned
  ) values (
    p_game_id, p_question_id, left(p_submitted, 64), chk.is_correct, chk.points_earned
  );

  is_correct := chk.is_correct;
  accepted_answer := chk.accepted_answer;
  explanation := chk.explanation;
  source_name := chk.source_name;
  source_url := chk.source_url;
  points_earned := chk.points_earned;
  return next;
exception
  when unique_violation then
    raise exception 'Already answered';
end;
$$;

create or replace function public.complete_game(p_game_id uuid)
returns table (
  score integer,
  correct_count integer,
  total_questions integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  g games%rowtype;
  answered integer;
  pts integer;
  correct integer;
begin
  select * into g from games where games.id = p_game_id for update;
  if not found then
    raise exception 'Game not found';
  end if;

  select
    count(*)::int,
    coalesce(sum(game_answers.points_earned), 0)::int,
    count(*) filter (where game_answers.is_correct)::int
  into answered, pts, correct
  from game_answers
  where game_answers.game_id = p_game_id;

  if g.completed_at is not null then
    score := g.score;
    correct_count := correct;
    total_questions := g.total_questions;
    return next;
    return;
  end if;

  if answered is distinct from cardinality(g.question_ids) then
    raise exception 'Game incomplete';
  end if;

  update games
  set
    score = pts,
    total_questions = answered,
    completed_at = now()
  where games.id = p_game_id;

  score := pts;
  correct_count := correct;
  total_questions := answered;
  return next;
end;
$$;

revoke all on function public.start_game(uuid, text) from public;
revoke all on function public.submit_game_answer(uuid, uuid, text) from public;
revoke all on function public.complete_game(uuid) from public;
revoke all on function public.get_play_questions(uuid) from public, anon, authenticated;
revoke all on function public.check_question_answer(uuid, text) from public, anon, authenticated;

grant execute on function public.start_game(uuid, text) to anon, authenticated;
grant execute on function public.submit_game_answer(uuid, uuid, text) to anon, authenticated;
grant execute on function public.complete_game(uuid) to anon, authenticated;
