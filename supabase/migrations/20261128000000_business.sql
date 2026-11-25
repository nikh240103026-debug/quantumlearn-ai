-- ============================================================================
-- Payments, organizations, LMS connections, support tickets and live classes.
-- All tables are server only (service role). Nothing is for sale, and every
-- course stays free, until an admin activates a product.
-- Safe to run more than once. Needs 20261126000000 and 20261127000000.
-- ============================================================================

-- ---------------------------------------------------------------- payments --
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('plus', 'course')),
  course_id uuid references public.courses (id) on delete restrict,
  title text not null check (char_length(title) between 1 and 100),
  description text not null default '' check (char_length(description) <= 500),
  amount_paise integer not null check (amount_paise between 100 and 50000000),
  -- Length of access. Empty means it never ends.
  days integer check (days between 1 and 3660),
  active boolean not null default false,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  check ((kind = 'course') = (course_id is not null)),
  check (kind = 'course' or days is not null)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  -- Payment records outlive the account, without the person.
  user_id uuid references auth.users (id) on delete set null,
  product_id uuid not null references public.products (id) on delete restrict,
  kind text not null check (kind in ('plus', 'course')),
  course_id uuid references public.courses (id) on delete set null,
  title text not null,
  amount_paise integer not null check (amount_paise > 0),
  days integer,
  status text not null default 'created' check (status in ('created', 'paid', 'refunded')),
  link_id text unique,
  link_url text,
  payment_id text unique,
  refund_id text,
  access_until timestamptz,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  refunded_at timestamptz
);
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);

-- ----------------------------------------------------------- organizations --
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  join_code text not null unique,
  seats integer not null check (seats between 1 and 100000),
  -- Members get Plus and every paid course until then.
  license_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'student' check (role in ('manager', 'student')),
  joined_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index if not exists organization_members_user_idx on public.organization_members (user_id);

-- --------------------------------------------------------- LMS (LTI 1.3) ----
create table if not exists public.lti_platforms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  issuer text not null,
  client_id text not null,
  deployment_id text not null,
  auth_url text not null,
  token_url text not null,
  jwks_url text not null,
  created_at timestamptz not null default now(),
  unique (issuer, client_id, deployment_id)
);

create table if not exists public.lti_states (
  state text primary key,
  issuer text not null,
  client_id text not null,
  nonce text not null,
  expires_at timestamptz not null
);

create table if not exists public.lti_links (
  platform_id uuid not null references public.lti_platforms (id) on delete cascade,
  sub text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (platform_id, sub)
);
create index if not exists lti_links_user_idx on public.lti_links (user_id);

create table if not exists public.lti_launches (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references public.lti_platforms (id) on delete cascade,
  sub text not null,
  target text not null,
  lineitem text,
  secret_hash text not null,
  user_id uuid references auth.users (id) on delete cascade,
  expires_at timestamptz not null
);

