-- ============================================================
-- Day 15 — Trust as Career Currency (ContentBlock format)
-- program_id: 7da8d569-d5a3-47d8-9101-e8142b44822e
-- ============================================================

WITH
params AS (
  SELECT '7da8d569-d5a3-47d8-9101-e8142b44822e'::uuid AS program_id, 15::int AS day_number
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
    'Trust as Career Currency'::text,
    'Trust accelerates careers faster than talent alone.'::text,

    jsonb_build_object(
      'objective',
      'By the end of today, you will understand how trust compounds in AI-enabled workplaces and how daily behaviors like reliability, clarity, and ownership shape your reputation and advancement speed.'
    ),

    to_jsonb(ARRAY['reality_briefing','workplace_scenario','decision_challenge','artifact_creation','reflection','professional_upgrade']),

    'Trust is the multiplier. Everything else is secondary.'::text,

    jsonb_build_object('behaviors', jsonb_build_array(
      'I build trust through consistent reliability, clarity, and follow-through.',
      'I protect trust by validating AI-assisted work and communicating uncertainty early.',
      'I earn reputation by owning outcomes and reducing leadership burden.'
    )),

    jsonb_build_object('outcomes', jsonb_build_array(
      'You create a Trust-Building Strategy with daily and weekly behaviors that compound credibility.',
      'You understand why equally talented people advance at different speeds: trust signals.',
      'You leave with a plan to intentionally build reputation in AI-enabled workplaces.'
    )),

    jsonb_build_object('close', jsonb_build_array(
      'Trust is what leaders spend when they delegate responsibility.',
      'Your habits either compound trust or create doubt.',
      'Tomorrow, you enter the next level: leadership trajectory and influence without title.'
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
        {"type":"mapping","text":"AI increases speed. AI enhances productivity. AI supports accuracy. AI streamlines communication. But: AI does NOT build reputation. AI does NOT earn credibility. AI does NOT establish trust. Humans do."},
        {"type":"facilitator_script","text":"In fast AI-enabled environments, people form opinions quickly. Trust is the silent scorecard leaders use when deciding who gets visibility, who gets autonomy, and who gets promoted. Skill can get you hired, but trust determines how far and how fast you go."},
        {"type":"teaching_moment","title":"Trust Compounds","text":"Trust is built through small consistent behaviors: meeting commitments, communicating early, validating AI-assisted work, and owning outcomes. These behaviors compound into reputation, and reputation becomes opportunity."}
      ]$$),

      (2,'workplace_scenario','Workplace Scenario', $$[
        {"type":"scenario_setup","text":"Two employees produce equally strong AI-assisted outputs. Over time, leadership entrusts one with more strategic projects because they consistently demonstrate reliability, judgment, and proactive communication while the other creates occasional surprises."},
        {"type":"manager_quote","text":"I trust them with high-stakes work because I don’t have to worry about surprises."},
        {"type":"narrative","text":"Trust is the differentiator. In AI workplaces, output is easier than ever. Reputation is harder than ever, and that is why it matters more."}
      ]$$),

      (3,'decision_challenge','Decision Challenge', $$[
        {"type":"challenge","text":"Decide what trust behaviors you will practice intentionally. Your career will accelerate if leaders experience you as low-risk, high-ownership, and clear. Your career will stall if leaders experience you as unpredictable, unclear, or careless with AI output."},
        {"type":"instruction","text":"Write your trust strategy as behaviors you can repeat weekly: how you communicate, validate, follow through, and escalate risk."}
      ]$$),

      (4,'artifact_creation','Artifact Creation', $$[
        {"type":"assignment","title":"Trust-Building Strategy","structure":[
          "Write 3 daily trust behaviors you will practice.",
          "Write 2 weekly trust behaviors (status clarity, validation routine, stakeholder check).",
          "Write 1 behavior for handling mistakes (own fast, correct fast, learn fast).",
          "Write 1 behavior for handling uncertainty (flag early, propose options).",
          "Write how you will measure trust growth (feedback, autonomy, responsibility)."
        ],"length":"12–16 sentences"},
        {"type":"skills_trained","items":["trust-building","reputation management","communication","ownership","risk awareness"]}
      ]$$),

      (5,'reflection','Reflection', $$[
        {"type":"instruction","text":"Reflect on whether your current behaviors build trust incrementally or create uncertainty. Identify one behavior that creates doubt (late updates, vague communication, rushing) and write the behavior that will replace it immediately."},
        {"type":"instruction","text":"Then reflect on speed. In AI workplaces, pressure is constant. Write how you will protect trust under speed: what rule you will never break even when deadlines are tight."}
      ]$$),

      (6,'professional_upgrade','Professional Upgrade', $$[
        {"type":"callout","text":"Trust is the ultimate career multiplier in the AI era."},
        {"type":"facilitator_script","text":"When you earn trust early, you accelerate faster than those who rely on talent alone. Leaders invest in people who protect outcomes, because outcomes protect the business. Trust is how your career moves from potential to trajectory."}
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
      ('decision_challenge',1,'Why does trust accelerate careers faster than talent alone in AI-enabled workplaces?','open_ended', $$null$$,
        $$["Explain how trust affects delegation and autonomy.","Explain how AI makes output common.","Explain how trust reduces leadership burden."]$$),
      ('decision_challenge',2,'Which behavior most strongly builds trust in hybrid teams?','multiple_choice', $$[
        {"label":"A","text":"Delivering fast output even if it sometimes creates surprises."},
        {"label":"B","text":"Avoiding responsibility so you never make mistakes."},
        {"label":"C","text":"Consistent follow-through, proactive communication, validation of AI-assisted work, and ownership of outcomes."},
        {"label":"D","text":"Talking confidently about AI tools without evidence."}
      ]$$,
        $$["What makes leaders feel safe?","What reduces surprises?","How does validation protect trust?"]$$),
      ('decision_challenge',3,'What is the best response when you realize AI-assisted output may be wrong and visible soon?','multiple_choice', $$[
        {"label":"A","text":"Stay quiet and hope no one notices."},
        {"label":"B","text":"Blame the AI tool if questioned."},
        {"label":"C","text":"Flag it immediately, correct it, explain impact, and propose a prevention step."},
        {"label":"D","text":"Wait until leadership asks before acting."}
      ]$$,
        $$["Why does speed of ownership matter?","How do you protect reputation through transparency?","What prevention step increases trust?"]$$),
      ('reflection',1,'What is one behavior you currently have that could create doubt, and what will you replace it with?','open_ended', $$null$$,
        $$["Name the behavior honestly.","Write the replacement behavior as a routine.","Explain how it changes how leaders experience you."]$$),
      ('reflection',2,'Write the one rule you will never break under speed pressure to protect trust.','open_ended', $$null$$,
        $$["Make it short.","Include validation or communication.","Make it enforceable under deadlines."]$$)
  ) AS e(section_type, sort_order, question, question_type, options, thinking_prompts)
    ON e.section_type = sl.section_type
  RETURNING id
)

SELECT
  (SELECT count(*) FROM del_day) AS days_deleted,
  (SELECT count(*) FROM ins_day) AS days_inserted,
  (SELECT count(*) FROM ins_sections) AS sections_inserted,
  (SELECT count(*) FROM ins_exercises) AS exercises_inserted;