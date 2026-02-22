-- =====================================================
-- WORKFORCE PLATFORM: COMPLETE SCHEMA
-- Creates all tables from scratch including the new
-- curriculum schema (replaces workforce_mindset_21day)
-- =====================================================

-- =====================================================
-- 1. PROFILES
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. PROGRAMS
-- =====================================================
CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  short_description text,
  long_description text,
  audience text,
  duration text,
  color text DEFAULT '#00c892',
  badge text,
  leaders jsonb,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Programs are publicly readable"
  ON programs FOR SELECT
  USING (true);

-- =====================================================
-- 3. PROGRAM FEATURES
-- =====================================================
CREATE TABLE IF NOT EXISTS program_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  icon text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE program_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Program features are publicly readable"
  ON program_features FOR SELECT
  USING (true);

-- =====================================================
-- 4. PROGRAM PHASES
-- =====================================================
CREATE TABLE IF NOT EXISTS program_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  day_range text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE program_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Program phases are publicly readable"
  ON program_phases FOR SELECT
  USING (true);

-- =====================================================
-- 5. PROGRAM PRICING
-- =====================================================
CREATE TABLE IF NOT EXISTS program_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  plan_tier text NOT NULL,
  price_cents integer,
  currency text DEFAULT 'usd',
  label text,
  description text,
  features jsonb,
  is_popular boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE program_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Program pricing is publicly readable"
  ON program_pricing FOR SELECT
  USING (true);

-- =====================================================
-- 6. SUBSCRIPTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  plan_tier text NOT NULL DEFAULT 'individual',
  status text NOT NULL DEFAULT 'active',
  amount_cents integer,
  currency text DEFAULT 'usd',
  interval text DEFAULT 'one_time',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 7. ENROLLMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  current_day integer DEFAULT 1,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, program_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enrollments"
  ON enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own enrollments"
  ON enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollments"
  ON enrollments FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 8. USER STREAKS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(enrollment_id)
);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks"
  ON user_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON user_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON user_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 9. USER DAY PROGRESS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_day_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(enrollment_id, day_number)
);

ALTER TABLE user_day_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own day progress"
  ON user_day_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own day progress"
  ON user_day_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own day progress"
  ON user_day_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 10. CURRICULUM DAYS (replaces workforce_mindset_21day)
-- =====================================================
CREATE TABLE IF NOT EXISTS curriculum_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
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

ALTER TABLE curriculum_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Curriculum days are publicly readable"
  ON curriculum_days FOR SELECT
  USING (true);

-- =====================================================
-- 11. CURRICULUM SECTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS curriculum_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id uuid NOT NULL REFERENCES curriculum_days(id) ON DELETE CASCADE,
  sort_order integer NOT NULL,
  section_type text NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE curriculum_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Curriculum sections are publicly readable"
  ON curriculum_sections FOR SELECT
  USING (true);

-- =====================================================
-- 12. CURRICULUM EXERCISES
-- =====================================================
CREATE TABLE IF NOT EXISTS curriculum_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES curriculum_sections(id) ON DELETE CASCADE,
  sort_order integer NOT NULL,
  question text NOT NULL,
  question_type text NOT NULL DEFAULT 'multiple_choice',
  options jsonb,
  thinking_prompts jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE curriculum_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Curriculum exercises are publicly readable"
  ON curriculum_exercises FOR SELECT
  USING (true);

-- =====================================================
-- 13. USER ACTIONS (exercise-level tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  action_index integer NOT NULL,
  exercise_id uuid REFERENCES curriculum_exercises(id) ON DELETE SET NULL,
  completed boolean DEFAULT false,
  response jsonb,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(enrollment_id, day_number, action_index)
);

ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own actions"
  ON user_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own actions"
  ON user_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own actions"
  ON user_actions FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 14. USER SECTION PROGRESS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_section_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  section_id uuid NOT NULL REFERENCES curriculum_sections(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(enrollment_id, section_id)
);

ALTER TABLE user_section_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own section progress"
  ON user_section_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own section progress"
  ON user_section_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own section progress"
  ON user_section_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_enrollments_user_program ON enrollments(user_id, program_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_program ON subscriptions(user_id, program_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_days_program ON curriculum_days(program_id, day_number);
CREATE INDEX IF NOT EXISTS idx_curriculum_sections_day ON curriculum_sections(day_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_curriculum_exercises_section ON curriculum_exercises(section_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_user_actions_enrollment ON user_actions(enrollment_id, day_number);
CREATE INDEX IF NOT EXISTS idx_user_section_progress_enrollment ON user_section_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_user_day_progress_enrollment ON user_day_progress(enrollment_id, day_number);
