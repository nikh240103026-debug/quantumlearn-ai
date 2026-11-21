-- ============================================================================
-- Practice integrity, atomic topic progress, and report details.
--
-- Safe to run more than once. The app keeps working before this runs:
-- each feature below falls back to the previous behaviour when its table or
-- function is missing.
--
-- Run in the Supabase SQL editor, or with `supabase db push`.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. PRACTICE SESSIONS
--
-- A session is created when the quiz loads its questions. The first answer
-- checked for each question is recorded, and the final result is graded from
-- those first answers, so checking a question (which reveals the correct
-- option) and then answering it differently doesn't raise the score.
-- A session can be completed only once, which also stops duplicate results.
-- ----------------------------------------------------------------------------

create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  question_ids text[] not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists practice_sessions_user_idx
  on public.practice_sessions (user_id, created_at desc);

create table if not exists public.practice_session_answers (
  session_id uuid not null references public.practice_sessions (id) on delete cascade,
  question_id text not null,
  answer integer not null,
  created_at timestamptz not null default now(),
  primary key (session_id, question_id)
);

alter table public.practice_sessions enable row level security;
alter table public.practice_session_answers enable row level security;

drop policy if exists "practice_sessions own select" on public.practice_sessions;
create policy "practice_sessions own select"
  on public.practice_sessions for select
  using (user_id = auth.uid());

drop policy if exists "practice_sessions own insert" on public.practice_sessions;
create policy "practice_sessions own insert"
  on public.practice_sessions for insert
  with check (user_id = auth.uid());

-- Users may only mark their own open session as completed.
drop policy if exists "practice_sessions own complete" on public.practice_sessions;
create policy "practice_sessions own complete"
  on public.practice_sessions for update
  using (user_id = auth.uid() and completed_at is null)
  with check (user_id = auth.uid());

drop policy if exists "practice_session_answers own select" on public.practice_session_answers;
create policy "practice_session_answers own select"
  on public.practice_session_answers for select
  using (exists (
    select 1 from public.practice_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  ));

-- Answers can be added only to the user's own, still-open session.
-- There is no update/delete policy: the first answer is final.
drop policy if exists "practice_session_answers own insert" on public.practice_session_answers;
create policy "practice_session_answers own insert"
  on public.practice_session_answers for insert
  with check (exists (
    select 1 from public.practice_sessions s
    where s.id = session_id
      and s.user_id = auth.uid()
      and s.completed_at is null
  ));


-- ----------------------------------------------------------------------------
-- 2. ATOMIC CURRICULUM TOPIC PROGRESS
--
-- Replaces a read-modify-write in the app that lost updates (and could
-- create duplicate rows) when two results for the same topic were saved at
-- the same time. Same formula as before:
--   answered/correct accumulate; mastery = accumulated accuracy on the first
--   result, then 40% previous mastery + 60% latest percentage.
-- Runs as the calling user (SECURITY INVOKER), so existing RLS still applies.
-- ----------------------------------------------------------------------------

create or replace function public.apply_topic_practice_result(
  p_topic_id public.curriculum_topic_progress.topic_id%type,
  p_score integer,
  p_total integer,
  p_percentage numeric
)
returns public.curriculum_topic_progress
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_existing public.curriculum_topic_progress;
  v_answered integer;
  v_correct integer;
  v_accuracy numeric;
  v_mastery numeric;
  v_result public.curriculum_topic_progress;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  if p_total is null or p_total <= 0
     or p_score is null or p_score < 0 or p_score > p_total then
    raise exception 'invalid practice result';
  end if;

  -- Serialise concurrent updates for this user + topic, including the
  -- case where no row exists yet (so two inserts can't race).
  perform pg_advisory_xact_lock(
    hashtextextended(v_user::text || ':' || p_topic_id::text, 0)
  );

  select * into v_existing
  from public.curriculum_topic_progress
  where user_id = v_user and topic_id = p_topic_id
  order by updated_at desc nulls last
  limit 1
  for update;

  v_answered := coalesce(v_existing.questions_answered, 0) + p_total;
  v_correct := coalesce(v_existing.questions_correct, 0) + p_score;
  v_accuracy := (v_correct::numeric * 100) / v_answered;

  if v_existing.user_id is not null then
    v_mastery := case
      when coalesce(v_existing.mastery_score, 0) = 0 then v_accuracy
      else v_existing.mastery_score * 0.4 + p_percentage * 0.6
    end;
  else
    v_mastery := v_accuracy;
  end if;

  v_mastery := least(100, greatest(0, v_mastery));

  if v_existing.user_id is not null then
    update public.curriculum_topic_progress
    set progress_percent = round(v_mastery),
        questions_answered = v_answered,
        questions_correct = v_correct,
        mastery_score = round(v_mastery, 2),
        last_activity_at = now(),
        updated_at = now()
    where id = v_existing.id
    returning * into v_result;
  else
    insert into public.curriculum_topic_progress (
      user_id, topic_id, progress_percent,
      lessons_completed, exercises_completed,
      questions_answered, questions_correct, mastery_score,
      last_activity_at, updated_at
    )
    values (
      v_user, p_topic_id, round(v_mastery),
      0, 0,
      v_answered, v_correct, round(v_mastery, 2),
      now(), now()
    )
    returning * into v_result;
  end if;

  return v_result;
end;
$$;

-- (Supabase's default privileges already allow `authenticated` to execute
-- new functions in the public schema.)


-- ----------------------------------------------------------------------------
-- 3. PRACTICE QUESTION REPORT DETAILS
--
-- The report form collects free-text details, but the table had no column
-- for them, so they were discarded.
-- ----------------------------------------------------------------------------

alter table public.practice_question_reports
  add column if not exists description text;
