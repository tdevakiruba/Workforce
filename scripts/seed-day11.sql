-- ============================================================
-- Day 11 — Risk & Escalation in AI-Driven Decisions (ContentBlock format)
-- program_id: 7da8d569-d5a3-47d8-9101-e8142b44822e
-- ============================================================

WITH
params AS (
  SELECT '7da8d569-d5a3-47d8-9101-e8142b44822e'::uuid AS program_id, 11::int AS day_number
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
    'Risk & Escalation in AI-Driven Decisions'::text,
    'Speed increases risk. Professionals manage it.'::text,

    jsonb_build_object(
      'objective',
      'By the end of today, you will learn how to identify risk in AI-generated recommendations and escalate concerns responsibly, using evidence and options, without appearing defensive or resistant to innovation.'
    ),

    to_jsonb(ARRAY['reality_briefing','workplace_scenario','decision_challenge','artifact_creation','reflection','professional_upgrade']),

    'Escalation is not resistance; it is leadership.'::text,

    jsonb_build_object('behaviors', jsonb_build_array(
      'I identify risk early and communicate it clearly using evidence, not emotion.',
      'I escalate responsibly by proposing options, mitigations, and validation steps.',
      'I protect long-term trust and reputation even when short-term speed is tempting.'
    )),

    jsonb_build_object('outcomes', jsonb_build_array(
      'You create a Risk Escalation Note that frames risk with clarity, impact, and action options.',
      'You practice raising concerns without killing momentum or sounding anti-AI.',
      'You build an escalation reflex that protects trust, compliance, and reputation.'
    )),

    jsonb_build_object('close', jsonb_build_array(
      'Risk ignored becomes regret.',
      'Professionals protect the business by escalating early and constructively.',
      'Tomorrow, you will learn how to translate AI output into business impact that leaders can act on.'
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
        {"type":"mapping","text":"AI accelerates decisions. AI identifies patterns quickly. AI increases execution speed. AI suggests confident conclusions. But: AI does NOT evaluate reputational risk. AI does NOT understand political sensitivity. AI does NOT absorb consequences of failure. Humans do."},
        {"type":"facilitator_script","text":"AI output can feel decisive because it is confident and fast, but speed does not remove consequences. When AI recommends a move, your job is to scan for risk the model cannot feel: reputation damage, customer backlash, legal exposure, compliance gaps, and internal stakeholder fallout."},
        {"type":"teaching_moment","title":"Risk is Invisible Until It’s Public","text":"The fastest way to lose trust is to move fast in the wrong direction. Escalation is how professionals protect outcomes without slowing progress unnecessarily."}
      ]$$),

      (2,'workplace_scenario','Workplace Scenario', $$[
        {"type":"scenario_setup","text":"An AI system recommends a bold pricing shift that promises short-term revenue growth. You can see the move might alienate a loyal customer segment and trigger negative brand perception if the change feels unfair or sudden."},
        {"type":"manager_quote","text":"This looks like a big win. Can you support the recommendation so we can move quickly?"},
        {"type":"narrative","text":"You are not being asked to be negative. You are being asked to be responsible. Your job is to protect the business from avoidable damage while keeping momentum alive."}
      ]$$),

      (3,'decision_challenge','Decision Challenge', $$[
        {"type":"challenge","text":"Decide how you will raise concerns without undermining momentum. You must identify the risk clearly, explain why it matters, and recommend a path that includes mitigation or validation so leadership can move forward intelligently rather than blindly."},
        {"type":"instruction","text":"Frame the escalation using a professional structure: risk statement, impact, confidence level, options, and the smallest validation step that protects the decision."}
      ]$$),

      (4,'artifact_creation','Artifact Creation', $$[
        {"type":"assignment","title":"Risk Escalation Note","structure":[
          "Summarize the AI recommendation in one sentence.",
          "State the risk in one sentence (reputation, compliance, trust, fairness, etc.).",
          "Describe the impact if wrong in 2–3 sentences.",
          "Propose 2 options: ‘move with guardrails’ and ‘validate then move.’",
          "Name the smallest validation step and who should approve."
        ],"length":"10–14 sentences"},
        {"type":"skills_trained","items":["risk scanning","escalation","stakeholder communication","judgment","decision framing"]}
      ]$$),

      (5,'reflection','Reflection', $$[
        {"type":"instruction","text":"Reflect on whether you feel comfortable challenging optimistic projections when you detect risk. Identify what makes you hesitate: fear of conflict, fear of looking inexperienced, or pressure to move fast."},
        {"type":"instruction","text":"Then write the sentence you will use to escalate professionally. It must be calm, evidence-based, and focused on protecting outcomes, not criticizing people."}
      ]$$),

      (6,'professional_upgrade','Professional Upgrade', $$[
        {"type":"callout","text":"Escalation is a trust skill, not a personality trait."},
        {"type":"facilitator_script","text":"Professionals who manage risk intelligently are trusted more than those who blindly support aggressive automation. When you escalate with options and mitigation, leaders see you as someone who protects the business while still moving forward."}
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
      ('decision_challenge',1,'Why does speed increase risk in AI-driven decisions, and what risks are most invisible to AI?','open_ended', $$null$$,
        $$["Explain why confidence can be misleading.","List 2–3 risks AI cannot feel (reputation, politics, fairness, trust).","Describe how you would surface the risk without killing momentum."]$$),
      ('decision_challenge',2,'Which escalation approach is most professional in an AI-enabled workplace?','multiple_choice', $$[
        {"label":"A","text":"Say nothing and move forward to avoid conflict."},
        {"label":"B","text":"Reject the AI recommendation as unreliable."},
        {"label":"C","text":"Flag the risk with evidence, propose options, and recommend a small validation step before full rollout."},
        {"label":"D","text":"Escalate emotionally to ensure leadership takes you seriously."}
      ]$$,
        $$["What keeps your tone constructive?","How do options preserve momentum?","What validation step reduces risk fastest?"]$$),
      ('decision_challenge',3,'What is the best “smallest validation step” before a risky AI-recommended change?','multiple_choice', $$[
        {"label":"A","text":"Announce the change broadly and see what happens."},
        {"label":"B","text":"Run a controlled pilot with monitoring metrics and clear rollback criteria."},
        {"label":"C","text":"Ask AI to be more confident."},
        {"label":"D","text":"Wait indefinitely for perfect certainty."}
      ]$$,
        $$["Why is a pilot safer than a full rollout?","What metrics would you monitor?","What rollback criteria protects reputation?"]$$),
      ('reflection',1,'What makes you hesitate to escalate risk, and how will you overcome it?','open_ended', $$null$$,
        $$["Name the fear honestly.","Describe a strategy to stay calm and evidence-based.","Describe how you will frame escalation as protection, not resistance."]$$),
      ('reflection',2,'Write your one-sentence escalation opener that you will use in real meetings.','open_ended', $$null$$,
        $$["Make it calm and direct.","Reference impact and protection.","Include an option or validation step."]$$)
  ) AS e(section_type, sort_order, question, question_type, options, thinking_prompts)
    ON e.section_type = sl.section_type
  RETURNING id
)

SELECT
  (SELECT count(*) FROM del_day) AS days_deleted,
  (SELECT count(*) FROM ins_day) AS days_inserted,
  (SELECT count(*) FROM ins_sections) AS sections_inserted,
  (SELECT count(*) FROM ins_exercises) AS exercises_inserted;