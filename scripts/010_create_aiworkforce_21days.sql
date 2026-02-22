-- ============================================================
-- AIWorkforce_21days: 21-Day curriculum for AI Workforce Ready
-- ============================================================

CREATE TABLE IF NOT EXISTS "AIWorkforce_21days" (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_number    INTEGER NOT NULL UNIQUE CHECK (day_number BETWEEN 1 AND 21),

  -- Lesson metadata
  title         TEXT NOT NULL,
  theme         TEXT NOT NULL,
  day_objective TEXT NOT NULL,        -- paragraph describing what participants will achieve

  -- Lesson flow sections (stored as JSONB arrays)
  lesson_flow_steps   TEXT[] NOT NULL DEFAULT '{}',  -- ordered step names e.g. {"Reality Briefing","Mindset Disruption",...}

  -- Section content: each key = section name, value = content (markdown / rich text)
  sections      JSONB NOT NULL DEFAULT '{}',

  -- Scenario
  scenario_title   TEXT,
  scenario_body    TEXT,              -- the full scenario narrative

  -- Decision exercise (JSONB array of questions)
  decision_exercise JSONB NOT NULL DEFAULT '[]',

  -- Artifact / assignment
  artifact_title       TEXT,
  artifact_instructions TEXT,
  artifact_structure    TEXT[] DEFAULT '{}',   -- ordered structure items

  -- Key teaching drop (displayed on screen)
  key_teaching_drop TEXT,

  -- Behavior instilled (JSONB array of short strings)
  behaviors_instilled TEXT[] DEFAULT '{}',

  -- End-of-day outcomes (JSONB array)
  end_of_day_outcomes TEXT[] DEFAULT '{}',

  -- Facilitator close
  facilitator_close TEXT,

  -- Reflection prompts (JSONB array of prompt strings)
  reflection_prompts JSONB NOT NULL DEFAULT '[]',

  -- Navigation
  next_day_preview TEXT,              -- teaser for the following day

  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_aiworkforce_day ON "AIWorkforce_21days" (day_number);

-- ============================================================
-- Seed Day 1
-- ============================================================
INSERT INTO "AIWorkforce_21days" (
  day_number,
  title,
  theme,
  day_objective,
  lesson_flow_steps,
  sections,
  scenario_title,
  scenario_body,
  decision_exercise,
  artifact_title,
  artifact_instructions,
  artifact_structure,
  key_teaching_drop,
  behaviors_instilled,
  end_of_day_outcomes,
  facilitator_close,
  reflection_prompts,
  next_day_preview
) VALUES (
  1,
  'From Graduate to AI-Ready Professional',
  'You are not entering a traditional workplace. You are entering a human + AI operating environment. Your value will come from: judgment, accountability, clarity, speed of thinking. Not task completion.',
  'By the end of today, participants will: understand what has changed in the workforce, shift from "assignment mindset" to "ownership mindset", recognize where humans create value in AI-driven work, and begin operating like professionals, not students.',
  ARRAY['Reality Briefing', 'Mindset Disruption', 'Workplace Scenario', 'Decision Exercise', 'Artifact Creation', 'Reflection Upgrade'],
  '{
    "Reality Briefing": "You graduated into a different world than the one your professors prepared you for.\n\nAI writes reports. AI analyzes data. AI drafts strategies. AI answers questions instantly.\n\nSo the question is no longer: \"Can you produce work?\"\n\nThe question is: \"Can you think, decide, and take responsibility for the work AI produces?\"\n\nMost graduates are still preparing for: assignments, instructions, direction.\n\nEmployers are looking for: ownership, initiative, judgment.\n\nThis program trains that shift.",
    "Mindset Disruption": "You are not competing against AI.\n\nYou are competing against people who:\n- know how to use AI better\n- think faster\n- interpret better\n- communicate clearly\n- take ownership\n\nYour degree got you here.\nYour operating behavior determines whether you rise.",
    "Professional Upgrade": "AI produces the first draft.\n\nProfessionals:\n- interpret it\n- validate it\n- refine it\n- defend it\n\nThis is the difference between: entry-level employee vs future leader."
  }'::JSONB,
  'Your First Week on the Job',
  'You are a new analyst at a company using AI tools for daily work.\n\nYour manager says:\n"Use AI to draft a customer insights summary from last quarter''s feedback. Send me what you find."\n\nYou run the tool. It generates a polished report. Looks complete. Sounds smart.\n\nNow you must decide:\n- Do you forward it?\n- Do you edit it?\n- Do you validate it?\n- Do you question it?\n\nYou are accountable. Not the AI.',
  '[
    {
      "question": "What is your next step?",
      "options": ["Send it immediately", "Skim and forward", "Validate before sharing", "Rewrite completely"]
    },
    {
      "question": "What risks exist if you forward it untouched?",
      "prompts": ["incorrect insights?", "missing context?", "bias?", "outdated assumptions?"]
    },
    {
      "question": "What does a professional do differently from a student here?",
      "insight": "Students submit work. Professionals own outcomes."
    }
  ]'::JSONB,
  'Manager Review Note',
  'Write a "Manager Review Note." This trains: judgment, accountability, communication.',
  ARRAY['Summary of AI findings', 'Observations / concerns', 'What you verified', 'What needs clarification', 'Recommendation'],
  'Assignments end at graduation. Ownership begins at work.',
  ARRAY[
    'AI produces work',
    'Humans own consequences',
    'Speed without judgment is dangerous',
    'Communication builds trust',
    'Ownership is noticed immediately'
  ],
  ARRAY[
    'First decision artifact',
    'First professional communication example',
    'Awareness of accountability',
    'Shift from "submitter" to "operator" mindset'
  ],
  'You are no longer preparing for grades. You are preparing for responsibility. AI will produce work faster than you. Your career will depend on: what you question, what you improve, what you take ownership of.',
  '[
    "Where did you feel tempted to just send it?",
    "What responsibility did you assume today that a student would not?",
    "What does ownership look like in AI-enabled work?"
  ]'::JSONB,
  'You will learn how AI organizations actually function — and where humans matter most.'
)
ON CONFLICT (day_number) DO NOTHING;
