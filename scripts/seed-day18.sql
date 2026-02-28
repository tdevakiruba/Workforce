-- ============================================================
-- Day 18 — Visibility, Reputation & Early Promotion Signals (ContentBlock format)
-- program_id: 7da8d569-d5a3-47d8-9101-e8142b44822e
-- ============================================================

WITH
params AS (
  SELECT '7da8d569-d5a3-47d8-9101-e8142b44822e'::uuid AS program_id, 18::int AS day_number
),

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
    'Visibility, Reputation & Early Promotion Signals'::text,
    'High-trust performers rise early.'::text,

    jsonb_build_object(
      'objective',
      'By the end of today, you will learn how visibility and reputation actually work in AI-enabled organizations, and you will build a practical strategy for being seen for the right reasons: clarity, ownership, trust, and impact.'
    ),

    to_jsonb(ARRAY['reality_briefing','workplace_scenario','decision_challenge','artifact_creation','reflection','professional_upgrade']),

    'Visibility without trust becomes noise.'::text,

    jsonb_build_object('behaviors', jsonb_build_array(
      'I create visibility by producing decision-ready work and communicating impact clearly.',
      'I build reputation through reliability, ethical judgment, and ownership under speed.',
      'I manage perception by updating early, documenting decisions, and reducing leader burden.'
    )),

    jsonb_build_object('outcomes', jsonb_build_array(
      'You create a Visibility Plan that increases the right kind of attention: impact, not hype.',
      'You learn early promotion signals leaders recognize in hybrid teams.',
      'You build a reputation strategy that compounds over 30–90 days.'
    )),

    jsonb_build_object('close', jsonb_build_array(
      'Your career is shaped by what leaders consistently experience from you.',
      'Be visible for outcomes, not activity.',
      'Tomorrow, you will build your capstone artifacts that prove AI workforce readiness.'
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
        {"type":"mapping","text":"AI makes output easy. AI makes content abundant. AI makes productivity look impressive. But: AI does NOT build reputation. AI does NOT create promotion signals. AI does NOT earn leadership trust. Humans do."},
        {"type":"facilitator_script","text":"In AI-enabled workplaces, visibility is not about being loud. It is about being reliably useful at the decision layer. Leaders notice the person who turns confusion into clarity, output into impact, and risk into responsible action."},
        {"type":"teaching_moment","title":"Promotion Signals","text":"Early promotion signals include: proactive communication, decision framing, stakeholder awareness, quality control, and ethical judgment. These signals make leaders believe you can handle more responsibility safely."}
      ]$$),

      (2,'workplace_scenario','Workplace Scenario', $$[
        {"type":"scenario_setup","text":"Two employees work hard. One sends frequent status updates that list tasks completed. The other sends fewer updates, but each update includes impact, risk, next decision, and what is needed from leadership."},
        {"type":"manager_quote","text":"I always know what’s going on with them, and I trust their judgment. Give them the bigger project."},
        {"type":"narrative","text":"Visibility is not volume. It is clarity. The people who rise early reduce uncertainty for leaders."}
      ]$$),

      (3,'decision_challenge','Decision Challenge', $$[
        {"type":"challenge","text":"Decide how you will become visible for the right reasons. You must avoid noisy activity and instead create consistent signals of trust: decision-ready communication, impact framing, and ownership under speed."},
        {"type":"instruction","text":"Design a visibility system: what you will share weekly, how you will frame impact, and how you will request decisions without sounding needy."}
      ]$$),

      (4,'artifact_creation','Artifact Creation', $$[
        {"type":"assignment","title":"Visibility Plan (30-Day Strategy)","structure":[
          "Write 3 outcomes you want leaders to associate with you (clarity, reliability, impact).",
          "Write your weekly update format (impact, risk, next step, decision needed).",
          "Write how you will document AI-assisted decisions (assumptions + validation).",
          "Write 2 relationships you will build intentionally (manager + stakeholder).",
          "Write the success signal you will measure (autonomy, project scope, trust feedback)."
        ],"length":"12–16 sentences"},
        {"type":"skills_trained","items":["visibility strategy","reputation","executive communication","stakeholder management","career acceleration"]}
      ]$$),

      (5,'reflection','Reflection', $$[
        {"type":"instruction","text":"Reflect on whether you seek visibility through activity or through impact. Identify one habit that creates noise (over-updating, overexplaining, hype language) and write the habit that will replace it (impact framing, decision clarity, brevity)."},
        {"type":"instruction","text":"Then reflect on your reputation. If your manager described you in one sentence today, what would they say? Write the sentence you want them to say in 30 days, and list the behaviors that will earn it."}
      ]$$),

      (6,'professional_upgrade','Professional Upgrade', $$[
        {"type":"callout","text":"High performers are visible because they reduce uncertainty, not because they talk more."},
        {"type":"facilitator_script","text":"When you become visible for decision-ready thinking, leaders trust you with bigger work. Reputation is built by repeated experiences. Your visibility plan makes those experiences consistent and intentional."}
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
      ('decision_challenge',1,'What is the difference between visibility through activity and visibility through impact?','open_ended', $$null$$,
        $$["Define activity visibility.","Define impact visibility.","Explain why leaders reward impact visibility more."]$$),
      ('decision_challenge',2,'Which weekly update format creates the strongest promotion signal?','multiple_choice', $$[
        {"label":"A","text":"A list of tasks completed and hours worked."},
        {"label":"B","text":"A long paragraph explaining everything you did."},
        {"label":"C","text":"Impact, key risk, next step, decision needed, and timeline."},
        {"label":"D","text":"Screenshots of AI output with no explanation."}
      ]$$,
        $$["Which format reduces uncertainty?","Which format is decision-ready?","Which format shows ownership?"]$$),
      ('decision_challenge',3,'What behavior most strongly signals early promotion readiness in hybrid teams?','multiple_choice', $$[
        {"label":"A","text":"Talking a lot in meetings."},
        {"label":"B","text":"Producing high volume of AI-generated output."},
        {"label":"C","text":"Consistent reliability, decision framing, ethical judgment, and proactive communication."},
        {"label":"D","text":"Avoiding risk by staying silent."}
      ]$$,
        $$["What makes leaders feel safe giving you more responsibility?","Why does ethics matter to longevity?","Why does proactive communication increase trust?"]$$),
      ('reflection',1,'What is one habit that creates noise, and what habit will replace it to create impact visibility?','open_ended', $$null$$,
        $$["Name the noise habit.","Write the replacement habit.","Describe how it changes how leaders experience you."]$$),
      ('reflection',2,'Write the one sentence you want your manager to say about you in 30 days, and list 3 behaviors that will earn it.','open_ended', $$null$$,
        $$["Write the sentence clearly.","List 3 behaviors as routines.","Make them measurable and repeatable."]$$)
  ) AS e(section_type, sort_order, question, question_type, options, thinking_prompts)
    ON e.section_type = sl.section_type
  RETURNING id
)

SELECT
  (SELECT count(*) FROM del_day) AS days_deleted,
  (SELECT count(*) FROM ins_day) AS days_inserted,
  (SELECT count(*) FROM ins_sections) AS sections_inserted,
  (SELECT count(*) FROM ins_exercises) AS exercises_inserted;