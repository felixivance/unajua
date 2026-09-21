drop function if exists public.start_game(uuid, text);

create function public.start_game(p_category_id uuid, p_nickname text)
returns table (
  game_id uuid,
  question_id uuid,
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
    returning games.id as started_id
  )
  select
    created.started_id,
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

revoke all on function public.start_game(uuid, text) from public;
grant execute on function public.start_game(uuid, text) to anon, authenticated;
