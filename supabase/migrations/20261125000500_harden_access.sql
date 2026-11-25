-- ============================================================================
-- Guardian approval, two-factor recovery codes, and database-level rules for
-- two-factor and suspended accounts. Safe to run more than once.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. GUARDIAN APPROVAL (server only)
-- ----------------------------------------------------------------------------
create table if not exists public.guardian_consents (
  user_id uuid primary key references auth.users (id) on delete cascade,
  guardian_name text check (char_length(guardian_name) <= 120),
  guardian_email text check (char_length(guardian_email) <= 254),
  token_hash text unique,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  sent_at timestamptz,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. TWO-FACTOR RECOVERY CODES (server only; only hashes are stored)
-- ----------------------------------------------------------------------------
create table if not exists public.mfa_recovery_codes (
  user_id uuid not null references auth.users (id) on delete cascade,
  code_hash text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, code_hash)
);

alter table public.guardian_consents enable row level security;
alter table public.mfa_recovery_codes enable row level security;
revoke all on public.guardian_consents, public.mfa_recovery_codes from anon, authenticated;
grant all on public.guardian_consents, public.mfa_recovery_codes to service_role;

-- ----------------------------------------------------------------------------
-- 3. ERRORS FROM THE MOBILE APP
-- ----------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.app_errors') is not null then
    alter table public.app_errors drop constraint if exists app_errors_source_check;
    alter table public.app_errors
      add constraint app_errors_source_check check (source in ('client', 'server', 'mobile'));
  end if;
end
$$;

-- ----------------------------------------------------------------------------
-- 4. ADMINS WITH TWO-FACTOR MUST HAVE USED IT, IN THE DATABASE TOO
--
-- The existing is_admin() is copied to is_admin_base() once, unchanged, and
-- is_admin() then adds the two-factor condition. Replacing it in place keeps
-- every policy that already uses it.
-- ----------------------------------------------------------------------------
create or replace function public.second_factor_ok()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
      or not exists (
        select 1
        from auth.mfa_factors f
        where f.user_id = auth.uid()
          and f.status::text = 'verified'
      );
$$;

do $$
declare
  v_def text;
begin
  if to_regprocedure('public.is_admin_base()') is null then
    if to_regprocedure('public.is_admin()') is null then
      raise exception 'public.is_admin() was not found; nothing was changed.';
    end if;

    v_def := pg_get_functiondef('public.is_admin()'::regprocedure);
    if position('FUNCTION public.is_admin()' in v_def) = 0 then
      raise exception 'public.is_admin() has an unexpected definition; nothing was changed.';
    end if;

    execute replace(v_def, 'FUNCTION public.is_admin()', 'FUNCTION public.is_admin_base()');
  end if;
end
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.is_admin_base(), false) and public.second_factor_ok();
$$;

-- Same rule for changing roles (see 20261122000100_protect_profile_role.sql).
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trusted boolean;
begin
  v_trusted :=
    session_user = 'postgres'
    or coalesce(auth.role(), '') = 'service_role'
    or (
      exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
      )
      and public.second_factor_ok()
    );

  if tg_op = 'INSERT' then
    if not v_trusted then
      new.role := 'student';
    end if;
  elsif new.role is distinct from old.role and not v_trusted then
    new.role := old.role;
  end if;

  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 5. SUSPENDED USERS LOSE DATABASE ACCESS AT ONCE
--
-- A RESTRICTIVE policy is ANDed with the existing ones, so it can only take
-- access away. It is added to every public table that uses row security.
-- ----------------------------------------------------------------------------
create or replace function public.account_active()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1
    from auth.users u
    where u.id = auth.uid()
      and u.banned_until > now()
  );
$$;

revoke all on function public.account_active() from public;
grant execute on function public.account_active() to anon, authenticated, service_role;
revoke all on function public.second_factor_ok() from public;
grant execute on function public.second_factor_ok() to anon, authenticated, service_role;

do $$
declare
  t record;
begin
  for t in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      and c.relrowsecurity
      and pg_get_userbyid(c.relowner) = current_user
  loop
    execute format('drop policy if exists "Suspended accounts blocked" on public.%I', t.relname);
    execute format(
      'create policy "Suspended accounts blocked" on public.%I
         as restrictive for all to authenticated
         using ((select public.account_active()))
         with check ((select public.account_active()))',
      t.relname
    );
  end loop;
end
$$;
