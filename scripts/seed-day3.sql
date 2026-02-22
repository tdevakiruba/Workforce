-- DAY 3: Human Advantage in an Automated World
DELETE FROM curriculum_days WHERE program_id = '7da8d569-d5a3-47d8-9101-e8142b44822e' AND day_number = 3;

INSERT INTO curriculum_days (program_id, day_number, title, theme, day_objective)
VALUES (
  '7da8d569-d5a3-47d8-9101-e8142b44822e',
  3,
  'Human Advantage in an Automated World',
  'Automation increases the need for human clarity, not the opposite.',
  'By the end of today, you will clearly understand what humans uniquely contribute in AI-enabled workplaces and why judgment, context, and responsibility create competitive advantage.'
);

DO $$
DECLARE
  v_day_id uuid;
  v_section_id uuid;
BEGIN
  SELECT id INTO v_day_id FROM curriculum_days
  WHERE program_id = '7da8d569-d5a3-47d8-9101-e8142b44822e' AND day_number = 3;

  -- Section 1: Reality Mapping
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (
    v_day_id, 1, 'reality_briefing', 'Reality Mapping',
    '[{"text": "AI generates output. AI identifies patterns. AI summarizes information. AI recommends actions. AI accelerates execution.", "type": "facilitator_script"}, {"text": "But: AI does NOT interpret context. AI does NOT carry accountability. AI does NOT defend decisions.", "type": "facilitator_script"}, {"text": "Humans do.", "type": "callout"}]'::jsonb
  );

  -- Section 2: Workplace Scenario
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (
    v_day_id, 2, 'workplace_scenario', 'Workplace Scenario',
    '[{"text": "Your company uses AI to screen job candidates. The system ranks applicants based on experience, keywords, and performance history.", "type": "facilitator_script"}, {"text": "The top-ranked candidate looks excellent on paper. However, during interviews, you notice subtle indicators of poor collaboration skills.", "type": "facilitator_script"}, {"text": "The AI did not detect cultural misalignment.", "type": "facilitator_script"}, {"text": "Now the hiring decision sits with you and your team.", "type": "callout"}]'::jsonb
  );

  -- Section 3: Decision Challenge
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (
    v_day_id, 3, 'decision_challenge', 'Decision Challenge',
    '[{"text": "Do you trust the algorithm''s ranking entirely? Do you challenge it? Do you combine machine data with human insight?", "type": "facilitator_script"}, {"text": "Your responsibility is not to accept or reject blindly. Your responsibility is to layer human interpretation on top of machine analysis.", "type": "callout"}]'::jsonb
  )
  RETURNING id INTO v_section_id;

  INSERT INTO curriculum_exercises (section_id, sort_order, question, question_type, options, thinking_prompts)
  VALUES
    (v_section_id, 1, 'How should you handle the AI''s top-ranked candidate who shows poor collaboration skills?', 'multiple_choice',
     '[{"label": "A", "text": "Accept the AI ranking and hire the candidate", "is_best": false}, {"label": "B", "text": "Reject the candidate without explanation", "is_best": false}, {"label": "C", "text": "Combine AI data with human interview insights to make a balanced decision", "is_best": true}, {"label": "D", "text": "Discard the AI screening entirely", "is_best": false}]'::jsonb,
     NULL),
    (v_section_id, 2, 'What can human judgment detect that AI screening cannot?', 'open_ended', NULL,
     '["cultural fit?", "collaboration signals?", "emotional intelligence?", "communication style?"]'::jsonb),
    (v_section_id, 3, 'When is it appropriate to challenge machine output?', 'open_ended', NULL,
     '["missing context?", "incomplete data?", "ethical concerns?", "domain expertise?"]'::jsonb);

  -- Section 4: Artifact Creation
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (
    v_day_id, 4, 'artifact_creation', 'Artifact Creation: Human Insight Brief',
    '[{"text": "Write a \"Human Insight Brief.\"", "type": "facilitator_script"}, {"text": "In full sentences, explain: What the AI identified. What the AI could not detect. What human judgment reveals. Your final recommendation.", "type": "facilitator_script"}, {"text": "This trains you to articulate reasoning, not just report findings.", "type": "callout"}]'::jsonb
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
    (v_section_id, 1, 'Where does your intuition provide context that automation misses?', 'reflection'),
    (v_section_id, 2, 'Are you comfortable challenging machine output when necessary?', 'reflection');

  -- Section 6: Professional Upgrade
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (
    v_day_id, 6, 'professional_upgrade', 'Professional Upgrade',
    '[{"text": "In the AI era, your value lies in interpreting meaning and carrying responsibility.", "type": "facilitator_script"}, {"text": "Human judgment is not optional. It is your differentiator.", "type": "callout"}]'::jsonb
  );

END $$;
