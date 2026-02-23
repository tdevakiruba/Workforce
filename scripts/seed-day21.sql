-- ============================================================
-- Day 21 — Certification Final + 90-Day Trajectory Plan (ContentBlock format)
-- program_id: 7da8d569-d5a3-47d8-9101-e8142b44822e
-- ============================================================

WITH
params AS (
  SELECT '7da8d569-d5a3-47d8-9101-e8142b44822e'::uuid AS program_id, 21::int AS day_number
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
    'Certification Final + 90-Day Trajectory Plan'::text,
    'Finish strong. Leave with a system.'::text,

    jsonb_build_object(
      'objective',
      'By the end of today, you will finalize your AI Workforce Readiness Certification by completing your capstone package and creating a 90-day execution plan that turns the 21-day operating system into real career momentum.'
    ),

    to_jsonb(ARRAY['reality_briefing','workplace_scenario','decision_challenge','artifact_creation','reflection','professional_upgrade']),

    'Graduation is not the finish line. It is your launch.'::text,

    jsonb_build_object('behaviors', jsonb_build_array(
      'I sustain growth through a 90-day plan built on weekly learning velocity, trust habits, and visibility strategy.',
      'I document and communicate my impact so my work turns into opportunity.',
      'I operate as a high-trust performer by protecting outcomes and leading without title.'
    )),

    jsonb_build_object('outcomes', jsonb_build_array(
      'You finalize a Certification Portfolio that proves AI workforce readiness.',
      'You create a 90-Day Trajectory Plan with weekly habits, metrics, and milestones.',
      'You leave with a clear career operating system you can execute immediately.'
    )),

    jsonb_build_object('close', jsonb_build_array(
      'You are now trained to operate inside AI-enabled organizations.',
      'Your edge is judgment, ownership, trust, and clarity — not tools.',
      'Execute your 90-day plan and your career acceleration becomes inevitable.'
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
        {"type":"mapping","text":"AI tools will change monthly. Workflows will change constantly. Roles will evolve quickly. But: trust still matters. judgment still matters. ownership still matters. humans still matter."},
        {"type":"facilitator_script","text":"Today is not about finishing content. It is about locking in an operating system you can execute. Certification is not a badge; it is a proof package and a plan that turns learning into momentum."},
        {"type":"teaching_moment","title":"The 90-Day Rule","text":"A 21-day program changes awareness. A 90-day execution plan changes identity, habits, and outcomes. Today you build the bridge between the two."}
      ]$$),

      (2,'workplace_scenario','Workplace Scenario', $$[
        {"type":"scenario_setup","text":"A hiring manager asks: “What can you prove?” You show your capstone artifacts and describe your 90-day plan: how you learn, validate AI output, communicate impact, and build trust."},
        {"type":"manager_quote","text":"This is rare. Most candidates can’t show how they operate. They only list tools."},
        {"type":"narrative","text":"You are positioning yourself as an operator, not a tool-user. That is the certification signal employers respect."}
      ]$$),

      (3,'decision_challenge','Decision Challenge', $$[
        {"type":"challenge","text":"Decide how you will sustain your momentum after the program ends. Your plan must protect learning velocity, trust habits, and visibility strategy. If you do not execute, the edge fades. If you execute, the edge compounds."},
        {"type":"instruction","text":"Build your 90-day plan with weekly structure: one skill upgrade, one artifact, one relationship touchpoint, and one measurable impact outcome."}
      ]$$),

      (4,'artifact_creation','Artifact Creation', $$[
        {"type":"assignment","title":"Certification Final Pack + 90-Day Trajectory Plan","structure":[
          "Finalize your 3 best artifacts into a single portfolio pack.",
          "Write your certification summary (what you can do now).",
          "Write your 90-day weekly cadence (skill, artifact, relationship, impact).",
          "Define 3 milestones (Day 30, Day 60, Day 90).",
          "Define metrics (trust/autonomy signal, impact metric, learning velocity metric)."
        ],"length":"Portfolio + plan (12–18 sentences)"},
        {"type":"skills_trained","items":["execution planning","career strategy","habit design","portfolio positioning","long-term momentum"]}
      ]$$),

      (5,'reflection','Reflection', $$[
        {"type":"instruction","text":"Reflect on how your mindset changed from Day 1 to Day 21. Identify the strongest behavior you gained (ownership, validation, clarity, risk thinking, influence) and write how you will protect it under real workplace pressure."},
        {"type":"instruction","text":"Then reflect on identity. Write the sentence that describes who you are now as an operator in the AI workforce, and commit to one non-negotiable rule you will follow in every role."}
      ]$$),

      (6,'professional_upgrade','Professional Upgrade', $$[
        {"type":"callout","text":"Your career accelerates when your habits match the era you are entering."},
        {"type":"facilitator_script","text":"This program gave you a career operating system. Your job now is execution. When you practice these behaviors for 90 days, you stop being a graduate entering the workforce and become a high-trust performer rising early."}
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
      ('decision_challenge',1,'Why is a 90-day execution plan necessary after a 21-day accelerator in the AI era?','open_ended', $$null$$,
        $$["Explain how habits form over time.","Explain why tools and workflows change quickly.","Explain how consistency compounds trust and trajectory."]$$),
      ('decision_challenge',2,'Which 90-day weekly cadence best sustains career acceleration?','multiple_choice', $$[
        {"label":"A","text":"Only consume more AI content online."},
        {"label":"B","text":"Work harder and hope someone notices."},
        {"label":"C","text":"Weekly: one skill upgrade, one artifact, one relationship touchpoint, one measurable impact outcome."},
        {"label":"D","text":"Wait until a manager assigns learning."}
      ]$$,
        $$["Which cadence is measurable and repeatable?","Which builds both skill and visibility?","Which creates proof and trust?"]$$),
      ('decision_challenge',3,'What makes a certification signal credible to employers?','multiple_choice', $$[
        {"label":"A","text":"A badge with no evidence."},
        {"label":"B","text":"A list of tools used."},
        {"label":"C","text":"A portfolio of artifacts + a clear operating behavior system + measurable outcomes."},
        {"label":"D","text":"A long personal story without proof."}
      ]$$,
        $$["What reduces employer risk?","What proves you can operate?","What shows you can deliver outcomes with AI present?"]$$),
      ('reflection',1,'What is the strongest behavior you gained in this program, and how will you protect it under pressure?','open_ended', $$null$$,
        $$["Name the behavior.","Name the pressure scenario that could break it.","Write your protection rule or habit."]$$),
      ('reflection',2,'Write your new operator identity sentence and one non-negotiable rule you will follow in every role.','open_ended', $$null$$,
        $$["Make the identity sentence bold and clear.","Make the rule enforceable.","Tie it to trust and ownership."]$$)
  ) AS e(section_type, sort_order, question, question_type, options, thinking_prompts)
    ON e.section_type = sl.section_type
  RETURNING id
)

SELECT
  (SELECT count(*) FROM del_day) AS days_deleted,
  (SELECT count(*) FROM ins_day) AS days_inserted,
  (SELECT count(*) FROM ins_sections) AS sections_inserted,
  (SELECT count(*) FROM ins_exercises) AS exercises_inserted;