-- ============================================================================
-- 18 and over, legal notices, closed-account records, complaint tickets.
-- Safe to run more than once. Needs 20261128000000.
-- ============================================================================

-- A learner can't raise a refused age or clear a known one. Support can.
create or replace function public.protect_profile_age()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('authenticated', 'anon') then
    if new.age is null and old.age is not null then
      new.age := old.age;
    elsif new.age < 18 and new.age is distinct from old.age then
      raise exception 'You must be 18 or older.' using errcode = '23514';
    elsif old.age < 18 and new.age is distinct from old.age then
      raise exception 'Please contact support to change your age.' using errcode = '42501';
    end if;
  end if;
  return new;
end
$$;

drop trigger if exists protect_profile_age on public.profiles;
create trigger protect_profile_age
  before update of age on public.profiles
  for each row execute function public.protect_profile_age();

-- Which documents each learner was told about, and the last rules reminder.
create table if not exists public.policy_notices (
  user_id uuid primary key references auth.users (id) on delete cascade,
  version text not null,
  reminded_at timestamptz not null default now()
);

-- India's IT Intermediary Rules 3(1)(h): registration details are kept for 180
-- days after an account closes. No link to auth.users, which is gone by then.
create table if not exists public.closed_accounts (
  user_id uuid primary key,
  email text,
  full_name text,
  registered_at timestamptz,
  closed_at timestamptz not null default now()
);

do $$
declare
  t text;
begin
  foreach t in array array['policy_notices', 'closed_accounts'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end
$$;

-- 'updated' when the documents changed, 'rules' every 90 days, otherwise null.
-- Also removes expired records, so this needs no scheduled job.
create or replace function public.take_policy_notice(p_user_id uuid, p_version text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  n policy_notices;
begin
  delete from closed_accounts where closed_at < now() - interval '180 days';
  delete from lti_launches where expires_at < now();

  select * into n from policy_notices where user_id = p_user_id for update;
  if n.user_id is null then
    insert into policy_notices (user_id, version) values (p_user_id, p_version) on conflict do nothing;
    -- New accounts accepted the current version at signup.
    if not found or exists (select 1 from auth.users where id = p_user_id and created_at > now() - interval '1 day') then
      return null;
    end if;
    return 'updated';
  end if;

  if n.version <> p_version then
    update policy_notices set version = p_version, reminded_at = now() where user_id = p_user_id;
    return 'updated';
  end if;
  if n.reminded_at < now() - interval '90 days' then
    update policy_notices set reminded_at = now() where user_id = p_user_id;
    return 'rules';
  end if;
  return null;
end
$$;
revoke all on function public.take_policy_notice(uuid, text) from public, anon, authenticated;
grant execute on function public.take_policy_notice(uuid, text) to service_role;

alter table public.support_tickets drop constraint if exists support_tickets_category_check;
alter table public.support_tickets add constraint support_tickets_category_check
  check (category in ('account', 'learning', 'payment', 'certificate', 'technical', 'grievance', 'privacy', 'other'));

-- The second lesson begins with the first lesson's title.
update public.lessons
set content = regexp_replace(content, '^(\s*)# Lesson 1: What Is Quantum Computing\?', '\1# Classical Bits vs Qubits')
where slug = 'classical-bits-vs-qubits'
  and content ~ '^\s*# Lesson 1: What Is Quantum Computing\?';
