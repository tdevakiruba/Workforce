-- Rename all public tables to add "wf-" prefix
-- Table names with hyphens require double-quoting in PostgreSQL

ALTER TABLE IF EXISTS public.bookings RENAME TO "wf-bookings";
ALTER TABLE IF EXISTS public.categories RENAME TO "wf-categories";
ALTER TABLE IF EXISTS public.enrollments RENAME TO "wf-enrollments";
ALTER TABLE IF EXISTS public.expenses RENAME TO "wf-expenses";
ALTER TABLE IF EXISTS public.financials RENAME TO "wf-financials";
ALTER TABLE IF EXISTS public.lab_submissions RENAME TO "wf-lab_submissions";
ALTER TABLE IF EXISTS public.office_hours RENAME TO "wf-office_hours";
ALTER TABLE IF EXISTS public.payment_schedule RENAME TO "wf-payment_schedule";
ALTER TABLE IF EXISTS public.profiles RENAME TO "wf-profiles";
ALTER TABLE IF EXISTS public.program_features RENAME TO "wf-program_features";
ALTER TABLE IF EXISTS public.program_phases RENAME TO "wf-program_phases";
ALTER TABLE IF EXISTS public.program_pricing RENAME TO "wf-program_pricing";
ALTER TABLE IF EXISTS public.programs RENAME TO "wf-programs";
ALTER TABLE IF EXISTS public.subscriptions RENAME TO "wf-subscriptions";
ALTER TABLE IF EXISTS public.user_actions RENAME TO "wf-user_actions";
ALTER TABLE IF EXISTS public.user_day_progress RENAME TO "wf-user_day_progress";
ALTER TABLE IF EXISTS public.user_streaks RENAME TO "wf-user_streaks";
ALTER TABLE IF EXISTS public.workforce_mindset_21day RENAME TO "wf-workforce_mindset_21day";
ALTER TABLE IF EXISTS public."Copyworkforce_mindset_21day_duplicate" RENAME TO "wf-Copyworkforce_mindset_21day_duplicate";
