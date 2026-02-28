-- ============================================================
-- Day 9 — Validating AI Output Like a Pro (ContentBlock format)
-- program_id: 7da8d569-d5a3-47d8-9101-e8142b44822e
-- ============================================================

WITH
params AS (SELECT '7da8d569-d5a3-47d8-9101-e8142b44822e'::uuid AS program_id, 9::int AS day_number),

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
    'Validating AI Output Like a Pro'::text,
    'Trust is earned through verification.'::text,
    jsonb_build_object(
      'objective',
      'By the end of today, you will learn how to validate AI output for accuracy, assumptions, tone, and risk so you can move fast without forwarding mistakes into stakeholders, systems, or decisions.'
    ),
    to_jsonb(ARRAY['reality_briefing','workplace_scenario','decision_challenge','artifact_creation','reflection','professional_upgrade']),
    'AI can draft. You must verify.'::text,
    jsonb_build_object('behaviors', jsonb_build_array(
      'I validate facts, assumptions, and definitions before using AI output in decisions.',
      'I check tone and stakeholder impact before sending AI-assisted communication.',
      'I flag uncertainty early and escalate risk instead of hiding it.'
    )),
    jsonb_build_object('outcomes', jsonb_build_array(
      'You create a Validation Checklist you can apply in under 3 minutes.',
      'You produce a Verified vs Unverified rewrite of an AI output sample.',
      'You build a professional habit: speed with protection.'
    )),
    jsonb_build_object('close', jsonb_build_array(
      'AI output is not truth. It is a draft.',
      'Validation is how you protect trust while moving fast.',
      'Tomorrow, you will learn how to translate AI output into business impact.'
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
        {"type":"mapping","text":"AI can sound confident. AI can summarize fast. AI can propose conclusions. AI can fill gaps. But: AI does NOT guarantee accuracy. AI does NOT reveal assumptions. AI does NOT own consequences. Humans do."},
        {"type":"facilitator_script","text":"The most common failure in AI workplaces is not using AI. It is forwarding AI output without verification. That is how small errors become public mistakes, and public mistakes destroy trust."},
        {"type":"teaching_moment","title":"The 4-Check Rule","text":"Validate facts, expose assumptions, check tone, and assess risk. If you do these four checks, you can move fast without becoming careless."}
      ]$$),

      (2,'workplace_scenario','Workplace Scenario', $$[
        {"type":"scenario_setup","text":"You use AI to draft an executive summary. It includes a confident claim about performance improvement, but the number is slightly wrong and the wording implies certainty that you cannot prove."},
        {"type":"manager_quote","text":"If leadership repeats this and it’s wrong, we lose credibility. Did you verify it?"},
        {"type":"narrative","text":"This is the moment that separates tool-users from operators: operators validate before visibility."}
      ]$$),

      (3,'decision_challenge','Decision Challenge', $$[
        {"type":"challenge","text":"Decide whether your default is speed or credibility. You must choose a validation process you can execute quickly so you never forward unverified claims, misleading tone, or risky assumptions to stakeholders."},
        {"type":"instruction","text":"Apply the 4-Check Rule to the output: what facts require proof, what assumptions are hidden, what tone could damage trust, and what risk requires escalation?"}
      ]$$),

      (4,'artifact_creation','Artifact Creation', $$[
        {"type":"assignment","title":"3-Minute Validation Checklist","structure":[
          "Write your fact-check rule: what you verify every time.",
          "Write your assumption rule: what you must surface or qualify.",
          "Write your tone rule: what must match the relationship and audience.",
          "Write your risk rule: when you escalate, not hide.",
          "Rewrite one AI output paragraph using verified language (clear qualifiers where needed)."
        ],"length":"Checklist + 1 rewrite"},
        {"type":"skills_trained","items":["verification","risk awareness","communication","accuracy","professional judgment"]}
      ]$$),

      (5,'reflection','Reflection', $$[
        {"type":"instruction","text":"Reflect on why people skip validation. Is it urgency, confidence in the tool, fear of slowing down, or lack of a process? Name the reason and write how your new checklist removes that excuse."},
        {"type":"instruction","text":"Then reflect on reputation: what kind of professional do you want to be known as — fast and risky, or fast and trusted? Write your answer as a non-negotiable standard."}
      ]$$),

      (6,'professional_upgrade','Professional Upgrade', $$[
        {"type":"callout","text":"Speed without verification is not performance. It is risk."},
        {"type":"facilitator_script","text":"When you validate consistently, leaders trust your work and stop double-checking you. That trust increases your speed long-term because you get more autonomy, better projects, and higher visibility with less friction."}
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
      ('decision_challenge',1,'What are the four checks you must run before using AI output in decisions or stakeholder communication?','open_ended', $$null$$,
        $$["List the checks in your own words.","Explain why each protects trust.","Give an example of failure if one is skipped."]$$),
      ('decision_challenge',2,'Which is the best example of “verified language” in an executive summary?','multiple_choice', $$[
        {"label":"A","text":"“This will definitely increase revenue by 20%.”"},
        {"label":"B","text":"“The AI says revenue will increase, so we’re good.”"},
        {"label":"C","text":"“Based on the current dataset and assumptions, we estimate a 15–20% lift; we will validate with X before final commitment.”"},
        {"label":"D","text":"“Revenue will probably go up a lot.”"}
      ]$$,
        $$["Where are assumptions acknowledged?","Where is uncertainty handled responsibly?","Where is the next validation step named?"]$$),
      ('decision_challenge',3,'When should you escalate instead of sending AI-assisted output forward?','multiple_choice', $$[
        {"label":"A","text":"When you are 100% sure it is accurate."},
        {"label":"B","text":"When the tone is perfect but facts are unknown."},
        {"label":"C","text":"When the output affects high-stakes decisions, reputation, compliance, or customer trust and verification is incomplete."},
        {"label":"D","text":"Only when your manager asks you to."}
      ]$$,
        $$["What makes a situation high-stakes?","What is the cost of being wrong publicly?","What does responsible escalation sound like?"]$$),
      ('reflection',1,'Why do you personally skip validation sometimes, and what will your new checklist change?','open_ended', $$null$$,
        $$["Name the real reason (urgency, fear, confidence, habit).","Explain how a 3-minute process removes the excuse.","Describe when you will run it (trigger)."]$$),
      ('reflection',2,'Write your non-negotiable standard for AI-assisted work in one sentence.','open_ended', $$null$$,
        $$["Make it short and enforceable.","Include verification + ownership.","Write it like a rule you will follow under pressure."]$$)
  ) AS e(section_type, sort_order, question, question_type, options, thinking_prompts)
    ON e.section_type = sl.section_type
  RETURNING id
)

SELECT
  (SELECT count(*) FROM del_day) AS days_deleted,
  (SELECT count(*) FROM ins_day) AS days_inserted,
  (SELECT count(*) FROM ins_sections) AS sections_inserted,
  (SELECT count(*) FROM ins_exercises) AS exercises_inserted;