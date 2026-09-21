-- Deal a random 10 each round instead of the same first 10.

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
    order by random()
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
