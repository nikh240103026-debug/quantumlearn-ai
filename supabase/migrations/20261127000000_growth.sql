-- ============================================================================
-- Reminders, phone notifications, invitations and the weekly leaderboard.
-- All tables are server only (service role). Safe to run more than once.
-- ============================================================================

create table if not exists public.push_tokens (
  token text primary key check (char_length(token) <= 200),
  user_id uuid not null references auth.users (id) on delete cascade,
  platform text not null check (platform in ('android', 'ios')),
  updated_at timestamptz not null default now()
);
create index if not exists push_tokens_user_idx on public.push_tokens (user_id);

create table if not exists public.reminder_log (
  user_id uuid primary key references auth.users (id) on delete cascade,
  sent_at timestamptz not null default now(),
  -- Reminders since the learner was last active.
  unanswered integer not null default 1
);

create table if not exists public.invite_codes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  referred_id uuid primary key references auth.users (id) on delete cascade,
  referrer_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (referred_id <> referrer_id)
);
create index if not exists referrals_referrer_idx on public.referrals (referrer_id);

-- Only learners who chose to appear, under a nickname.
create table if not exists public.leaderboard_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null check (nickname ~ '^[A-Za-z0-9 _-]{3,20}$'),
  blocked boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists leaderboard_nickname_key
  on public.leaderboard_members (lower(nickname));

do $$
declare
  t text;
begin
  foreach t in array array['push_tokens', 'reminder_log', 'invite_codes', 'referrals', 'leaderboard_members'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end
$$;

-- Learners who asked for reminders, have studied before, and have been away
-- 3 to 60 days. At most one reminder a week, and three without a reply.
create or replace function public.reminder_candidates(p_limit integer)
returns table (user_id uuid, email text, full_name text)
language sql
stable
security definer
set search_path = public
as $$
  with activity as (
    select u.id,
           u.email::text as email,
           greatest(
             s.last_activity_date::timestamptz,
             (select max(p.last_accessed_at) from user_progress p where p.user_id = u.id)
           ) as last_active
    from auth.users u
    left join learning_streaks s on s.user_id = u.id
    where u.email_confirmed_at is not null
      and (u.banned_until is null or u.banned_until < now())
  )
  select a.id, a.email, pr.full_name
  from activity a
  join profiles pr on pr.id = a.id
  join account_settings st on st.user_id = a.id
  left join reminder_log r on r.user_id = a.id
  where st.notification_preferences ->> 'study_reminders' = 'true'
    and coalesce(pr.age, 0) >= 13
    and a.last_active between now() - interval '60 days' and now() - interval '3 days'
    and (
      r.user_id is null
      or (r.sent_at < now() - interval '7 days'
          and (r.unanswered < 3 or a.last_active > r.sent_at))
    )
  order by a.last_active desc
  limit least(greatest(p_limit, 0), 200);
$$;

create or replace function public.log_reminder(p_user_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  insert into reminder_log (user_id) values (p_user_id)
  on conflict (user_id) do update
    set unanswered = case
          when exists (
            select 1 from user_progress p
            where p.user_id = p_user_id and p.last_accessed_at > reminder_log.sent_at
          ) or exists (
            select 1 from learning_streaks s
            where s.user_id = p_user_id and s.last_activity_date::timestamptz > reminder_log.sent_at
          ) then 1
          else reminder_log.unanswered + 1
        end,
        sent_at = now();
$$;

-- Points since Monday (UTC): 10 for a lesson, 5 for each right quiz answer,
-- 30 for a passed assessment (once each).
create or replace function public.weekly_leaderboard()
returns table (user_id uuid, nickname text, points bigint)
language sql
stable
security definer
set search_path = public
as $$
  with week as (select date_trunc('week', now() at time zone 'utc') at time zone 'utc' as start),
  points as (
    select p.user_id, 10 * count(distinct p.lesson_id) as score
    from user_progress p, week
    where p.completed and p.completed_at >= week.start
    group by p.user_id
    union all
    select q.user_id, 5 * sum(q.correct)
    from lesson_quiz_results q, week
    where q.updated_at >= week.start
    group by q.user_id
    union all
    select a.user_id, 30 * count(distinct a.assessment_id)
    from assessment_attempts a, week
    where a.passed and a.submitted_at >= week.start
    group by a.user_id
  )
  select m.user_id, m.nickname, sum(points.score)::bigint
  from leaderboard_members m
  join points on points.user_id = m.user_id
  join auth.users u on u.id = m.user_id
  where not m.blocked
    and (u.banned_until is null or u.banned_until < now())
  group by m.user_id, m.nickname
  order by 3 desc, m.nickname
  limit 50;
$$;

revoke all on function public.reminder_candidates(integer) from public, anon, authenticated;
revoke all on function public.log_reminder(uuid) from public, anon, authenticated;
revoke all on function public.weekly_leaderboard() from public, anon, authenticated;
grant execute on function public.reminder_candidates(integer) to service_role;
grant execute on function public.log_reminder(uuid) to service_role;
grant execute on function public.weekly_leaderboard() to service_role;
