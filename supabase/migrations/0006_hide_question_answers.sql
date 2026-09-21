-- Answers (and explanation/source, which spoil them) are not publicly selectable.
-- Play uses get_play_questions / check_question_answer instead.

drop policy if exists "questions are publicly readable" on questions;

create policy "anon can read active questions"
  on questions for select
  to anon
  using (is_active = true);

-- Table-level SELECT includes every column; revoke it, then grant only public fields.
revoke select on table questions from public;
revoke select on table questions from anon;

grant select (
  id,
  category_id,
  prompt,
  image_url,
  difficulty,
  is_active,
  created_at
) on table questions to anon;

create or replace function public.normalize_answer(value text)
returns text
language sql
immutable
as $$
  select regexp_replace(upper(trim(coalesce(value, ''))), '[^A-Z0-9]', '', 'g');
$$;

create or replace function public.get_play_questions(p_category_id uuid)
returns table (
  id uuid,
  category_id uuid,
  prompt text,
  image_url text,
  difficulty smallint,
  letter_tiles text[],
  answer_length integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r record;
  letters text[];
  decoys text[];
  alphabet constant text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  i int;
begin
  if not exists (
    select 1 from categories c
    where c.id = p_category_id and c.is_active = true
  ) then
    return;
  end if;

  for r in
    select q.id, q.category_id, q.prompt, q.image_url, q.difficulty, q.accepted_answer
    from questions q
    where q.category_id = p_category_id
      and q.is_active = true
    limit 10
  loop
    letters := string_to_array(public.normalize_answer(r.accepted_answer), null);
    decoys := '{}';
    for i in 1..4 loop
      decoys := decoys || substr(alphabet, 1 + floor(random() * 26)::int, 1);
    end loop;

    id := r.id;
    category_id := r.category_id;
    prompt := r.prompt;
    image_url := r.image_url;
    difficulty := r.difficulty;
    select coalesce(array_agg(t order by random()), '{}')
      into letter_tiles
      from unnest(letters || decoys) as t;
    answer_length := coalesce(cardinality(letters), 0);
    return next;
  end loop;
end;
$$;

create or replace function public.check_question_answer(p_question_id uuid, p_submitted text)
returns table (
  is_correct boolean,
  accepted_answer text,
  explanation text,
  source_name text,
  source_url text,
  points_earned integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  q record;
  norm text;
  candidate text;
  ok boolean := false;
begin
  select
    questions.accepted_answer,
    questions.alternative_answers,
    questions.explanation,
    questions.source_name,
    questions.source_url
  into q
  from questions
  where questions.id = p_question_id
    and questions.is_active = true;

  if not found then
    raise exception 'Question not found';
  end if;

  norm := public.normalize_answer(p_submitted);

  foreach candidate in array array_prepend(q.accepted_answer, q.alternative_answers)
  loop
    if public.normalize_answer(candidate) = norm then
      ok := true;
      exit;
    end if;
  end loop;

  is_correct := ok;
  accepted_answer := q.accepted_answer;
  explanation := q.explanation;
  source_name := q.source_name;
  source_url := q.source_url;
  points_earned := case when ok then 100 else 0 end;
  return next;
end;
$$;

revoke all on function public.normalize_answer(text) from public;
revoke all on function public.get_play_questions(uuid) from public;
revoke all on function public.check_question_answer(uuid, text) from public;

grant execute on function public.get_play_questions(uuid) to anon, authenticated;
grant execute on function public.check_question_answer(uuid, text) to anon, authenticated;
