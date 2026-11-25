-- ============================================================================
-- Lesson sources, corrections, flashcards, classes, projects, and no minimum
-- age. Safe to run more than once.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. NO MINIMUM AGE: replace any check on profiles.age with a sanity check.
-- ----------------------------------------------------------------------------
do $$
declare
  c record;
begin
  for c in
    select con.conname
    from pg_constraint con
    join pg_attribute a
      on a.attrelid = con.conrelid and a.attnum = any (con.conkey)
    where con.conrelid = 'public.profiles'::regclass
      and con.contype = 'c'
      and array_length(con.conkey, 1) = 1
      and a.attname = 'age'
  loop
    execute format('alter table public.profiles drop constraint %I', c.conname);
  end loop;

  alter table public.profiles
    add constraint profiles_age_check check (age is null or age between 1 and 120) not valid;
end
$$;

-- ----------------------------------------------------------------------------
-- 2. LESSON SOURCES AND CORRECTIONS: public to read, written by the server.
-- ----------------------------------------------------------------------------
create table if not exists public.lesson_editorial (
  lesson_id uuid primary key references public.lessons (id) on delete cascade,
  author text check (char_length(author) <= 120),
  reviewer text check (char_length(reviewer) <= 120),
  reviewer_title text check (char_length(reviewer_title) <= 160),
  reviewed_on date,
  sources text check (char_length(sources) <= 4000),
  youtube_id text check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_corrections (
  id uuid primary key default gen_random_uuid(),
  place text not null check (char_length(place) between 1 and 160),
  description text not null check (char_length(description) between 1 and 2000),
  corrected_on date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.lesson_editorial enable row level security;
alter table public.content_corrections enable row level security;
revoke all on public.lesson_editorial, public.content_corrections from anon, authenticated;
grant select on public.lesson_editorial, public.content_corrections to anon, authenticated;
grant all on public.lesson_editorial, public.content_corrections to service_role;

drop policy if exists "Anyone reads sources of published lessons" on public.lesson_editorial;
create policy "Anyone reads sources of published lessons"
  on public.lesson_editorial for select to anon, authenticated
  using (exists (select 1 from public.lessons l where l.id = lesson_id and l.is_published));

drop policy if exists "Anyone reads corrections" on public.content_corrections;
create policy "Anyone reads corrections"
  on public.content_corrections for select to anon, authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- 3. FLASHCARDS: private to the learner.
-- ----------------------------------------------------------------------------
create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  front text not null check (char_length(front) between 1 and 500),
  back text not null check (char_length(back) between 1 and 2000),
  interval_days integer not null default 0 check (interval_days between 0 and 365),
  due_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists flashcards_due_idx on public.flashcards (user_id, due_at);

alter table public.flashcards enable row level security;
revoke all on public.flashcards from anon, authenticated;
grant select, insert, update, delete on public.flashcards to authenticated;
grant all on public.flashcards to service_role;

drop policy if exists "Learners manage their flashcards" on public.flashcards;
create policy "Learners manage their flashcards"
  on public.flashcards for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 4. CLASSES AND PROJECTS: server only (service role).
-- ----------------------------------------------------------------------------
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  join_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.class_members (
  class_id uuid not null references public.classes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, user_id)
);

create table if not exists public.class_assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  kind text not null check (kind in ('lesson', 'assessment')),
  -- lessons.id or the assessment id.
  ref_id text not null check (char_length(ref_id) <= 100),
  title text not null check (char_length(title) <= 200),
  href text not null check (char_length(href) <= 300),
  due_on date,
  created_at timestamptz not null default now(),
  unique (class_id, kind, ref_id)
);

create index if not exists class_members_user_idx on public.class_members (user_id);
create index if not exists classes_owner_idx on public.classes (owner_id);

create table if not exists public.course_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  url text not null check (char_length(url) <= 500),
  description text not null check (char_length(description) between 1 and 3000),
  status text not null default 'submitted'
    check (status in ('submitted', 'approved', 'changes')),
  feedback text check (char_length(feedback) <= 3000),
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  submitted_at timestamptz not null default now(),
  unique (user_id, course_id)
);

do $$
declare
  t text;
begin
  foreach t in array array['classes', 'class_members', 'class_assignments', 'course_projects'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end
$$;
