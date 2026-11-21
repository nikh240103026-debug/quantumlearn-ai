-- ============================================================================
-- Protect profiles.role from self-assignment.
--
-- Signup used to send the chosen role ("tutor", or anything a crafted request
-- supplies, e.g. "admin") in the auth metadata, and the profile-creation
-- trigger can copy it into profiles.role. Role is what grants instructor and
-- admin access, so it must never come from the user.
--
-- After this migration:
--   * new profiles are always created as 'student';
--   * a role can only be changed by an admin (the admin Users page), the
--     service-role key, or a direct database session (SQL editor), which is
--     how you promote the first admin:
--       update public.profiles set role = 'admin' where id = '<user uuid>';
--
-- Safe to run more than once.
-- ============================================================================

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
    -- Direct database sessions (SQL editor, migrations).
    session_user = 'postgres'
    -- Server code using the service-role key.
    or coalesce(auth.role(), '') = 'service_role'
    -- A signed-in administrator.
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    );

  if tg_op = 'INSERT' then
    if not v_trusted then
      new.role := 'student';
    end if;
  elsif new.role is distinct from old.role and not v_trusted then
    -- Silently keep the old role (the rest of the update still applies).
    new.role := old.role;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;

create trigger protect_profile_role
  before insert or update of role on public.profiles
  for each row
  execute function public.protect_profile_role();
