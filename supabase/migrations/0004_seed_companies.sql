insert into categories (slug, name, description) values
  ('kenyan-companies', 'Kenyan Companies', 'Identify Kenyan companies from their logos.')
on conflict (slug) do nothing;
