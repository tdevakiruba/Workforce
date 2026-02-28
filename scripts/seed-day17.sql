-- ============================================================
-- Day 17 — Ethical Judgment & Responsible AI Use (ContentBlock format)
-- program_id: 7da8d569-d5a3-47d8-9101-e8142b44822e
-- ============================================================

WITH
params AS (
  SELECT '7da8d569-d5a3-47d8-9101-e8142b44822e'::uuid AS program_id, 17::int AS day_number
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
    'Ethical Judgment & Responsible AI Use'::text,
    'Ethics determines longevity.'::text,

    jsonb_build_object(
      'objective',
      'By the end of today, you will learn how to apply ethical judgment to AI-assisted work by identifying bias, privacy risk, and misuse, and by practicing responsible escalation and documentation that protects people and the organization.'
    ),

    to_jsonb(ARRAY['reality_briefing','workplace_scenario','decision_challenge','artifact_creation','reflection','professional_upgrade']),

    'Speed without ethics becomes liability.'::text,

    jsonb_build_object('behaviors', jsonb_build_array(
      'I recognize bias, privacy, and misuse risks in AI-enabled workflows.',
      'I document assumptions and data handling decisions to protect trust and compliance.',
      'I escalate ethical concerns responsibly with clarity, evidence, and options.'
    )),

    jsonb_build_object('outcomes', jsonb_build_array(
      'You create an Ethical Decision Note that documents risk, impact, and a responsible path forward.',
      'You learn how to spot “quiet” ethical issues before they become public crises.',
      'You build a professional standard for responsible AI use that increases trust.'
    )),

    jsonb_build_object('close', jsonb_build_array(
      'Ethics is not a philosophy; it is an operational requirement.',
      'The best professionals protect people while achieving outcomes.',
      'Tomorrow, you will learn visibility strategies and how high-trust performers rise early.'
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
        {"type":"mapping","text":"AI increases speed. AI increases automation. AI can scale decisions. But: AI does NOT understand fairness. AI does NOT feel harm. AI does NOT protect privacy by default. Humans do."},
        {"type":"facilitator_script","text":"In AI-enabled workplaces, the biggest professional risk is not making a mistake; it is causing harm you didn’t see coming. Ethical judgment means you pause long enough to ask: who is impacted, what could go wrong, and what must be protected before we scale."},
        {"type":"teaching_moment","title":"Ethics is a Workflow Skill","text":"Ethics is not a slide deck. It is how you handle data, interpret output, and decide what is acceptable. Ethical operators create guardrails, document decisions, and escalate risk before damage is done."}
      ]$$),

      (2,'workplace_scenario','Workplace Scenario', $$[
        {"type":"scenario_setup","text":"Your company uses AI to screen resumes for entry-level candidates. The model ranks applicants, but you notice the top selections lack diversity and the system seems to overvalue specific schools and keywords."},
        {"type":"manager_quote","text":"The model is efficient. We should trust the ranking so we can move faster."},
        {"type":"narrative","text":"This is where ethical judgment becomes leadership. If you move fast with a biased process, the organization inherits reputational, legal, and moral consequences."}
      ]$$),

      (3,'decision_challenge','Decision Challenge', $$[
        {"type":"challenge","text":"Decide how you will respond when speed pressures collide with fairness and privacy. You must raise concerns constructively, propose options, and protect the organization without sounding political or emotional."},
        {"type":"instruction","text":"Frame your response as an ethical operations move: identify the risk, describe impact, propose a validation step, and recommend a safer process."}
      ]$$),

      (4,'artifact_creation','Artifact Creation', $$[
        {"type":"assignment","title":"Ethical Decision Note","structure":[
          "Describe the workflow and where AI is making decisions.",
          "Name the ethical risk (bias, fairness, privacy, misuse).",
          "Describe who is impacted and how harm could occur.",
          "Propose a validation step (audit sample outcomes, add human review, adjust criteria).",
          "Recommend a path that preserves speed while protecting people."
        ],"length":"12–16 sentences"},
        {"type":"skills_trained","items":["ethical judgment","risk identification","documentation","escalation","responsible AI"]}
      ]$$),

      (5,'reflection','Reflection', $$[
        {"type":"instruction","text":"Reflect on your comfort level raising ethical concerns. Do you hesitate because you fear conflict or because you feel you lack authority? Write the reason, then write the standard you will follow anyway."},
        {"type":"instruction","text":"Then reflect on your personal ethical line. Name one AI practice you will never do in the workplace (for example, sharing confidential data, faking citations, or letting biased output drive decisions without review)."}
      ]$$),

      (6,'professional_upgrade','Professional Upgrade', $$[
        {"type":"callout","text":"Ethical operators are trusted faster because they protect the organization’s future."},
        {"type":"facilitator_script","text":"When you can move fast without causing harm, leaders see you as a high-trust performer. Responsible AI use is not optional in modern workplaces — it is a career durability skill."}
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
      ('decision_challenge',1,'Why is ethical judgment a “workflow skill” in AI-enabled organizations?','open_ended', $$null$$,
        $$["Explain where ethics shows up (data, output, decisions).","Explain why harm is often invisible at first.","Explain how documentation and guardrails protect outcomes."]$$),
      ('decision_challenge',2,'Which response best balances speed and ethics when AI screening appears biased?','multiple_choice', $$[
        {"label":"A","text":"Ignore it because the model is efficient."},
        {"label":"B","text":"Reject AI entirely and stop using it."},
        {"label":"C","text":"Flag the risk, propose an audit/validation step, and recommend a safer workflow with human review."},
        {"label":"D","text":"Post about it publicly to force change."}
      ]$$,
        $$["Which option protects people and the company?","Which option is constructive internally?","Which option preserves speed with guardrails?"]$$),
      ('decision_challenge',3,'Which practice is most responsible when using AI with sensitive information?','multiple_choice', $$[
        {"label":"A","text":"Paste confidential data into any tool to get faster output."},
        {"label":"B","text":"Use approved tools, minimize data shared, and document assumptions and outputs used for decisions."},
        {"label":"C","text":"Let AI decide because it is objective."},
        {"label":"D","text":"Hide AI use to avoid questions."}
      ]$$,
        $$["What protects privacy?","What protects compliance?","What protects trust if questioned later?"]$$),
      ('reflection',1,'What makes you hesitate to raise ethical concerns, and what standard will you follow anyway?','open_ended', $$null$$,
        $$["Name the fear honestly.","Write your standard as a rule.","Describe how you will raise concerns calmly and constructively."]$$),
      ('reflection',2,'Name one AI practice you will never do in the workplace, and explain why.','open_ended', $$null$$,
        $$["Make it clear and enforceable.","Tie it to trust and risk.","Describe what you will do instead."]$$)
  ) AS e(section_type, sort_order, question, question_type, options, thinking_prompts)
    ON e.section_type = sl.section_type
  RETURNING id
)

SELECT
  (SELECT count(*) FROM del_day) AS days_deleted,
  (SELECT count(*) FROM ins_day) AS days_inserted,
  (SELECT count(*) FROM ins_sections) AS sections_inserted,
  (SELECT count(*) FROM ins_exercises) AS exercises_inserted;