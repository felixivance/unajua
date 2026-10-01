-- Resume a game after refresh. Spec: docs/specs/resume-game.md
-- Everything returned is read from the server; the client stores only the game id.

alter table games
  add column if not exists question_started_at timestamptz not null default now();

-- The clock for the next question restarts whenever an answer is stored.
create or replace function public.touch_question_started_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update games set question_started_at = now() where id = new.game_id;
  return new;
end;
$$;

drop trigger if exists game_answers_touch_clock on game_answers;
create trigger game_answers_touch_clock
  after insert on game_answers
  for each row execute function public.touch_question_started_at();

-- ponytail: copy of the tile logic in get_play_questions (0009) so resume can rebuild tiles;
-- fold get_play_questions onto this helper if the tile rules ever change.
create or replace function public.build_letter_tiles(p_answer text)
returns text[]
language plpgsql
volatile
set search_path = public
as $$
declare
  letters text[] := string_to_array(public.normalize_answer(p_answer), null);
  decoys text[] := '{}';
  alphabet constant text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  tiles text[];
  i int;
begin
  for i in 1..4 loop
    decoys := decoys || substr(alphabet, 1 + floor(random() * 26)::int, 1);
  end loop;
  select coalesce(array_agg(t order by random()), '{}')
    into tiles
    from unnest(letters || decoys) as t;
  return tiles;
end;
$$;

create or replace function public.resume_game(p_game_id uuid, p_token uuid)
returns table (
  game_id uuid,
  question_id uuid,
  category_id uuid,
  prompt text,
  image_url text,
  difficulty smallint,
  letter_tiles text[],
  answer_length integer,
  remaining_ms integer,
  submitted_answer text,
  is_correct boolean,
  points_earned integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  g games%rowtype;
begin
  select games.* into g
  from games
  join players p on p.nickname_key = nickname_key(games.guest_nickname)
  where games.id = p_game_id
    and p.token = p_token
    and games.completed_at is null
    and games.created_at > now() - interval '24 hours';
  if not found then
    return;
  end if;

  return query
  select
    g.id,
    q.id,
    q.category_id,
    q.prompt,
    q.image_url,
    q.difficulty,
    public.build_letter_tiles(q.accepted_answer),
    coalesce(cardinality(string_to_array(public.normalize_answer(q.accepted_answer), null)), 0),
    -- ponytail: 60s duplicated from QUESTION_TIME_LIMIT_MS
    greatest(0, 60000 - (extract(epoch from (now() - g.question_started_at)) * 1000)::int),
    a.submitted_answer,
    a.is_correct,
    a.points_earned
  from unnest(g.question_ids) with ordinality as ids(qid, pos)
  join questions q on q.id = ids.qid
  left join game_answers a on a.game_id = g.id and a.question_id = q.id
  order by ids.pos;
end;
$$;

revoke all on function public.build_letter_tiles(text) from public, anon, authenticated;
revoke all on function public.resume_game(uuid, uuid) from public;
grant execute on function public.resume_game(uuid, uuid) to anon, authenticated;
