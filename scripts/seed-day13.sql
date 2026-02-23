-- ============================================================
-- Day 13 — Communicating AI-Generated Work to Leadership (ContentBlock format)
-- program_id: 7da8d569-d5a3-47d8-9101-e8142b44822e
-- ============================================================

WITH
params AS (
  SELECT '7da8d569-d5a3-47d8-9101-e8142b44822e'::uuid AS program_id, 13::int AS day_number
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
    'Communicating AI-Generated Work to Leadership'::text,
    'Leaders do not want raw output. They want clarity.'::text,

    jsonb_build_object(
      'objective',
      'By the end of today, you will learn how to present AI-supported insights in a way that signals professionalism, ownership, and executive readiness by communicating recommendations with clarity and decision focus.'
    ),

    to_jsonb(ARRAY['reality_briefing','workplace_scenario','decision_challenge','artifact_creation','reflection','professional_upgrade']),

    'Leadership doesn’t reward volume. Leadership rewards clarity.'::text,

    jsonb_build_object('behaviors', jsonb_build_array(
      'I communicate AI-assisted work with ownership, not dependence.',
      'I present conclusions in decision-ready language: recommendation, rationale, risk, next step.',
      'I refine AI output into executive clarity that leaders can act on quickly.'
    )),

    jsonb_build_object('outcomes', jsonb_build_array(
      'You create an Executive Summary Statement that is concise and decision-ready.',
      'You learn how to avoid sounding like you are “reading AI” to leadership.',
      'You build communication habits that increase perceived seniority early.'
    )),

    jsonb_build_object('close', jsonb_build_array(
      'How you communicate determines how you are perceived.',
      'Ownership turns AI-assisted work into leadership-ready work.',
      'Tomorrow, you will learn initiative in hybrid teams and how to improve systems, not just complete tasks.'
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
        {"type":"mapping","text":"AI drafts reports. AI generates summaries. AI structures arguments. AI enhances communication speed. But: AI does NOT own the message. AI does NOT carry authority. AI does NOT represent strategic alignment. Humans do."},
        {"type":"facilitator_script","text":"Executives do not want to see how much content you generated. They want to know what you recommend, why you recommend it, what could go wrong, and what happens next. Your job is to turn AI-assisted content into leadership-ready clarity."},
        {"type":"teaching_moment","title":"Executive Language","text":"Executive communication is not longer. It is sharper. It removes noise, highlights decisions, and protects confidence by naming assumptions and risks clearly."}
      ]$$),

      (2,'workplace_scenario','Workplace Scenario', $$[
        {"type":"scenario_setup","text":"You prepare an AI-assisted strategic summary for senior leadership. The content is thorough but dense. Executives have limited time, and credibility depends on whether you can deliver a clear recommendation quickly."},
        {"type":"manager_quote","text":"Give me the headline. What do you recommend and why?"},
        {"type":"narrative","text":"This moment is where early-career professionals either hide behind detail or rise through clarity. Leaders can feel ownership in your voice when you communicate like an operator."}
      ]$$),

      (3,'decision_challenge','Decision Challenge', $$[
        {"type":"challenge","text":"Decide how you will refine AI-generated content into a clear message that signals ownership. You must choose what matters, remove what distracts, anticipate questions, and deliver a recommendation that sounds confident because it is grounded."},
        {"type":"instruction","text":"Use a decision-ready structure: recommendation, rationale, top risk, mitigation, and next step with owner."}
      ]$$),

      (4,'artifact_creation','Artifact Creation', $$[
        {"type":"assignment","title":"Executive Summary Statement","structure":[
          "Write one sentence: the recommendation.",
          "Write 2–3 sentences: the rationale tied to goals.",
          "Write one sentence: the top risk.",
          "Write one sentence: mitigation or validation step.",
          "Write one sentence: next step with owner and timeline."
        ],"length":"6–8 sentences"},
        {"type":"skills_trained","items":["executive communication","clarity","ownership","prioritization","leadership presence"]}
      ]$$),

      (5,'reflection','Reflection', $$[
        {"type":"instruction","text":"Reflect on whether your communication signals authority or dependence. When you present AI-assisted work, do you sound like you are repeating output or making a recommendation you stand behind? Write what you will change immediately."},
        {"type":"instruction","text":"Then reflect on confidence. Confidence is not volume. It is clarity plus ownership. Write one sentence that you will use when presenting recommendations to leaders going forward."}
      ]$$),

      (6,'professional_upgrade','Professional Upgrade', $$[
        {"type":"callout","text":"Leaders trust people who reduce complexity into decisions."},
        {"type":"facilitator_script","text":"When you communicate AI-supported insights with clarity and ownership, you signal readiness for higher responsibility. Communication is not presentation — it is how leadership measures your judgment."}
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
      ('decision_challenge',1,'Why do leaders prefer recommendations over raw AI-generated output?','open_ended', $$null$$,
        $$["Explain what leaders are optimizing for (speed of decision, risk reduction).","Explain why raw output increases their burden.","Explain how ownership changes trust."]$$),
      ('decision_challenge',2,'Which structure is most executive-ready?','multiple_choice', $$[
        {"label":"A","text":"A long report explaining everything AI generated."},
        {"label":"B","text":"A summary of the dashboard with no recommendation."},
        {"label":"C","text":"Recommendation + rationale + top risk + mitigation + next step with owner."},
        {"label":"D","text":"A list of raw AI bullet points copied into slides."}
      ]$$,
        $$["Which option reduces decision burden?","Which option shows ownership?","Which option protects confidence by naming risk?"]$$),
      ('decision_challenge',3,'A leader says, “Give me the headline.” What is the best response?','multiple_choice', $$[
        {"label":"A","text":"Read the full AI summary so nothing is missed."},
        {"label":"B","text":"Say you need more time and defer."},
        {"label":"C","text":"Deliver a concise recommendation, explain why, name the top risk, and propose the next step."},
        {"label":"D","text":"Share a link to the AI report and let them read it."}
      ]$$,
        $$["What does ‘headline’ mean in executive context?","How do you show confidence without overclaiming?","How do you keep it decision-ready?"]$$),
      ('reflection',1,'What is one communication habit that makes you sound less senior, and what will you replace it with?','open_ended', $$null$$,
        $$["Name the habit honestly (overexplaining, hedging, hiding behind data).","Write the replacement habit in one sentence.","Describe how it changes perception."]$$),
      ('reflection',2,'Write the one sentence you will use to present a recommendation to leadership going forward.','open_ended', $$null$$,
        $$["Make it direct and calm.","Include recommendation + reason.","Avoid hedging language that removes confidence."]$$)
  ) AS e(section_type, sort_order, question, question_type, options, thinking_prompts)
    ON e.section_type = sl.section_type
  RETURNING id
)

SELECT
  (SELECT count(*) FROM del_day) AS days_deleted,
  (SELECT count(*) FROM ins_day) AS days_inserted,
  (SELECT count(*) FROM ins_sections) AS sections_inserted,
  (SELECT count(*) FROM ins_exercises) AS exercises_inserted;