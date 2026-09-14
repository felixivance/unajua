-- Admin flag on profiles
alter table profiles add column if not exists is_admin boolean not null default false;

-- Auto-create a profile row whenever a new auth user signs up
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(split_part(new.email, '@', 1), 'player_' || substr(new.id::text, 1, 8)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Helper to check admin status without recursive RLS lookups
create or replace function is_admin_user()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

-- Categories: admins can write
create policy "admins can insert categories" on categories
  for insert with check (is_admin_user());

create policy "admins can update categories" on categories
  for update using (is_admin_user());

create policy "admins can delete categories" on categories
  for delete using (is_admin_user());

create policy "admins can read all categories" on categories
  for select using (is_admin_user());

-- Questions: admins can write and see inactive/draft rows
create policy "admins can insert questions" on questions
  for insert with check (is_admin_user());

create policy "admins can update questions" on questions
  for update using (is_admin_user());

create policy "admins can delete questions" on questions
  for delete using (is_admin_user());

create policy "admins can read all questions" on questions
  for select using (is_admin_user());

-- Storage bucket for question images
insert into storage.buckets (id, name, public)
values ('question-images', 'question-images', true)
on conflict (id) do nothing;

create policy "question images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'question-images');

create policy "admins can upload question images"
  on storage.objects for insert
  with check (bucket_id = 'question-images' and is_admin_user());

create policy "admins can update question images"
  on storage.objects for update
  using (bucket_id = 'question-images' and is_admin_user());

create policy "admins can delete question images"
  on storage.objects for delete
  using (bucket_id = 'question-images' and is_admin_user());
