-- Enable RLS and create comprehensive policies for all wf- tables

-- ===========================
-- wf-programs (public read)
-- ===========================
ALTER TABLE "wf-programs" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Programs are publicly readable" ON "wf-programs";
CREATE POLICY "Programs are publicly readable" ON "wf-programs"
  FOR SELECT USING (true);

-- ===========================
-- wf-program_phases (public read)
-- ===========================
ALTER TABLE "wf-program_phases" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Program phases are publicly readable" ON "wf-program_phases";
CREATE POLICY "Program phases are publicly readable" ON "wf-program_phases"
  FOR SELECT USING (true);

-- ===========================
-- wf-program_features (public read)
-- ===========================
ALTER TABLE "wf-program_features" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Program features are publicly readable" ON "wf-program_features";
CREATE POLICY "Program features are publicly readable" ON "wf-program_features"
  FOR SELECT USING (true);

-- ===========================
-- wf-program_pricing (public read)
-- ===========================
ALTER TABLE "wf-program_pricing" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Program pricing is publicly readable" ON "wf-program_pricing";
CREATE POLICY "Program pricing is publicly readable" ON "wf-program_pricing"
  FOR SELECT USING (true);

-- ===========================
-- wf-curriculum_days (public read)
-- ===========================
ALTER TABLE "wf-curriculum_days" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Curriculum days are publicly readable" ON "wf-curriculum_days";
CREATE POLICY "Curriculum days are publicly readable" ON "wf-curriculum_days"
  FOR SELECT USING (true);

-- ===========================
-- wf-curriculum_sections (public read)
-- ===========================
ALTER TABLE "wf-curriculum_sections" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Curriculum sections are publicly readable" ON "wf-curriculum_sections";
CREATE POLICY "Curriculum sections are publicly readable" ON "wf-curriculum_sections"
  FOR SELECT USING (true);

-- ===========================
-- wf-curriculum_exercises (public read)
-- ===========================
ALTER TABLE "wf-curriculum_exercises" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Curriculum exercises are publicly readable" ON "wf-curriculum_exercises";
CREATE POLICY "Curriculum exercises are publicly readable" ON "wf-curriculum_exercises"
  FOR SELECT USING (true);

-- ===========================
-- wf-profiles (user owns data)
-- ===========================
ALTER TABLE "wf-profiles" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON "wf-profiles";
DROP POLICY IF EXISTS "Users can update own profile" ON "wf-profiles";
DROP POLICY IF EXISTS "Users can insert own profile" ON "wf-profiles";
DROP POLICY IF EXISTS "Users can delete own profile" ON "wf-profiles";

CREATE POLICY "Users can view own profile" ON "wf-profiles"
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON "wf-profiles"
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON "wf-profiles"
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON "wf-profiles"
  FOR DELETE USING (auth.uid() = id);

-- ===========================
-- wf-subscriptions (user owns data)
-- ===========================
ALTER TABLE "wf-subscriptions" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON "wf-subscriptions";
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON "wf-subscriptions";
DROP POLICY IF EXISTS "Users can update own subscriptions" ON "wf-subscriptions";

CREATE POLICY "Users can view own subscriptions" ON "wf-subscriptions"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON "wf-subscriptions"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON "wf-subscriptions"
  FOR UPDATE USING (auth.uid() = user_id);

-- ===========================
-- wf-enrollments (user owns data)
-- ===========================
ALTER TABLE "wf-enrollments" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own enrollments" ON "wf-enrollments";
DROP POLICY IF EXISTS "Users can insert own enrollments" ON "wf-enrollments";
DROP POLICY IF EXISTS "Users can update own enrollments" ON "wf-enrollments";

CREATE POLICY "Users can view own enrollments" ON "wf-enrollments"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own enrollments" ON "wf-enrollments"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollments" ON "wf-enrollments"
  FOR UPDATE USING (auth.uid() = user_id);

