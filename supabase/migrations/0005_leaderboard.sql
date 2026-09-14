-- Support guest (no-account) players on the leaderboard
alter table games add column if not exists guest_nickname text;

create index if not exists games_score_idx on games (score desc);
create index if not exists games_completed_at_idx on games (completed_at desc);
