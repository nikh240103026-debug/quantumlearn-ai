-- ============================================================================
-- Error monitoring: one row per distinct error, with a running count.
--
-- Written only by the server (service role) through record_app_error();
-- read only by the admin Errors page. Safe to run more than once.
-- ============================================================================

create table if not exists public.app_errors (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null unique,
  source text not null check (source in ('client', 'server')),
  message text not null,
  stack text,
  path text,
  digest text,
  user_agent text,
  occurrences bigint not null default 1,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists app_errors_last_seen_idx
  on public.app_errors (last_seen desc);

-- RLS on with no policies: anon and signed-in users can't touch the table.
alter table public.app_errors enable row level security;
revoke all on public.app_errors from anon, authenticated;
grant select, update, delete on public.app_errors to service_role;

create or replace function public.record_app_error(
  p_fingerprint text,
  p_source text,
  p_message text,
  p_stack text,
  p_path text,
  p_digest text,
  p_user_agent text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.app_errors
  set occurrences = occurrences + 1,
      last_seen = now(),
      path = p_path,
      digest = p_digest,
      user_agent = p_user_agent,
      -- It happened again, so it isn't fixed.
      resolved_at = null
  where fingerprint = p_fingerprint;

  if found then
    return;
  end if;

  -- Drop errors not seen for 90 days, and cap the table so a flood of
  -- made-up reports can't fill the database.
  delete from public.app_errors where last_seen < now() - interval '90 days';

  if (select count(*) from public.app_errors) >= 2000 then
    return;
  end if;

  insert into public.app_errors
    (fingerprint, source, message, stack, path, digest, user_agent)
  values
    (p_fingerprint, p_source, p_message, p_stack, p_path, p_digest, p_user_agent)
  on conflict (fingerprint) do update
    set occurrences = public.app_errors.occurrences + 1,
        last_seen = now(),
        resolved_at = null;
end;
$$;

revoke all on function public.record_app_error(text, text, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.record_app_error(text, text, text, text, text, text, text)
  to service_role;
