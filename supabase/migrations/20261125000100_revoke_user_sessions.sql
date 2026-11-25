-- ============================================================================
-- Sign a suspended user out of every device at once.
--
-- Suspending (a Supabase Auth ban) stops new sign-ins and token refreshes, but
-- an already issued access token keeps working until it expires. Deleting the
-- sessions makes auth.getUser() reject that token straight away.
--
-- Only the server (service role) may call it. Safe to run more than once.
-- ============================================================================

create or replace function public.revoke_user_sessions(p_user_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.sessions where user_id = p_user_id;
$$;

revoke all on function public.revoke_user_sessions(uuid)
  from public, anon, authenticated;
grant execute on function public.revoke_user_sessions(uuid) to service_role;
