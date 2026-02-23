-- Day 20: Career Acceleration Blueprint
-- Week 4: Leadership & Career Acceleration

DELETE FROM curriculum_days WHERE program_id = '7da8d569-d5a3-47d8-9101-e8142b44822e' AND day_number = 20;

INSERT INTO curriculum_days (program_id, day_number, title, theme, day_objective, key_teaching_quote)
VALUES (
  '7da8d569-d5a3-47d8-9101-e8142b44822e',
  20,
  'Career Acceleration Blueprint',
  'Careers do not drift upward. They are engineered.',
  '["Synthesize all program learning into a personal career acceleration strategy", "Create a 90-day professional development plan", "Identify your unique competitive advantages in the AI-powered workplace", "Build a roadmap for continuous growth beyond this program"]'::jsonb,
  'Careers do not drift upward. They are engineered.'
);

DO $$
DECLARE
  v_day_id uuid;
  v_section_id uuid;
BEGIN
  SELECT id INTO v_day_id FROM curriculum_days
  WHERE program_id = '7da8d569-d5a3-47d8-9101-e8142b44822e' AND day_number = 20;

  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (v_day_id, 1, 'reality_briefing', 'Reality Mapping',
    '[{"text": "REPLACE WITH REALITY BRIEFING CONTENT", "type": "facilitator_script"}]'::jsonb
  );

  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (v_day_id, 2, 'workplace_scenario', 'Workplace Scenario',
    '[{"text": "REPLACE WITH WORKPLACE SCENARIO CONTENT", "type": "facilitator_script"}]'::jsonb
  );

  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (v_day_id, 3, 'decision_challenge', 'Decision Challenge',
    '[{"text": "REPLACE WITH DECISION CHALLENGE CONTENT", "type": "facilitator_script"}]'::jsonb
  ) RETURNING id INTO v_section_id;

  INSERT INTO curriculum_exercises (section_id, sort_order, question, question_type, options, thinking_prompts)
  VALUES
    (v_section_id, 1, 'REPLACE WITH MULTIPLE CHOICE QUESTION', 'multiple_choice',
     '[{"label": "A", "text": "Option A", "is_best": false}, {"label": "B", "text": "Option B", "is_best": true}, {"label": "C", "text": "Option C", "is_best": false}, {"label": "D", "text": "Option D", "is_best": false}]'::jsonb, NULL),
    (v_section_id, 2, 'REPLACE WITH OPEN-ENDED QUESTION', 'open_ended', NULL,
     '["thinking prompt 1", "thinking prompt 2", "thinking prompt 3"]'::jsonb),
    (v_section_id, 3, 'REPLACE WITH OPEN-ENDED QUESTION 2', 'open_ended', NULL,
     '["thinking prompt 1", "thinking prompt 2", "thinking prompt 3"]'::jsonb);

  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (v_day_id, 4, 'artifact_creation', 'Artifact Creation',
    '[{"text": "REPLACE WITH ARTIFACT CREATION CONTENT", "type": "facilitator_script"}]'::jsonb
  );

  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (v_day_id, 5, 'reflection', 'Reflection',
    '[{"text": "Take a moment to reflect on today''s lesson.", "type": "facilitator_script"}]'::jsonb
  ) RETURNING id INTO v_section_id;

  INSERT INTO curriculum_exercises (section_id, sort_order, question, question_type)
  VALUES
    (v_section_id, 1, 'REPLACE WITH REFLECTION QUESTION 1', 'reflection'),
    (v_section_id, 2, 'REPLACE WITH REFLECTION QUESTION 2', 'reflection');

  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (v_day_id, 6, 'professional_upgrade', 'Professional Upgrade',
    '[{"text": "REPLACE WITH PROFESSIONAL UPGRADE CONTENT", "type": "facilitator_script"}]'::jsonb
  );
END $$;
