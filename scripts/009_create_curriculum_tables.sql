-- =====================================================
-- Create curriculum tables with wf- prefix
-- These tables replace the old workforce_mindset_21day
-- =====================================================

-- 1. CURRICULUM DAYS
CREATE TABLE IF NOT EXISTS "wf-curriculum_days" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES "wf-programs"(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  title text NOT NULL,
  theme text,
  day_objective jsonb,
  lesson_flow jsonb,
  key_teaching_quote text,
  behaviors_instilled jsonb,
  end_of_day_outcomes jsonb,
  facilitator_close jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(program_id, day_number)
);

ALTER TABLE "wf-curriculum_days" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'wf-curriculum_days' AND policyname = 'Curriculum days are publicly readable'
  ) THEN
    CREATE POLICY "Curriculum days are publicly readable"
      ON "wf-curriculum_days" FOR SELECT USING (true);
  END IF;
END $$;

-- 2. CURRICULUM SECTIONS
CREATE TABLE IF NOT EXISTS "wf-curriculum_sections" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id uuid NOT NULL REFERENCES "wf-curriculum_days"(id) ON DELETE CASCADE,
  sort_order integer NOT NULL,
  section_type text NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE "wf-curriculum_sections" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'wf-curriculum_sections' AND policyname = 'Curriculum sections are publicly readable'
  ) THEN
    CREATE POLICY "Curriculum sections are publicly readable"
      ON "wf-curriculum_sections" FOR SELECT USING (true);
  END IF;
END $$;

-- 3. CURRICULUM EXERCISES
CREATE TABLE IF NOT EXISTS "wf-curriculum_exercises" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES "wf-curriculum_sections"(id) ON DELETE CASCADE,
  sort_order integer NOT NULL,
  question text NOT NULL,
  question_type text NOT NULL DEFAULT 'multiple_choice',
  options jsonb,
  thinking_prompts jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE "wf-curriculum_exercises" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'wf-curriculum_exercises' AND policyname = 'Curriculum exercises are publicly readable'
  ) THEN
    CREATE POLICY "Curriculum exercises are publicly readable"
      ON "wf-curriculum_exercises" FOR SELECT USING (true);
  END IF;
END $$;

-- 4. USER SECTION PROGRESS
CREATE TABLE IF NOT EXISTS "wf-user_section_progress" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES "wf-enrollments"(id) ON DELETE CASCADE,
  section_id uuid NOT NULL REFERENCES "wf-curriculum_sections"(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(enrollment_id, section_id)
);

ALTER TABLE "wf-user_section_progress" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'wf-user_section_progress' AND policyname = 'Users can view own section progress'
  ) THEN
    CREATE POLICY "Users can view own section progress"
      ON "wf-user_section_progress" FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'wf-user_section_progress' AND policyname = 'Users can insert own section progress'
  ) THEN
    CREATE POLICY "Users can insert own section progress"
      ON "wf-user_section_progress" FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'wf-user_section_progress' AND policyname = 'Users can update own section progress'
  ) THEN
    CREATE POLICY "Users can update own section progress"
      ON "wf-user_section_progress" FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 5. USER EXERCISE RESPONSES
CREATE TABLE IF NOT EXISTS "wf-user_exercise_responses" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES "wf-enrollments"(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES "wf-curriculum_exercises"(id) ON DELETE SET NULL,
  section_id uuid REFERENCES "wf-curriculum_sections"(id) ON DELETE SET NULL,
  day_number integer NOT NULL,
  response_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(enrollment_id, exercise_id)
);

ALTER TABLE "wf-user_exercise_responses" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'wf-user_exercise_responses' AND policyname = 'Users can view own responses'
  ) THEN
    CREATE POLICY "Users can view own responses"
      ON "wf-user_exercise_responses" FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'wf-user_exercise_responses' AND policyname = 'Users can insert own responses'
  ) THEN
    CREATE POLICY "Users can insert own responses"
      ON "wf-user_exercise_responses" FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'wf-user_exercise_responses' AND policyname = 'Users can update own responses'
  ) THEN
    CREATE POLICY "Users can update own responses"
      ON "wf-user_exercise_responses" FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_wf_curriculum_days_program ON "wf-curriculum_days"(program_id, day_number);
CREATE INDEX IF NOT EXISTS idx_wf_curriculum_sections_day ON "wf-curriculum_sections"(day_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_wf_curriculum_exercises_section ON "wf-curriculum_exercises"(section_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_wf_user_section_progress_enrollment ON "wf-user_section_progress"(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_wf_user_exercise_responses_enrollment ON "wf-user_exercise_responses"(enrollment_id);
