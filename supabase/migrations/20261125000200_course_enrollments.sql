-- ============================================================================
-- Course enrollment: who joined which course, and when.
--
-- Learners enroll on /courses. Saving progress in a course (website or mobile
-- app) also enrolls them, and existing learners are enrolled from their saved
-- progress. Lessons stay open without enrolling. Safe to run more than once.
-- ============================================================================

create table if not exists public.course_enrollments (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create index if not exists course_enrollments_course_idx
  on public.course_enrollments (course_id);

alter table public.course_enrollments enable row level security;
revoke all on public.course_enrollments from anon, authenticated;
grant select, delete on public.course_enrollments to authenticated;
-- enrolled_at is left out so a learner can't backdate it.
grant insert (user_id, course_id) on public.course_enrollments to authenticated;
grant all on public.course_enrollments to service_role;

drop policy if exists "Learners read their enrollments" on public.course_enrollments;
create policy "Learners read their enrollments"
  on public.course_enrollments for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Learners enroll in published courses" on public.course_enrollments;
create policy "Learners enroll in published courses"
  on public.course_enrollments for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.courses c
      where c.id = course_id and c.is_published
    )
  );

drop policy if exists "Learners leave a course" on public.course_enrollments;
create policy "Learners leave a course"
  on public.course_enrollments for delete to authenticated
  using (user_id = auth.uid());

-- Enroll automatically when progress is saved.
create or replace function public.enroll_on_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.course_id is not null then
    begin
      insert into public.course_enrollments (user_id, course_id)
      values (new.user_id, new.course_id)
      on conflict do nothing;
    exception when others then
      -- Never let enrollment stop a learner's progress from saving.
      raise warning 'enroll_on_progress: %', sqlerrm;
    end;
  end if;

  return new;
end;
$$;

revoke all on function public.enroll_on_progress() from public, anon, authenticated;

drop trigger if exists enroll_on_progress on public.user_progress;
create trigger enroll_on_progress
  after insert or update on public.user_progress
  for each row
  execute function public.enroll_on_progress();

-- Existing learners.
insert into public.course_enrollments (user_id, course_id, enrolled_at)
select p.user_id,
       p.course_id,
       coalesce(min(coalesce(p.completed_at, p.last_accessed_at)), now())
from public.user_progress p
join auth.users u on u.id = p.user_id
join public.courses c on c.id = p.course_id
group by p.user_id, p.course_id
on conflict do nothing;

-- Admin totals per course. Every enrolled learner is in exactly one of
-- completed / active / inactive (no progress and no new enrollment in 30 days).
create or replace function public.course_enrollment_stats()
returns table (
  course_id uuid,
  title text,
  is_published boolean,
  enrolled bigint,
  completed bigint,
  active bigint,
  inactive bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with lesson_totals as (
    select l.course_id, count(*) as total
    from public.lessons l
    where l.is_published
    group by l.course_id
  ),
  learners as (
    select e.course_id,
           e.user_id,
           count(distinct p.lesson_id)
             filter (where p.completed and l.is_published) as done,
           greatest(e.enrolled_at, max(p.last_accessed_at)) as last_seen
    from public.course_enrollments e
    left join public.user_progress p
      on p.user_id = e.user_id and p.course_id = e.course_id
    left join public.lessons l
      on l.id = p.lesson_id and l.course_id = e.course_id
    group by e.course_id, e.user_id, e.enrolled_at
  ),
  states as (
    select n.course_id,
           coalesce(t.total, 0) > 0 and n.done >= t.total as is_done,
           n.last_seen >= now() - interval '30 days' as is_recent
    from learners n
    left join lesson_totals t on t.course_id = n.course_id
  )
  select c.id,
         c.title,
         c.is_published,
         count(s.course_id),
         count(*) filter (where s.is_done),
         count(*) filter (where not s.is_done and s.is_recent),
         count(*) filter (where not s.is_done and not s.is_recent)
  from public.courses c
  left join states s on s.course_id = c.id
  group by c.id, c.title, c.is_published
  order by c.title;
$$;

revoke all on function public.course_enrollment_stats() from public, anon, authenticated;
grant execute on function public.course_enrollment_stats() to service_role;
