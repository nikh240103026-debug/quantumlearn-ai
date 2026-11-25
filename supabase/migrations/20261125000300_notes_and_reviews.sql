-- ============================================================================
-- Personal lesson notes and course reviews. Safe to run more than once.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. LESSON NOTES: private to the learner (one note per lesson).
-- ----------------------------------------------------------------------------

create table if not exists public.lesson_notes (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 10000),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.lesson_notes enable row level security;
revoke all on public.lesson_notes from anon, authenticated;
grant select, insert, update, delete on public.lesson_notes to authenticated;
grant all on public.lesson_notes to service_role;

drop policy if exists "Learners manage their notes" on public.lesson_notes;
create policy "Learners manage their notes"
  on public.lesson_notes for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function public.lesson_notes_touch()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists lesson_notes_touch on public.lesson_notes;
create trigger lesson_notes_touch
  before insert or update on public.lesson_notes
  for each row
  execute function public.lesson_notes_touch();

-- ----------------------------------------------------------------------------
-- 2. COURSE REVIEWS: read and written only by server code (service role),
--    which checks that the reviewer has actually studied the course.
-- ----------------------------------------------------------------------------

create table if not exists public.course_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 1000),
  -- Set by an admin; editing the review doesn't clear it.
  hidden_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index if not exists course_reviews_course_idx
  on public.course_reviews (course_id, updated_at desc);

alter table public.course_reviews enable row level security;
revoke all on public.course_reviews from anon, authenticated;
grant all on public.course_reviews to service_role;

create or replace function public.course_rating_summary()
returns table (course_id uuid, average numeric, total bigint)
language sql
stable
security definer
set search_path = public
as $$
  select r.course_id, round(avg(r.rating), 1), count(*)
  from public.course_reviews r
  where r.hidden_at is null
  group by r.course_id;
$$;

revoke all on function public.course_rating_summary() from public, anon, authenticated;
grant execute on function public.course_rating_summary() to service_role;
