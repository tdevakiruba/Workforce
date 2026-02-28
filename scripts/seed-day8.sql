-- ============================================================
-- Day 8 — Prompting for Professionals (ContentBlock format)
-- program_id: 7da8d569-d5a3-47d8-9101-e8142b44822e
-- ============================================================

WITH
params AS (SELECT '7da8d569-d5a3-47d8-9101-e8142b44822e'::uuid AS program_id, 8::int AS day_number),

del_day AS (
  DELETE FROM public."wf-curriculum_days" d
  USING params p
  WHERE d.program_id = p.program_id AND d.day_number = p.day_number
  RETURNING d.id
),

ins_day AS (
  INSERT INTO public."wf-curriculum_days"
  (program_id, day_number, title, theme, day_objective, lesson_flow, key_teaching_quote, behaviors_instilled, end_of_day_outcomes, facilitator_close)
  SELECT
    p.program_id,
    p.day_number,
    'Prompting for Professionals'::text,
    'Prompting is not typing. Prompting is thinking.'::text,
    jsonb_build_object(
      'objective',
      'By the end of today, you will learn how to prompt like a professional operator by giving AI clear context, constraints, and success criteria so the output becomes usable, accurate, and aligned with business needs.'
    ),
    to_jsonb(ARRAY['reality_briefing','workplace_scenario','decision_challenge','artifact_creation','reflection','professional_upgrade']),
    'Great prompts don’t ask for output. They design decisions.'::text,
    jsonb_build_object('behaviors', jsonb_build_array(
      'I provide context, audience, constraints, and success criteria before requesting AI output.',
      'I iterate prompts with refinement loops to improve accuracy and usefulness.',
      'I treat prompts like specifications because they shape risk, quality, and outcome.'
    )),
    jsonb_build_object('outcomes', jsonb_build_array(
      'You create a Professional Prompt Template you can reuse across tasks.',
      'You produce an example prompt + refined prompt that improves output quality.',
      'You learn how to control AI output without wasting time.'
    )),
    jsonb_build_object('close', jsonb_build_array(
      'Prompts are leadership levers in AI workplaces.',
      'If you can’t direct the tool, you can’t direct the outcome.',
      'Tomorrow, you will learn how to validate AI output like a responsible operator.'
    ))
  FROM params p
  RETURNING id
),

ins_sections AS (
  INSERT INTO public."wf-curriculum_sections" (day_id, sort_order, section_type, title, content)
  SELECT d.id, s.sort_order, s.section_type, s.title, s.content::jsonb
  FROM ins_day d
  CROSS JOIN (
    VALUES
      (1,'reality_briefing','Reality Briefing', $$[
        {"type":"mapping","text":"AI can generate fast. AI can sound confident. AI can appear correct. AI can create volume. But: AI does NOT know your goal. AI does NOT know your audience. AI does NOT know your constraints. Humans do."},
        {"type":"facilitator_script","text":"Most people prompt like students: they ask for answers. Professionals prompt like operators: they design the context so the answer is useful. The quality of AI output is directly tied to the quality of your thinking and the clarity of your constraints."},
        {"type":"teaching_moment","title":"Prompting = Specification","text":"In AI-enabled organizations, prompting is a form of writing specs. If you leave out context, you invite risk. If you define success clearly, you get usable output faster."}
      ]$$),

      (2,'workplace_scenario','Workplace Scenario', $$[
        {"type":"scenario_setup","text":"Your manager asks you to draft a client update and a risk summary for leadership. You use AI, but the first draft is too generic and slightly off in tone for the relationship."},
        {"type":"manager_quote","text":"This is close, but it doesn’t sound like us. Fix it and make it decision-ready."},
        {"type":"narrative","text":"This is a prompting problem, not a writing problem. Your job is to provide the right context and constraints so AI can produce something aligned with reality."}
      ]$$),

      (3,'decision_challenge','Decision Challenge', $$[
        {"type":"challenge","text":"You must decide whether you will accept generic output or engineer better output through structured prompting. Professional prompting includes role, audience, objective, constraints, tone, and format — because that is what makes the result usable."},
        {"type":"instruction","text":"Rewrite your prompt so it includes: who you are, who the audience is, what decision or action is needed, the tone required, and what must NOT be included."}
      ]$$),

      (4,'artifact_creation','Artifact Creation', $$[
        {"type":"assignment","title":"Professional Prompt Template","structure":[
          "Write a reusable prompt template with placeholders (role, audience, objective).",
          "Add constraints: length, tone, banned claims, must-include facts.",
          "Add format instructions: bullets vs memo vs email.",
          "Write one example prompt using your template.",
          "Write one refinement prompt that improves the first output."
        ],"length":"Template + 2 prompts"},
        {"type":"skills_trained","items":["prompt engineering","spec thinking","communication","accuracy","execution speed"]}
      ]$$),

      (5,'reflection','Reflection', $$[
        {"type":"instruction","text":"Reflect on how you usually prompt AI. Do you ask for output, or do you design a result? Identify one missing element you often leave out (audience, tone, constraints, success criteria) and explain how adding it will change quality."},
        {"type":"instruction","text":"Then reflect on control: where in your work do you need more precision? Name one workflow where better prompts will reduce rework immediately."}
      ]$$),

      (6,'professional_upgrade','Professional Upgrade', $$[
        {"type":"callout","text":"In AI workplaces, your ability to direct the tool becomes your ability to direct outcomes."},
        {"type":"facilitator_script","text":"Professional prompting is a career accelerator because it turns AI from a generic generator into a targeted assistant. When your prompts are clear, you move faster with less risk, and leaders trust your output sooner."}
      ]$$)
  ) AS s(sort_order, section_type, title, content)
  RETURNING id, section_type
),

