-- DAY 1: From Graduate to AI-Ready Professional
-- Delete existing day 1 data if re-running
DELETE FROM curriculum_days WHERE program_id = '7da8d569-d5a3-47d8-9101-e8142b44822e' AND day_number = 1;

-- Insert Day 1
INSERT INTO curriculum_days (program_id, day_number, title, theme, day_objective, key_teaching_quote)
VALUES (
  '7da8d569-d5a3-47d8-9101-e8142b44822e',
  1,
  'From Graduate to AI-Ready Professional',
  'The world has already changed. The question is whether you will change with it or be replaced by someone who did.',
  '["Understand how AI has fundamentally restructured entry-level professional expectations", "Identify the critical gap between academic preparation and workplace reality", "Begin the mindset shift from student to professional operator", "Recognize that your value is not what you know but how you think and decide"]'::jsonb,
  'You are not entering the workforce your parents knew. You are entering one that is being rebuilt in real time by artificial intelligence.'
);

DO $$
DECLARE
  v_day_id uuid;
  v_section_id uuid;
BEGIN
  SELECT id INTO v_day_id FROM curriculum_days
  WHERE program_id = '7da8d569-d5a3-47d8-9101-e8142b44822e' AND day_number = 1;

  -- Section 1: Reality Briefing
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (v_day_id, 1, 'reality_briefing', 'Reality Mapping',
    '[{"text": "Before we begin, let us be direct about what you are walking into.", "type": "facilitator_script"}, {"text": "AI is not coming. It is already here. It is writing reports, screening resumes, generating code, analyzing markets, and making recommendations that used to require junior professionals.", "type": "facilitator_script"}, {"text": "This does not mean you are obsolete. It means the bar has moved. The skills that got you your degree are not the skills that will build your career.", "type": "facilitator_script"}, {"text": "The professionals who thrive in AI-powered organizations are not the ones who know the most. They are the ones who think the clearest, decide the fastest, and communicate with the most precision.", "type": "callout"}]'::jsonb
  );

  -- Section 2: Workplace Scenario
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (v_day_id, 2, 'workplace_scenario', 'Workplace Scenario',
    '[{"text": "It is your first week at a mid-size technology company. Your manager sends you a Slack message: I need you to review the AI-generated market analysis for our Q3 strategy meeting. Flag anything that looks off and add your perspective. I need it by 3 PM.", "type": "facilitator_script"}, {"text": "Notice what just happened. You were not asked to create the analysis. The AI already did that. You were asked to evaluate it, apply judgment, and add value the machine cannot.", "type": "facilitator_script"}, {"text": "This is the new entry-level. You are not the producer. You are the quality layer. The question is: are you ready to be that layer?", "type": "callout"}]'::jsonb
  );

  -- Section 3: Decision Challenge
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (v_day_id, 3, 'decision_challenge', 'Decision Challenge',
    '[{"text": "You open the AI-generated analysis. It is well-structured, data-rich, and professionally formatted. But something feels slightly off about one of the market projections.", "type": "facilitator_script"}, {"text": "You have two hours before the deadline. What do you do?", "type": "facilitator_script"}, {"type": "contrast", "items_a": ["accept the report as-is because the AI produced it", "spend all remaining time trying to redo the entire analysis"], "items_b": ["identify the specific concern, cross-reference with available data, and flag it with a clear recommendation", "communicate proactively with your manager about what you found"], "label_a": "A student mindset would", "label_b": "A professional mindset would"}, {"text": "Your value is not in competing with AI output. Your value is in the judgment you layer on top of it.", "type": "callout"}]'::jsonb
  ) RETURNING id INTO v_section_id;

  INSERT INTO curriculum_exercises (section_id, sort_order, question, question_type, options, thinking_prompts)
  VALUES
    (v_section_id, 1, 'Which behavior most strongly signals you are an AI-ready professional rather than a student entering a job?', 'multiple_choice',
     '[{"label": "A", "text": "Finishing tasks quickly and moving on.", "is_best": false}, {"label": "B", "text": "Waiting for detailed instructions before acting.", "is_best": false}, {"label": "C", "text": "Evaluating AI output critically and adding judgment before delivering.", "is_best": true}, {"label": "D", "text": "Producing everything from scratch to prove your skills.", "is_best": false}]'::jsonb, NULL),
    (v_section_id, 2, 'In the scenario above, what specific steps would you take in the two hours before the deadline? Write your action plan.', 'open_ended', NULL,
     '["prioritize the flagged concern", "cross-reference data sources", "document your reasoning", "communicate proactively"]'::jsonb),
    (v_section_id, 3, 'Why is the ability to evaluate AI output more valuable than the ability to produce work from scratch?', 'open_ended', NULL,
     '["speed of AI production", "human judgment as differentiator", "accountability", "trust building"]'::jsonb);

  -- Section 4: Artifact Creation
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (v_day_id, 4, 'artifact_creation', 'Artifact Creation: Professional Self-Assessment',
    '[{"text": "Write your first professional artifact: a Personal Readiness Assessment.", "type": "facilitator_script"}, {"text": "In 150-200 words, honestly assess: Where are you right now? What skills from your education translate directly to AI-augmented work? What gaps do you suspect exist? What assumptions about work are you willing to challenge this week?", "type": "facilitator_script"}, {"text": "Honesty in self-assessment is the first professional skill. Leaders trust people who know what they do not know.", "type": "callout"}]'::jsonb
  );

  -- Section 5: Reflection
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (v_day_id, 5, 'reflection', 'Reflection',
    '[{"text": "Take a moment to reflect on today''s lesson.", "type": "facilitator_script"}]'::jsonb
  ) RETURNING id INTO v_section_id;

  INSERT INTO curriculum_exercises (section_id, sort_order, question, question_type)
  VALUES
    (v_section_id, 1, 'What is the biggest assumption about your career that today''s lesson challenged?', 'reflection'),
    (v_section_id, 2, 'If AI can produce 80% of entry-level work, what will you do to own the remaining 20%?', 'reflection');

  -- Section 6: Professional Upgrade
  INSERT INTO curriculum_sections (day_id, sort_order, section_type, title, content)
  VALUES (v_day_id, 6, 'professional_upgrade', 'Professional Upgrade',
    '[{"text": "You are not entering the workforce your parents knew. You are entering one that is being rebuilt in real time by artificial intelligence.", "type": "facilitator_script"}, {"text": "The graduates who understand this on Day 1 will outpace those who figure it out in Year 3. Today, you chose to understand it. That decision alone puts you ahead.", "type": "callout"}]'::jsonb
  );
END $$;
