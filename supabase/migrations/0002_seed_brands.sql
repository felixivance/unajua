insert into categories (slug, name, description) values
  ('kenyan-brands', 'Kenyan Brands', 'Identify iconic Kenyan brands, logos and slogans.')
on conflict (slug) do nothing;

insert into questions (category_id, prompt, image_url, accepted_answer, alternative_answers, explanation, source_name, difficulty)
select id, prompt, image_url, accepted_answer, alternative_answers, explanation, source_name, difficulty
from (values
  (
    'Which building is this?',
    null,
    'KICC',
    array['KENYATTA INTERNATIONAL CONVENTION CENTRE'],
    'KICC — Kenyatta International Convention Centre — opened in 1973 and remains one of Nairobi''s most recognizable landmarks.',
    'Official/reference source',
    1
  ),
  (
    'Which Kenyan telecom brand uses the slogan "Twaweza"?',
    null,
    'SAFARICOM',
    array[]::text[],
    'Safaricom is Kenya''s largest telecom operator, known for M-PESA and the "Twaweza" ("We can") campaign.',
    'Official/reference source',
    1
  ),
  (
    'Which brand pioneered mobile money in Kenya, launched in 2007?',
    null,
    'MPESA',
    array['M-PESA', 'M PESA'],
    'M-PESA launched in 2007 by Safaricom and transformed mobile payments across Kenya and East Africa.',
    'Official/reference source',
    1
  ),
  (
    'Which brewing company makes Tusker lager?',
    null,
    'EABL',
    array['EAST AFRICAN BREWERIES', 'EAST AFRICAN BREWERIES LIMITED'],
    'East African Breweries Limited (EABL) has produced Tusker since 1922, named after an elephant that killed the brewery''s co-founder.',
    'Official/reference source',
    2
  ),
  (
    'Which airline is Kenya''s national flag carrier?',
    null,
    'KENYA AIRWAYS',
    array['KQ'],
    'Kenya Airways, nicknamed "The Pride of Africa," is Kenya''s flag carrier airline.',
    'Official/reference source',
    1
  )
) as v(prompt, image_url, accepted_answer, alternative_answers, explanation, source_name, difficulty)
cross join (select id from categories where slug = 'kenyan-brands') as c
where not exists (
  select 1 from questions q where q.prompt = v.prompt
);
