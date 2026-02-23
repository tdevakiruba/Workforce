-- ============================================================
-- Day 20 — Workplace Simulation: Hybrid Team Decision Lab (ContentBlock format)
-- program_id: 7da8d569-d5a3-47d8-9101-e8142b44822e
-- ============================================================

WITH
params AS (
  SELECT '7da8d569-d5a3-47d8-9101-e8142b44822e'::uuid AS program_id, 20::int AS day_number
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
    'Workplace Simulation: Hybrid Team Decision Lab'::text,
    'AI suggests. Humans decide.'::text,

    jsonb_build_object(
      'objective',
      'By the end of today, you will run a complete workplace decision simulation using AI output, validation, risk escalation, and executive communication to prove you can operate inside AI-enabled teams under speed and ambiguity.'
    ),

    to_jsonb(ARRAY['reality_briefing','workplace_scenario','decision_challenge','artifact_creation','reflection','professional_upgrade']),

    'Your job is not to accept AI. Your job is to decide responsibly.'::text,

    jsonb_build_object('behaviors', jsonb_build_array(
      'I validate AI recommendations before decisions and communicate uncertainty early.',
      'I identify risks and escalate constructively with options and mitigation steps.',
      'I deliver a clear recommendation with next steps, owner, timeline, and success metrics.'
    )),

    jsonb_build_object('outcomes', jsonb_build_array(
      'You complete a Decision Lab run using a scenario, AI output, and a human decision path.',
      'You produce a Decision Memo + Risk Note + Executive Summary from the simulation.',
      'You strengthen your ability to operate under speed without losing responsibility.'
    )),

    jsonb_build_object('close', jsonb_build_array(
      'Your ability to decide is your competitive advantage.',
      'Tomorrow you will finalize certification and build your next 90-day trajectory plan.',
      'Your career operating system continues beyond this program.'
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
        {"type":"mapping","text":"AI can propose options. AI can recommend actions. AI can produce confident reasoning. But: AI does NOT hold responsibility. AI does NOT defend decisions in meetings. AI does NOT absorb consequences. Humans do."},
        {"type":"facilitator_script","text":"Today is a simulation of the real workplace. You will receive AI output, but your job is to validate it, identify risk, decide responsibly, and communicate to leadership with clarity. This is what employers actually need in the AI era."},
        {"type":"teaching_moment","title":"Decision Lab Rules","text":"You must produce three things: a recommendation, a risk scan, and a communication to leadership. Speed matters, but trust matters more."}
      ]$$),

      (2,'workplace_scenario','Workplace Scenario', $$[
        {"type":"scenario_setup","text":"Scenario: A customer support AI suggests a workflow change that would reduce handle time by 25%, but it may increase incorrect resolutions and trigger customer complaints. Leadership wants speed and cost reduction."},
        {"type":"manager_quote","text":"If this saves time, we should ship it. What’s your recommendation and what could go wrong?"},
        {"type":"narrative","text":"This scenario forces you to balance speed with trust. Your job is to propose an approach that protects customers and reputation while still improving performance."}
      ]$$),

      (3,'decision_challenge','Decision Challenge', $$[
        {"type":"challenge","text":"Decide how you will handle the recommendation like an operator. You must validate assumptions, identify reputational risk, propose a pilot with monitoring, and define rollback criteria so leadership can move fast safely."},
        {"type":"instruction","text":"Use the operator chain: AI insight → human validation → risk scan → decision memo → executive communication → monitoring plan."}
      ]$$),

      (4,'artifact_creation','Artifact Creation', $$[
        {"type":"assignment","title":"Decision Lab Deliverables (Simulation Pack)","structure":[
          "Decision Memo (options, tradeoffs, recommendation).",
          "Risk Note (top risks + mitigation + rollback criteria).",
          "Executive Summary (headline recommendation + next steps + metric).",
          "Monitoring Plan (what you watch weekly).",
          "Pilot Design (scope, duration, success criteria)."
        ],"length":"3–5 deliverables (each 6–10 sentences)"},
        {"type":"skills_trained","items":["simulation","decision-making","risk escalation","executive communication","operational thinking"]}
      ]$$),

      (5,'reflection','Reflection', $$[
        {"type":"instruction","text":"Reflect on where you felt pressure to move fast at the expense of safety. Describe how you handled that pressure, and what you will do better next time."},
        {"type":"instruction","text":"Then reflect on your decision confidence. Confidence is not certainty; it is clarity plus responsibility. Write the sentence you would say to leadership when uncertainty exists but action is still needed."}
      ]$$),

      (6,'professional_upgrade','Professional Upgrade', $$[
        {"type":"callout","text":"Decision ability is the fastest path to trust in AI-enabled workplaces."},
        {"type":"facilitator_script","text":"When you can decide responsibly under speed, leaders see you as someone who can be trusted with bigger work. This simulation is not practice — it is proof of the operating system you just built."}
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
      ('decision_challenge',1,'What validation steps are required before approving an AI-suggested workflow change?','open_ended', $$null$$,
        $$["Name what you would verify (assumptions, accuracy, customer impact).","Describe how you would test quickly (pilot).","Describe what evidence would make you approve or reject."]$$),
      ('decision_challenge',2,'Which pilot design best balances speed and safety?','multiple_choice', $$[
        {"label":"A","text":"Full rollout immediately to capture benefits."},
        {"label":"B","text":"No rollout until every risk is eliminated."},
        {"label":"C","text":"Controlled pilot with monitoring metrics, customer safeguards, and clear rollback criteria."},
        {"label":"D","text":"Let AI decide who receives the change with no oversight."}
      ]$$,
        $$["Why is controlled scope safer?","What metrics prove success or harm?","What rollback criteria protect reputation?"]$$),
      ('decision_challenge',3,'Which executive message is most decision-ready?','multiple_choice', $$[
        {"label":"A","text":"Here is the AI report. Please review."},
        {"label":"B","text":"We should do it because AI says it will save time."},
        {"label":"C","text":"Recommendation: run a 2-week pilot in Segment X with monitoring. Benefit: lower handle time. Risk: incorrect resolutions. Safeguard: human review + rollback criteria. Next step: approve pilot today."},
        {"label":"D","text":"I’m not sure. We should wait."}
      ]$$,
        $$["Which message includes recommendation + risk + mitigation?","Which reduces leadership burden?","Which makes next steps clear?"]$$),
      ('reflection',1,'Where did you feel pressure to move fast, and how did you protect trust anyway?','open_ended', $$null$$,
        $$["Describe the pressure point.","Describe your protective step (validation, pilot, escalation).","Describe what you will improve next time."]$$),
      ('reflection',2,'Write the sentence you would say to leadership when uncertainty exists but action is still required.','open_ended', $$null$$,
        $$["Make it calm and confident.","Include a validation step.","Include what you recommend now."]$$)
  ) AS e(section_type, sort_order, question, question_type, options, thinking_prompts)
    ON e.section_type = sl.section_type
  RETURNING id
)

SELECT
  (SELECT count(*) FROM del_day) AS days_deleted,
  (SELECT count(*) FROM ins_day) AS days_inserted,
  (SELECT count(*) FROM ins_sections) AS sections_inserted,
  (SELECT count(*) FROM ins_exercises) AS exercises_inserted;