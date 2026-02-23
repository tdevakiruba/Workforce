-- DAY 2: How AI Organizations Actually Function
-- Delete existing day 2 data if re-running
DELETE FROM curriculum_days WHERE program_id = '7da8d569-d5a3-47d8-9101-e8142b44822e' AND day_number = 2;

-- Insert Day 2
INSERT INTO curriculum_days (program_id, day_number, title, theme, day_objective)
VALUES (
  '7da8d569-d5a3-47d8-9101-e8142b44822e',
  2,
  'How AI Organizations Actually Function',
  'If you do not understand the system you are entering, you cannot win inside it.',
  '["Understand how AI-powered organizations actually function", "Learn where machines operate and where humans decide", "Shift thinking from completing tasks to understanding workflows and decision chains", "Identify where accountability lives in AI-augmented processes"]'::jsonb
);

-- Get the day ID for sections
DO $$
DECLARE
  v_day_id uuid;
  v_section_id uuid;
BEGIN
  SELECT id INTO v_day_id FROM curriculum_days
  WHERE program_id = '7da8d569-d5a3-47d8-9101-e8142b44822e' AND day_number = 2;

  -- Section 1: Reality Mapping
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (
    v_day_id, 1, 'reality_briefing', 'Reality Mapping',
    '[{"text": "Companies don''t use AI as a \"tool.\"", "type": "facilitator_script"}, {"text": "They use it as: workflow engine, decision support, productivity multiplier.", "type": "facilitator_script"}, {"text": "AI touches: marketing insights, product decisions, customer support, finance forecasting, hiring screens.", "type": "facilitator_script"}, {"text": "But: AI does NOT own outcomes. Humans do.", "type": "callout"}]'::jsonb
  );

  -- Section 2: Workplace Scenario
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (
    v_day_id, 2, 'workplace_scenario', 'Workplace Scenario',
    '[{"text": "Imagine you are working on a product team in a company that uses AI to analyze customer feedback. The AI platform generates a report identifying declining engagement among a key segment of users and recommends a pricing adjustment.", "type": "facilitator_script"}, {"text": "Your manager turns to you and says, \"Based on this report, what do you recommend?\"", "type": "facilitator_script"}, {"text": "Notice what just happened. The AI generated insight. The decision now sits with you and your team.", "type": "facilitator_script"}, {"text": "The organization expects human judgment layered on top of machine output.", "type": "callout"}]'::jsonb
  );

  -- Section 3: Decision Challenge
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (
    v_day_id, 3, 'decision_challenge', 'Decision Challenge',
    '[{"text": "Before responding, you must think systemically.", "type": "facilitator_script"}, {"text": "Where does AI''s responsibility end? Where does your reasoning begin? Who is accountable if the pricing decision damages customer trust?", "type": "facilitator_script"}, {"type": "contrast", "items_a": ["summarize the report"], "items_b": ["evaluate the implications"], "label_a": "A student mindset would", "label_b": "A professional mindset would"}, {"text": "Your role is not to repeat what the AI produced. Your role is to interpret what it means.", "type": "callout"}]'::jsonb
  )
  RETURNING id INTO v_section_id;

  -- Decision Challenge exercises
  INSERT INTO curriculum_exercises (section_id, sort_order, question, question_type, options, thinking_prompts)
  VALUES
    (v_section_id, 1, 'Based on the AI report recommending a pricing adjustment, what is your recommended next step?', 'multiple_choice',
     '[{"label": "A", "text": "Implement the pricing change immediately", "is_best": false}, {"label": "B", "text": "Forward the report to leadership without comment", "is_best": false}, {"label": "C", "text": "Evaluate the data, assess risks, and present a reasoned recommendation", "is_best": true}, {"label": "D", "text": "Dismiss the AI''s recommendation entirely", "is_best": false}]'::jsonb,
     NULL),
    (v_section_id, 2, 'Who bears accountability if the pricing decision damages customer trust?', 'open_ended', NULL,
     '["the AI system?", "the product team?", "your manager?", "you personally?"]'::jsonb),
    (v_section_id, 3, 'How does thinking systemically differ from thinking task-by-task?', 'open_ended', NULL,
     '["workflow awareness", "downstream impact", "stakeholder mapping", "decision chains"]'::jsonb);

  -- Section 4: Artifact Creation
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (
    v_day_id, 4, 'artifact_creation', 'Artifact Creation: Decision Flow Map',
    '[{"text": "Today you will create your first systems-level artifact.", "type": "facilitator_script"}, {"text": "Write a short \"Decision Flow Map Explanation.\"", "type": "facilitator_script"}, {"text": "In full sentences, describe how the workflow should move from AI insight to human validation to managerial approval to execution. Clearly state where risk must be evaluated and where accountability rests.", "type": "facilitator_script"}, {"text": "You are training yourself to see beyond tasks and into operating systems.", "type": "callout"}]'::jsonb
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
    (v_section_id, 1, 'Where in the workflow does your value increase?', 'reflection'),
    (v_section_id, 2, 'Are you currently thinking like someone completing assignments, or someone managing decisions?', 'reflection');

  -- Section 6: Professional Upgrade
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (
    v_day_id, 6, 'professional_upgrade', 'Professional Upgrade',
    '[{"text": "Professionals do not see isolated tasks. They see chains of impact.", "type": "facilitator_script"}, {"text": "The faster you understand how decisions flow through an organization, the faster you become useful.", "type": "callout"}]'::jsonb
  );

END $$;
