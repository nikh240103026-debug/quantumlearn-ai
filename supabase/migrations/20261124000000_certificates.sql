-- ============================================================================
-- Certificates.
--
-- Two kinds of certificate share the existing public.certificates ledger:
--   * 'course'     — Certificate of Completion: every published lesson of a
--                    course completed.
--   * 'assessment' — Certificate of Achievement: an assessment passed, graded
--                    on the server (the best passing score is printed).
--
-- Trust model:
--   * Learners can READ their own certificates and attempts, nothing more.
--   * Certificates and assessment attempts are written only by server code
--     using the service-role key, after it has checked eligibility itself.
--     (Any older policy that let users insert/update certificates is
--     removed below.)
--   * Admins (public.is_admin()) can manage every certificate, e.g. revoke
--     one by setting status = 'revoked'.
--   * Public verification (/verify/<token>) reads through server code, so
--     the table is never exposed to anonymous clients.
--
-- Safe to run more than once. Run in the Supabase SQL editor, or with
-- `supabase db push`.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. ASSESSMENT ATTEMPTS
--
-- Every graded submission is recorded by the server. A certificate of
-- achievement is issued only from a passed attempt stored here, never from
-- numbers sent by the browser.
-- ----------------------------------------------------------------------------

create table if not exists public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  assessment_id text not null,
  score integer not null,
  total_marks integer not null,
  percentage numeric(5, 2) not null,
  passed boolean not null,
  correct_answers integer not null default 0,
  wrong_answers integer not null default 0,
  skipped_answers integer not null default 0,
  -- Reported by the browser; informational only.
  duration_seconds integer,
  submitted_at timestamptz not null default now()
);

create index if not exists assessment_attempts_user_idx
  on public.assessment_attempts (user_id, assessment_id, submitted_at desc);

alter table public.assessment_attempts enable row level security;

drop policy if exists "assessment_attempts own select" on public.assessment_attempts;
create policy "assessment_attempts own select"
  on public.assessment_attempts for select
  using (user_id = auth.uid() or public.is_admin());

-- No insert/update/delete policies: only the service role writes attempts.


-- ----------------------------------------------------------------------------
-- 2. CERTIFICATES
-- ----------------------------------------------------------------------------

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid references public.courses (id) on delete set null,
  certificate_number text not null,
  verification_token text not null,
  status text not null default 'issued',
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.certificates add column if not exists kind text not null default 'course';
alter table public.certificates add column if not exists assessment_id text;
-- Snapshots taken at issue time, so a certificate never changes when a
-- course is renamed or a profile name is edited.
alter table public.certificates add column if not exists title text;
alter table public.certificates add column if not exists recipient_name text;
alter table public.certificates add column if not exists score numeric(5, 2);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'certificates_kind_check'
      and conrelid = 'public.certificates'::regclass
  ) then
    alter table public.certificates
      add constraint certificates_kind_check
      check (kind in ('course', 'assessment'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'certificates_status_check'
      and conrelid = 'public.certificates'::regclass
  ) then
    alter table public.certificates
      add constraint certificates_status_check
      check (status in ('issued', 'revoked'));
  end if;
end
$$;

create unique index if not exists certificates_number_key
  on public.certificates (certificate_number);

create unique index if not exists certificates_token_key
  on public.certificates (verification_token);

-- One certificate per learner per course / per assessment.
create unique index if not exists certificates_user_course_key
  on public.certificates (user_id, course_id)
  where kind = 'course' and course_id is not null;

create unique index if not exists certificates_user_assessment_key
  on public.certificates (user_id, assessment_id)
  where kind = 'assessment' and assessment_id is not null;

create index if not exists certificates_user_idx
  on public.certificates (user_id, issued_at desc);

-- Keep revoked_at / updated_at consistent whoever edits the row.
create or replace function public.certificates_touch()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  if new.status = 'revoked' and old.status is distinct from 'revoked' then
    new.revoked_at := coalesce(new.revoked_at, now());
  elsif new.status = 'issued' then
    new.revoked_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists certificates_touch on public.certificates;
create trigger certificates_touch
  before update on public.certificates
  for each row
  execute function public.certificates_touch();

alter table public.certificates enable row level security;

-- Replace every existing policy with the known set below, so no older
-- policy can still let a learner write their own certificate.
do $$
declare
  p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'certificates'
  loop
    execute format('drop policy %I on public.certificates', p.policyname);
  end loop;
end
$$;

create policy "certificates own select"
  on public.certificates for select
  using (user_id = auth.uid() or public.is_admin());

create policy "certificates admin insert"
  on public.certificates for insert
  with check (public.is_admin());

create policy "certificates admin update"
  on public.certificates for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "certificates admin delete"
  on public.certificates for delete
  using (public.is_admin());