section_lookup AS (SELECT id AS section_id, section_type FROM ins_sections),

ins_exercises AS (
  INSERT INTO public."wf-curriculum_exercises" (section_id, sort_order, question, question_type, options, thinking_prompts)
  SELECT sl.section_id, e.sort_order, e.question, e.question_type, e.options::jsonb, e.thinking_prompts::jsonb
  FROM section_lookup sl
  JOIN (
    VALUES
      ('decision_challenge',1,'Why do generic prompts create higher risk in professional AI workflows?','open_ended', $$null$$,
        $$["Explain what gets lost without context.","Explain how missing constraints increases hallucinations or tone errors.","Explain how risk shows up downstream with stakeholders."]$$),
      ('decision_challenge',2,'Which prompt is most “professional operator” quality?','multiple_choice', $$[
        {"label":"A","text":"Write a client update about our project."},
        {"label":"B","text":"Summarize this in a friendly tone."},
        {"label":"C","text":"You are a project analyst. Write a 120-word client update for a long-term partner. Tone: confident and warm. Include: milestone A and date, risk B and mitigation, next step with owner. Avoid: overpromising or unverified claims. Format: 3 bullets + closing sentence."},
        {"label":"D","text":"Make this sound better and shorter."}
      ]$$,
        $$["What makes a prompt decision-ready?","Which prompt defines success criteria and constraints?","Which prompt reduces rework the most?"]$$),
      ('decision_challenge',3,'What is the best “refinement loop” step after the first AI output is too generic?','multiple_choice', $$[
        {"label":"A","text":"Accept it and send it."},
        {"label":"B","text":"Tell AI: make it better."},
        {"label":"C","text":"Add missing constraints: audience, tone, must-include facts, and desired structure, then regenerate."},
        {"label":"D","text":"Stop using AI for this task."}
      ]$$,
        $$["What details would sharpen the output?","How do constraints reduce risk?","How does structure increase usability?"]$$),
      ('reflection',1,'Write one sentence describing the biggest improvement you will make to your prompting starting today.','open_ended', $$null$$,
        $$["Make it specific (what you will always include).","Make it measurable (how you know you did it).","Make it tied to output quality."]$$),
      ('reflection',2,'Name one workflow where better prompting will reduce rework immediately and explain why.','open_ended', $$null$$,
        $$["What’s the current pain point?","What constraint or context is missing today?","What outcome will improve when prompts improve?"]$$)
  ) AS e(section_type, sort_order, question, question_type, options, thinking_prompts)
    ON e.section_type = sl.section_type
  RETURNING id
)

SELECT
  (SELECT count(*) FROM del_day) AS days_deleted,
  (SELECT count(*) FROM ins_day) AS days_inserted,
  (SELECT count(*) FROM ins_sections) AS sections_inserted,
  (SELECT count(*) FROM ins_exercises) AS exercises_inserted;