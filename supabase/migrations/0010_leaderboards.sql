-- Spec: docs/specs/leaderboards.md
-- Unique nicknames (device-token claims) and period/category leaderboards.

create function public.nickname_key(n text)
returns text language sql immutable
as $$ select lower(regexp_replace(btrim(n), '\s+', ' ', 'g')) $$;

-- ponytail: claims are never released, so a renamed player leaves an orphan
-- name behind. Add a sweep only if names actually run short.
create table public.players (
  nickname_key text primary key,
  nickname text not null,
  token uuid not null,
  created_at timestamptz not null default now()
);
alter table public.players enable row level security;
revoke all on public.players from anon, authenticated;

create function public.claim_nickname(p_nickname text, p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  nick text := left(btrim(coalesce(p_nickname, '')), 24);
  owner uuid;
begin
  if nick = '' or p_token is null then
    raise exception 'Invalid nickname';
  end if;
  insert into players (nickname_key, nickname, token)
  values (nickname_key(nick), nick, p_token)
  on conflict do nothing;
  select token into owner from players where nickname_key = nickname_key(nick);
  return owner = p_token;
end;
$$;

-- start_game now claims the nickname (AC-10). Body otherwise as 0008.
drop function if exists public.start_game(uuid, text);

create function public.start_game(p_category_id uuid, p_nickname text, p_token uuid)
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
  if not claim_nickname(nick, p_token) then
    raise exception 'Nickname taken';
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

-- Window start in Nairobi time; null means no lower bound.
create function public.leaderboard_since(p_period text)
returns timestamptz
language plpgsql stable
as $$
begin
  if p_period = 'all' then
    return null;
  elsif p_period in ('day', 'week') then
    return date_trunc(p_period, now() at time zone 'Africa/Nairobi') at time zone 'Africa/Nairobi';
  end if;
  raise exception 'Invalid period';
end;
$$;

-- Full ranked board. Score = sum over categories of the player's best game in
-- the window; a category filter leaves one category, i.e. their best game.
-- ponytail: aggregates all completed games on every call; the 60s page cache
-- absorbs it. Add a materialised view if boards get slow.
create function public.leaderboard_all(p_period text, p_category_slug text)
returns table (rank int, nickname text, score int, categories_played int, reached_at timestamptz)
language sql stable
as $$
  with win as (
    select leaderboard_since(p_period) as since  -- raises on a bad period, even with no games
  ), best as (
    select distinct on (nickname_key(g.guest_nickname), g.category_id)
      nickname_key(g.guest_nickname) as k, g.score, g.completed_at
    from win w
    cross join games g
    join categories c on c.id = g.category_id
    where g.completed_at is not null
      and btrim(coalesce(g.guest_nickname, '')) <> ''
      and (w.since is null or g.completed_at >= w.since)
      and (p_category_slug is null or c.slug = p_category_slug)
    order by nickname_key(g.guest_nickname), g.category_id, g.score desc, g.completed_at asc
  ), totals as (
    select b.k, sum(b.score)::int as total, count(*)::int as cats, max(b.completed_at) as reached
    from best b
    group by b.k
  ), latest as (
    select distinct on (nickname_key(g.guest_nickname))
      nickname_key(g.guest_nickname) as k, btrim(g.guest_nickname) as nick
    from games g
    where g.completed_at is not null and btrim(coalesce(g.guest_nickname, '')) <> ''
    order by nickname_key(g.guest_nickname), g.completed_at desc
  )
  select
    (row_number() over (order by t.total desc, t.reached asc, l.nick))::int,
    l.nick, t.total, t.cats, t.reached
  from totals t
  join latest l on l.k = t.k
$$;

create function public.get_leaderboard(
  p_period text, p_category_slug text default null, p_limit int default 10
)
returns table (rank int, nickname text, score int, categories_played int, reached_at timestamptz)
language sql stable security definer
set search_path = public
as $$
  select * from leaderboard_all(p_period, p_category_slug) b
  order by b.rank
  limit greatest(1, least(coalesce(p_limit, 10), 50))
$$;

create function public.get_player_rank(
  p_period text, p_category_slug text default null, p_nickname text default null
)
returns table (rank int, score int, next_nickname text, next_score int)
language sql stable security definer
set search_path = public
as $$
  with b as (select * from leaderboard_all(p_period, p_category_slug))
  select me.rank, me.score, above.nickname, above.score
  from b me
  left join b above on above.rank = me.rank - 1
  where nickname_key(me.nickname) = nickname_key(p_nickname)
$$;

revoke all on function public.nickname_key(text) from public;
revoke all on function public.claim_nickname(text, uuid) from public;
revoke all on function public.start_game(uuid, text, uuid) from public;
revoke all on function public.leaderboard_since(text) from public;
revoke all on function public.leaderboard_all(text, text) from public;
revoke all on function public.get_leaderboard(text, text, int) from public;
revoke all on function public.get_player_rank(text, text, text) from public;
grant execute on function public.claim_nickname(text, uuid) to anon, authenticated;
grant execute on function public.start_game(uuid, text, uuid) to anon, authenticated;
grant execute on function public.get_leaderboard(text, text, int) to anon, authenticated;
grant execute on function public.get_player_rank(text, text, text) to anon, authenticated;