-- ----------------------------------------------------------------- support --
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject text not null check (char_length(subject) between 1 and 160),
  category text not null check (category in ('account', 'learning', 'payment', 'certificate', 'technical', 'other')),
  status text not null default 'open' check (status in ('open', 'answered', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists support_tickets_user_idx on public.support_tickets (user_id);
create index if not exists support_tickets_status_idx on public.support_tickets (status, updated_at);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  from_staff boolean not null,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index if not exists support_messages_ticket_idx on public.support_messages (ticket_id, created_at);

-- ------------------------------------------------------------ live classes --
create table if not exists public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  starts_at timestamptz not null,
  minutes integer not null check (minutes between 10 and 480),
  meeting_url text not null check (char_length(meeting_url) <= 500),
  recording_url text check (char_length(recording_url) <= 500),
  created_at timestamptz not null default now()
);
create index if not exists class_sessions_class_idx on public.class_sessions (class_id, starts_at);

create table if not exists public.class_attendance (
  session_id uuid not null references public.class_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (session_id, user_id)
);

do $$
declare
  t text;
begin
  foreach t in array array[
    'products', 'orders', 'organizations', 'organization_members', 'lti_platforms', 'lti_states',
    'lti_links', 'lti_launches', 'support_tickets', 'support_messages', 'class_sessions', 'class_attendance'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end
$$;

-- --------------------------------------------------------------- functions --
create or replace function public.has_plus(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from orders o
    where o.user_id = p_user_id and o.kind = 'plus' and o.status = 'paid' and o.access_until > now()
  ) or exists (
    select 1 from organization_members m
    join organizations g on g.id = m.organization_id
    where m.user_id = p_user_id and g.license_until > now()
  );
$$;

-- Used by the policy on lessons. Free courses, staff, buyers, licensed
-- members, and learners who enrolled before the course was sold.
create or replace function public.can_open_course(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from products p where p.course_id = p_course_id and p.active
  ) or exists (
    select 1 from profiles f where f.id = auth.uid() and f.role in ('admin', 'tutor')
  ) or exists (
    select 1 from orders o
    where o.user_id = auth.uid() and o.course_id = p_course_id and o.status = 'paid'
      and (o.access_until is null or o.access_until > now())
  ) or exists (
    select 1 from course_enrollments e
    where e.user_id = auth.uid() and e.course_id = p_course_id
      and e.enrolled_at < (
        select min(p.activated_at) from products p where p.course_id = p_course_id and p.active
      )
  ) or exists (
    select 1 from organization_members m
    join organizations g on g.id = m.organization_id
    where m.user_id = auth.uid() and g.license_until > now()
  );
$$;

-- Restrictive: added to the existing rules, so it can only hide lessons.
drop policy if exists "Paid lessons need access" on public.lessons;
create policy "Paid lessons need access"
  on public.lessons as restrictive for select to anon, authenticated
  using (public.can_open_course(course_id));

-- A course can't be sold while its lessons are readable by everyone.
create or replace function public.lessons_are_protected()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select c.relrowsecurity and exists (
    select 1 from pg_policy p where p.polrelid = c.oid and p.polname = 'Paid lessons need access'
  )
  from pg_class c where c.oid = 'public.lessons'::regclass;
$$;

-- Returns true only the first time. A renewal starts when the old access ends.
create or replace function public.mark_order_paid(p_order_id uuid, p_payment_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  o orders;
  start_at timestamptz;
begin
  select * into o from orders where id = p_order_id for update;
  if o.id is null or o.status <> 'created' then
    return false;
  end if;
  perform pg_advisory_xact_lock(hashtext('order:' || coalesce(o.user_id::text, o.id::text)));

  select greatest(now(), max(x.access_until)) into start_at
  from orders x
  where x.user_id = o.user_id and x.status = 'paid'
    and x.kind = o.kind and x.course_id is not distinct from o.course_id;

  update orders
  set status = 'paid',
      payment_id = p_payment_id,
      paid_at = now(),
      access_until = case when o.days is null then null
                          else coalesce(start_at, now()) + make_interval(days => o.days) end
  where id = o.id;
  return true;
end
$$;

-- 'joined', 'already' or 'full'. Managers don't use seats.
create or replace function public.join_organization(p_organization_id uuid, p_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed integer;
begin
  select seats into allowed from organizations where id = p_organization_id for update;
  if allowed is null then
    return 'missing';
  end if;
  if exists (select 1 from organization_members where organization_id = p_organization_id and user_id = p_user_id) then
    return 'already';
  end if;
  if (select count(*) from organization_members where organization_id = p_organization_id and role = 'student') >= allowed then
    return 'full';
  end if;
  insert into organization_members (organization_id, user_id) values (p_organization_id, p_user_id);
  return 'joined';
end
$$;

create or replace function public.organization_report(p_organization_id uuid)
returns table (
  user_id uuid, role text, full_name text, email text, joined_at timestamptz, last_active date,
  lessons bigint, quiz_percent integer, tests_passed bigint, certificates bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select m.user_id, m.role, coalesce(nullif(f.full_name, ''), 'Learner'), u.email::text, m.joined_at,
    (select s.last_activity_date::date from learning_streaks s where s.user_id = m.user_id limit 1),
    (select count(distinct p.lesson_id) from user_progress p where p.user_id = m.user_id and p.completed),
    (select round(100.0 * sum(q.correct) / nullif(sum(q.total), 0))::integer
       from lesson_quiz_results q where q.user_id = m.user_id),
    (select count(distinct a.assessment_id) from assessment_attempts a where a.user_id = m.user_id and a.passed),
    (select count(*) from certificates c where c.user_id = m.user_id and c.status = 'issued')
  from organization_members m
  join auth.users u on u.id = m.user_id
  left join profiles f on f.id = m.user_id
  where m.organization_id = p_organization_id
  order by m.role, 3;
$$;

create or replace function public.user_id_by_email(p_email text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  -- A college login can share an address with a password account.
  select id from auth.users
  where lower(email::text) = lower(p_email) and email_confirmed_at is not null
  order by is_sso_user, created_at
  limit 1;
$$;

do $$
declare
  f text;
begin
  foreach f in array array[
    'has_plus(uuid)', 'can_open_course(uuid)', 'lessons_are_protected()', 'mark_order_paid(uuid, text)',
    'join_organization(uuid, uuid)', 'organization_report(uuid)', 'user_id_by_email(text)'
  ] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
    execute format('grant execute on function public.%s to service_role', f);
  end loop;
end
$$;
-- The policy runs as the visitor.
grant execute on function public.can_open_course(uuid) to anon, authenticated;
