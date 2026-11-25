-- ============================================================================
-- Lesson quiz results, topic scores, lesson translations and tutor accuracy.
-- All server only (service role). Safe to run more than once.
-- ============================================================================

create table if not exists public.lesson_quiz_results (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  correct smallint not null,
  total smallint not null,
  best_correct smallint not null,
  attempts integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- { "Topic": [correct, total] } for each attempt, used by the progress report.
alter table public.assessment_attempts add column if not exists topic_results jsonb;

-- Machine translations, cached per section. source_hash changes when the
-- English text does, so an old translation is never shown for new text.
create table if not exists public.lesson_translations (
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  language text not null check (char_length(language) <= 8),
  source_hash text not null,
  body text not null,
  created_at timestamptz not null default now(),
  primary key (lesson_id, language, source_hash)
);

create table if not exists public.tutor_accuracy_results (
  run_id uuid not null,
  question_id text not null,
  model text not null,
  correct boolean not null,
  reply text not null,
  created_at timestamptz not null default now(),
  primary key (run_id, question_id)
);

do $$
declare
  t text;
begin
  foreach t in array array['lesson_quiz_results', 'lesson_translations', 'tutor_accuracy_results'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end
$$;
