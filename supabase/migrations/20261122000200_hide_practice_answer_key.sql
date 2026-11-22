-- Hide the practice answer key from the public API keys.
--
-- Before: anyone with the public (anon/publishable) key could read
-- practice_questions.correct_answer and .explanation directly from the
-- REST API, i.e. every answer without taking the quiz.
--
-- After: anon and authenticated can read every column EXCEPT
-- correct_answer and explanation. The website reads those only on the
-- server with the service-role client (/api/practice/check,
-- /api/practice/result, admin question editor), after its own checks.
--
-- Deploy the website code that uses the service-role client BEFORE
-- running this, or answer checking/grading will fail until it is live.
--
-- Note: column grants are explicit. A column added to this table later
-- is NOT readable by anon/authenticated until it is added to the GRANT.

begin;

revoke select on table public.practice_questions from anon, authenticated;

grant select (
  id,
  chapter_number,
  chapter_slug,
  chapter_title,
  topic,
  difficulty,
  question,
  options,
  created_at,
  updated_at,
  status
) on table public.practice_questions to anon, authenticated;

commit;

-- Check (should list the columns above, without the answer key):
--   select grantee, column_name
--   from information_schema.column_privileges
--   where table_schema = 'public' and table_name = 'practice_questions'
--     and privilege_type = 'SELECT' and grantee in ('anon', 'authenticated')
--   order by grantee, column_name;