-- ===========================
-- wf-user_day_progress (user owns data)
-- ===========================
ALTER TABLE "wf-user_day_progress" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own day progress" ON "wf-user_day_progress";
DROP POLICY IF EXISTS "Users can insert own day progress" ON "wf-user_day_progress";
DROP POLICY IF EXISTS "Users can update own day progress" ON "wf-user_day_progress";

CREATE POLICY "Users can view own day progress" ON "wf-user_day_progress"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own day progress" ON "wf-user_day_progress"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own day progress" ON "wf-user_day_progress"
  FOR UPDATE USING (auth.uid() = user_id);

-- ===========================
-- wf-user_section_progress (user owns data)
-- ===========================
ALTER TABLE "wf-user_section_progress" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own section progress" ON "wf-user_section_progress";
DROP POLICY IF EXISTS "Users can insert own section progress" ON "wf-user_section_progress";
DROP POLICY IF EXISTS "Users can update own section progress" ON "wf-user_section_progress";

CREATE POLICY "Users can view own section progress" ON "wf-user_section_progress"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own section progress" ON "wf-user_section_progress"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own section progress" ON "wf-user_section_progress"
  FOR UPDATE USING (auth.uid() = user_id);

-- ===========================
-- wf-user_exercise_responses (user owns data)
-- ===========================
ALTER TABLE "wf-user_exercise_responses" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own responses" ON "wf-user_exercise_responses";
DROP POLICY IF EXISTS "Users can insert own responses" ON "wf-user_exercise_responses";
DROP POLICY IF EXISTS "Users can update own responses" ON "wf-user_exercise_responses";

CREATE POLICY "Users can read own responses" ON "wf-user_exercise_responses"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own responses" ON "wf-user_exercise_responses"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own responses" ON "wf-user_exercise_responses"
  FOR UPDATE USING (auth.uid() = user_id);

-- ===========================
-- wf-user_actions (user owns data)
-- ===========================
ALTER TABLE "wf-user_actions" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own actions" ON "wf-user_actions";
DROP POLICY IF EXISTS "Users can insert own actions" ON "wf-user_actions";
DROP POLICY IF EXISTS "Users can update own actions" ON "wf-user_actions";

CREATE POLICY "Users can view own actions" ON "wf-user_actions"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own actions" ON "wf-user_actions"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own actions" ON "wf-user_actions"
  FOR UPDATE USING (auth.uid() = user_id);

-- ===========================
-- wf-user_streaks (user owns data)
-- ===========================
ALTER TABLE "wf-user_streaks" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own streaks" ON "wf-user_streaks";
DROP POLICY IF EXISTS "Users can insert own streaks" ON "wf-user_streaks";
DROP POLICY IF EXISTS "Users can update own streaks" ON "wf-user_streaks";

CREATE POLICY "Users can view own streaks" ON "wf-user_streaks"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON "wf-user_streaks"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON "wf-user_streaks"
  FOR UPDATE USING (auth.uid() = user_id);

-- ===========================
-- wf-lab_submissions (user owns data)
-- ===========================
ALTER TABLE "wf-lab_submissions" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert own submissions" ON "wf-lab_submissions";
DROP POLICY IF EXISTS "Users can view own submissions" ON "wf-lab_submissions";
DROP POLICY IF EXISTS "Users can update own submissions" ON "wf-lab_submissions";
DROP POLICY IF EXISTS "Admins can review submissions" ON "wf-lab_submissions";

CREATE POLICY "Users can insert own submissions" ON "wf-lab_submissions"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own submissions" ON "wf-lab_submissions"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions" ON "wf-lab_submissions"
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view and review all submissions
CREATE POLICY "Admins can review submissions" ON "wf-lab_submissions"
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- ===========================
-- wf-office_hours (authenticated read)
-- ===========================
ALTER TABLE "wf-office_hours" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view office hours" ON "wf-office_hours";

CREATE POLICY "Authenticated users can view office hours" ON "wf-office_hours"
  FOR SELECT USING (auth.role() = 'authenticated');

-- Optional: Allow program managers to manage office hours
ALTER TABLE "wf-office_hours" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Program managers can manage office hours" ON "wf-office_hours";

CREATE POLICY "Program managers can manage office hours" ON "wf-office_hours"
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );
