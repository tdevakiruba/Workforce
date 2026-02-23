-- DAY 5: Skill, Adaptability, and Learning Velocity
DELETE FROM curriculum_days WHERE program_id = '7da8d569-d5a3-47d8-9101-e8142b44822e' AND day_number = 5;

INSERT INTO curriculum_days (program_id, day_number, title, theme, day_objective)
VALUES (
  '7da8d569-d5a3-47d8-9101-e8142b44822e',
  5,
  'Skill, Adaptability, and Learning Velocity',
  'Your degree got you here. Your adaptability determines how far you go.',
  'Today you will design a personal growth operating system that prioritizes learning velocity over static credentials.'
);

DO $$
DECLARE
  v_day_id uuid;
  v_section_id uuid;
BEGIN
  SELECT id INTO v_day_id FROM curriculum_days
  WHERE program_id = '7da8d569-d5a3-47d8-9101-e8142b44822e' AND day_number = 5;

  -- Section 1: Reality Mapping
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (
    v_day_id, 1, 'reality_briefing', 'Reality Mapping',
    '[{"text": "AI evolves continuously. Workflows shift rapidly. Industries transform quickly. Skills expire faster.", "type": "facilitator_script"}, {"text": "But: Adaptability creates relevance. Learning velocity creates opportunity. Momentum creates leadership.", "type": "callout"}]'::jsonb
  );

  -- Section 2: Workplace Scenario
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (
    v_day_id, 2, 'workplace_scenario', 'Workplace Scenario',
    '[{"text": "Two new hires join a company using advanced AI platforms.", "type": "facilitator_script"}, {"text": "Hire A relies heavily on past education and waits for formal training before exploring new tools.", "type": "facilitator_script"}, {"text": "Hire B experiments with tools weekly, studies workflow patterns, asks strategic questions, and actively seeks improvement opportunities.", "type": "facilitator_script"}, {"text": "Six months later, Hire B is entrusted with more responsibility.", "type": "facilitator_script"}, {"text": "Because adaptability signals future leadership.", "type": "callout"}]'::jsonb
  );

  -- Section 3: Decision Challenge
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (
    v_day_id, 3, 'decision_challenge', 'Decision Challenge',
    '[{"text": "What daily habits increase learning velocity? What behaviors signal stagnation? Are you building skills or defending credentials?", "type": "facilitator_script"}]'::jsonb
  )
  RETURNING id INTO v_section_id;

  INSERT INTO curriculum_exercises (section_id, sort_order, question, question_type, options, thinking_prompts)
  VALUES
    (v_section_id, 1, 'Which behavior best signals future leadership potential in an AI-powered workplace?', 'multiple_choice',
     '[{"label": "A", "text": "Waiting for formal training programs", "is_best": false}, {"label": "B", "text": "Relying on your degree credentials", "is_best": false}, {"label": "C", "text": "Proactively experimenting with tools and seeking improvement opportunities", "is_best": true}, {"label": "D", "text": "Focusing only on your assigned tasks", "is_best": false}]'::jsonb,
     NULL),
    (v_section_id, 2, 'What daily habits would increase your learning velocity?', 'open_ended', NULL,
     '["tool exploration?", "workflow study?", "strategic questions?", "peer learning?"]'::jsonb),
    (v_section_id, 3, 'Are you currently building new skills or defending existing credentials?', 'open_ended', NULL,
     '["growth mindset?", "comfort zone?", "experimentation?", "feedback seeking?"]'::jsonb);

  -- Section 4: Artifact Creation
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (
    v_day_id, 4, 'artifact_creation', 'Artifact Creation: Learning Velocity Plan',
    '[{"text": "Write a \"Learning Velocity Plan.\"", "type": "facilitator_script"}, {"text": "In full sentences, describe: The AI tools you must master. The business knowledge you must deepen. The weekly habits you will adopt. The monthly stretch challenge you will pursue.", "type": "facilitator_script"}, {"text": "This is not optional. It is your survival strategy.", "type": "callout"}]'::jsonb
  );

  -- Section 5: Reflection
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (
    v_day_id, 5, 'reflection', 'Reflection',
    '[{"text": "Take a moment to reflect on today''s lesson.", "type": "facilitator_script"}]'::jsonb
  )
  RETURNING id INTO v_section_id;

  INSERT INTO curriculum_exercises (section_id, sort_order, question, question_type)
  VALUES
    (v_section_id, 1, 'Are you upgrading yourself at the pace the industry is evolving?', 'reflection');

  -- Section 6: Professional Upgrade
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (
    v_day_id, 6, 'professional_upgrade', 'Professional Upgrade',
    '[{"text": "Careers in the AI era reward momentum.", "type": "facilitator_script"}, {"text": "High performers do not wait to be trained. They train themselves continuously.", "type": "callout"}]'::jsonb
  );

END $$;
