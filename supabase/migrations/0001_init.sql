-- Categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Questions
create table questions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  prompt text not null,
  image_url text,
  accepted_answer text not null,
  alternative_answers text[] not null default '{}',
  explanation text,
  source_name text,
  source_url text,
  difficulty smallint not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text unique not null,
  created_at timestamptz not null default now()
);

-- Games (a single play-through of a category)
create table games (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  category_id uuid not null references categories(id),
  score integer not null default 0,
  total_questions integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Per-question answers within a game
create table game_answers (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  question_id uuid not null references questions(id),
  submitted_answer text,
  is_correct boolean not null,
  time_taken_ms integer,
  points_earned integer not null default 0,
  created_at timestamptz not null default now()
);

-- RLS
alter table categories enable row level security;
alter table questions enable row level security;
alter table profiles enable row level security;
alter table games enable row level security;
alter table game_answers enable row level security;

-- Public read access for active content
create policy "categories are publicly readable" on categories
  for select using (is_active = true);

create policy "questions are publicly readable" on questions
  for select using (is_active = true);

-- Profiles: users manage their own
create policy "profiles are publicly readable" on profiles
  for select using (true);

create policy "users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "users can update their own profile" on profiles
  for update using (auth.uid() = id);

-- Games: anyone can create/read games (anonymous play supported), owners can update their own
create policy "games are publicly readable" on games
  for select using (true);

create policy "anyone can create a game" on games
  for insert with check (true);

create policy "owners can update their own game" on games
  for update using (profile_id is null or auth.uid() = profile_id);

-- Game answers: readable/insertable alongside their game
create policy "game answers are publicly readable" on game_answers
  for select using (true);

create policy "anyone can insert game answers" on game_answers
  for insert with check (true);
