-- ============================================================
-- Day 12 — Translating AI Output into Business Impact (ContentBlock format)
-- program_id: 7da8d569-d5a3-47d8-9101-e8142b44822e
-- ============================================================

WITH
params AS (
  SELECT '7da8d569-d5a3-47d8-9101-e8142b44822e'::uuid AS program_id, 12::int AS day_number
),

del_day AS (
  DELETE FROM public.curriculum_days d
  USING params p
  WHERE d.program_id = p.program_id AND d.day_number = p.day_number
  RETURNING d.id
),

ins_day AS (
  INSERT INTO public.curriculum_days
  (program_id, day_number, title, theme, day_objective, lesson_flow, key_teaching_quote, behaviors_instilled, end_of_day_outcomes, facilitator_close)
  SELECT
    p.program_id,
    p.day_number,
    'Translating AI Output into Business Impact'::text,
    'Output is not value. Interpretation creates value.'::text,

    jsonb_build_object(
      'objective',
      'By the end of today, you will learn how to convert AI-generated information into decision-ready business insight by connecting findings to goals, priorities, and actions leaders care about.'
    ),

    to_jsonb(ARRAY['reality_briefing','workplace_scenario','decision_challenge','artifact_creation','reflection','professional_upgrade']),

    'If you can’t connect it to impact, it’s noise.'::text,

    jsonb_build_object('behaviors', jsonb_build_array(
      'I translate metrics into meaning by explaining implications and next actions.',
      'I align insights to business goals so leaders can act, not just observe.',
      'I recommend actions with clarity, tradeoffs, and ownership.'
    )),

    jsonb_build_object('outcomes', jsonb_build_array(
      'You produce a Business Impact Brief that translates AI findings into direction.',
      'You communicate insights in leadership language: goals, risk, action, outcome.',
      'You build credibility by reducing leadership decision burden.'
    )),

    jsonb_build_object('close', jsonb_build_array(
      'Leaders do not pay for data. They pay for direction.',
      'When you connect insight to action, you become indispensable.',
      'Tomorrow, you will learn how to communicate AI-generated work to leadership with clarity.'
    ))
  FROM params p
  RETURNING id
),

ins_sections AS (
  INSERT INTO public.curriculum_sections (day_id, sort_order, section_type, title, content)
  SELECT d.id, s.sort_order, s.section_type, s.title, s.content::jsonb
  FROM ins_day d
  CROSS JOIN (
    VALUES
      (1,'reality_briefing','Reality Briefing', $$[
        {"type":"mapping","text":"AI generates analysis. AI produces summaries. AI highlights metrics. AI suggests trends. But: AI does NOT define strategic priority. AI does NOT align insight with business goals. AI does NOT connect data to long-term direction. Humans do."},
        {"type":"facilitator_script","text":"Most people show leaders dashboards. Professionals show leaders decisions. The difference is interpretation. Your job is to connect what AI found to what the business cares about: revenue, cost, risk, customer trust, and strategic direction."},
        {"type":"teaching_moment","title":"Impact Translation","text":"Leaders want three things: what it means, why it matters, and what we should do. If your insight cannot answer those, you are giving information, not value."}
      ]$$),

      (2,'workplace_scenario','Workplace Scenario', $$[
        {"type":"scenario_setup","text":"An AI dashboard produces a performance summary showing increased traffic and engagement in specific regions. The data looks positive, but leadership wants to understand what it means for revenue, positioning, and next-quarter strategy."},
        {"type":"manager_quote","text":"Don’t show me numbers. Tell me what we should do."},
        {"type":"narrative","text":"This is where careers accelerate. Anyone can report metrics. High-trust performers translate metrics into direction and action."}
      ]$$),

      (3,'decision_challenge','Decision Challenge', $$[
        {"type":"challenge","text":"Decide whether you will be a reporter or a strategist. You must move from ‘what happened’ to ‘what it means’ to ‘what we do next.’ This requires prioritizing the right metrics, naming implications, and recommending actions aligned with goals."},
        {"type":"instruction","text":"Write your recommendation with tradeoffs: what action, what benefit, what risk, and what validation you need before scaling."}
      ]$$),

      (4,'artifact_creation','Artifact Creation', $$[
        {"type":"assignment","title":"Business Impact Brief","structure":[
          "State the top 1–2 AI findings in plain language.",
          "Explain why it matters (connect to goal: revenue, retention, cost, trust).",
          "Name the implication (opportunity or risk).",
          "Recommend 1 action with owner + timeline.",
          "Name 1 metric to validate impact and a decision checkpoint."
        ],"length":"10–12 sentences"},
        {"type":"skills_trained","items":["business framing","strategic thinking","prioritization","executive communication","decision-making"]}
      ]$$),

      (5,'reflection','Reflection', $$[
        {"type":"instruction","text":"Reflect on whether you naturally focus on information or impact. When you communicate, do you stop at ‘here is the data,’ or do you push to ‘here is the decision’? Name one place you will practice impact language this week."},
        {"type":"instruction","text":"Then reflect on courage: recommending action includes risk. Write what makes you hesitate, and how you will speak with ownership anyway."}
      ]$$),

      (6,'professional_upgrade','Professional Upgrade', $$[
        {"type":"callout","text":"Professionals who translate data into direction become indispensable."},
        {"type":"facilitator_script","text":"When you connect AI output to business priorities, leaders see you as someone who reduces decision burden. That is how you move from task execution into strategic value — and strategic value accelerates your trajectory."}
      ]$$)
  ) AS s(sort_order, section_type, title, content)
  RETURNING id, section_type
),

section_lookup AS (SELECT id AS section_id, section_type FROM ins_sections),

ins_exercises AS (
  INSERT INTO public.curriculum_exercises (section_id, sort_order, question, question_type, options, thinking_prompts)
  SELECT sl.section_id, e.sort_order, e.question, e.question_type, e.options::jsonb, e.thinking_prompts::jsonb
  FROM section_lookup sl
  JOIN (
    VALUES
      ('decision_challenge',1,'What is the difference between “reporting AI output” and “translating AI output into business impact”?','open_ended', $$null$$,
        $$["Define reporting in one sentence.","Define translation in one sentence.","Give an example of what leaders actually want to hear."]$$),
      ('decision_challenge',2,'Which statement is most executive-ready impact communication?','multiple_choice', $$[
        {"label":"A","text":"Traffic is up 18% and engagement is up 11%."},
        {"label":"B","text":"The dashboard looks positive this week."},
        {"label":"C","text":"Engagement is up in Region X, which suggests demand lift. We should run a 2-week targeted campaign and measure conversion before scaling."},
        {"label":"D","text":"AI says the numbers are good so we’re fine."}
      ]$$,
        $$["Which option connects data to action?","Which option states implication + next step?","Which option reduces leadership decision load?"]$$),
      ('decision_challenge',3,'When leaders ask “What should we do next?” what must your recommendation include?','multiple_choice', $$[
        {"label":"A","text":"Only the metric trend."},
        {"label":"B","text":"A long explanation of how AI produced the analysis."},
        {"label":"C","text":"An action, a reason tied to goals, an owner/timeline, and a validation metric."},
        {"label":"D","text":"A suggestion to wait for more data indefinitely."}
      ]$$,
        $$["What makes a recommendation actionable?","Why does ownership matter?","What metric proves it worked?"]$$),
      ('reflection',1,'Write one sentence that converts a metric into meaning and action.','open_ended', $$null$$,
        $$["Include: what happened, what it means, what to do next.","Use leadership language (goal, risk, action).","Make it short and decisive."]$$),
      ('reflection',2,'What makes you hesitate to recommend action, and what will you do to speak with ownership anyway?','open_ended', $$null$$,
        $$["Name the fear.","Name the preparation step that reduces uncertainty.","Write the sentence you will use to recommend anyway."]$$)
  ) AS e(section_type, sort_order, question, question_type, options, thinking_prompts)
    ON e.section_type = sl.section_type
  RETURNING id
)

SELECT
  (SELECT count(*) FROM del_day) AS days_deleted,
  (SELECT count(*) FROM ins_day) AS days_inserted,
  (SELECT count(*) FROM ins_sections) AS sections_inserted,
  (SELECT count(*) FROM ins_exercises) AS exercises_inserted;