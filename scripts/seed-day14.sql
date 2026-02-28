-- ============================================================
-- Day 14 — Initiative in Hybrid Teams (ContentBlock format)
-- program_id: 7da8d569-d5a3-47d8-9101-e8142b44822e
-- ============================================================

WITH
params AS (
  SELECT '7da8d569-d5a3-47d8-9101-e8142b44822e'::uuid AS program_id, 14::int AS day_number
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
    'Initiative in Hybrid Teams'::text,
    'High performers do not wait for instruction.'::text,

    jsonb_build_object(
      'objective',
      'By the end of today, you will learn how to identify opportunity in AI-enabled workflows and take proactive action that improves systems, increases efficiency, and signals leadership trajectory.'
    ),

    to_jsonb(ARRAY['reality_briefing','workplace_scenario','decision_challenge','artifact_creation','reflection','professional_upgrade']),

    'Initiative is how you turn visibility into trajectory.'::text,

    jsonb_build_object('behaviors', jsonb_build_array(
      'I look for workflow friction and propose improvements with clarity and evidence.',
      'I take initiative with solutions, not complaints, and I protect trust while changing systems.',
      'I act like an owner by improving outcomes, not just completing tasks.'
    )),

    jsonb_build_object('outcomes', jsonb_build_array(
      'You write an Improvement Proposal that identifies friction and recommends a solution with expected impact.',
      'You learn how to take initiative without overstepping or creating political risk.',
      'You build a repeatable pattern: observe, diagnose, propose, test, improve.'
    )),

    jsonb_build_object('close', jsonb_build_array(
      'Initiative separates contributors from future leaders.',
      'Fixing systems earns trust faster than finishing tasks.',
      'Tomorrow, you will learn why trust is career currency in AI-enabled workplaces.'
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
        {"type":"mapping","text":"AI supports workflows. AI suggests optimizations. AI identifies inefficiencies. AI enhances speed. But: AI does NOT initiate improvement. AI does NOT champion innovation. AI does NOT take ownership of change. Humans do."},
        {"type":"facilitator_script","text":"In hybrid teams, there is always workflow friction: repeated rework, unclear handoffs, inconsistent prompts, missing validation steps, and confusing status updates. High performers don’t complain about friction. They propose improvements that make the system better."},
        {"type":"teaching_moment","title":"Initiative With Safety","text":"Initiative is not doing whatever you want. It is seeing a problem, proposing a responsible fix, and aligning stakeholders so improvement increases speed without creating new risk."}
      ]$$),

      (2,'workplace_scenario','Workplace Scenario', $$[
        {"type":"scenario_setup","text":"You notice AI-generated reports frequently require manual correction before final presentation. The team treats this as normal friction and burns hours every week fixing the same issues."},
        {"type":"manager_quote","text":"We’re always correcting these outputs. If you have ideas to improve it, I’m open."},
        {"type":"narrative","text":"You see an opportunity to refine the prompting framework and add a validation step so the workflow becomes faster and more accurate without increasing risk."}
      ]$$),

      (3,'decision_challenge','Decision Challenge', $$[
        {"type":"challenge","text":"Decide whether you will stay inside your assigned tasks or propose a system improvement that helps the whole team. Taking initiative creates visibility and risk, but it also creates trust if done with clarity and respect."},
        {"type":"instruction","text":"Frame your proposal professionally: define the problem, quantify the cost, propose a solution, suggest a pilot, and name the expected impact."}
      ]$$),

      (4,'artifact_creation','Artifact Creation', $$[
        {"type":"assignment","title":"Improvement Proposal","structure":[
          "Describe the workflow friction in one sentence.",
          "Describe the cost (time, errors, stakeholder impact) in 2–3 sentences.",
          "Propose a solution (prompt template, checklist, handoff step) in 2–3 sentences.",
          "Propose a small pilot and how you will measure success.",
          "Describe the expected impact on speed and quality."
        ],"length":"10–14 sentences"},
        {"type":"skills_trained","items":["initiative","systems thinking","problem solving","stakeholder alignment","process improvement"]}
      ]$$),

      (5,'reflection','Reflection', $$[
        {"type":"instruction","text":"Reflect on whether you tend to focus only on assigned tasks or actively look for ways to improve systems. Name one reason you avoid initiative (fear, uncertainty, politics), then write how you will take a safe step anyway."},
        {"type":"instruction","text":"Then reflect on leadership perception. What initiative behavior would make a leader think, “This person is future leadership”? Describe it as a repeatable habit."}
      ]$$),

      (6,'professional_upgrade','Professional Upgrade', $$[
        {"type":"callout","text":"People who improve systems rise faster than people who only complete tasks."},
        {"type":"facilitator_script","text":"Initiative is a leadership signal because it shows ownership, problem-solving, and courage. When you propose improvements with respect and evidence, you become the person leaders trust with bigger problems."}
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
      ('decision_challenge',1,'What is the difference between “complaining about friction” and “taking initiative” in hybrid teams?','open_ended', $$null$$,
        $$["Describe what complaints sound like.","Describe what initiative looks like (solution + pilot).","Explain why leaders reward initiative."]$$),
      ('decision_challenge',2,'Which approach is the safest, most effective initiative move?','multiple_choice', $$[
        {"label":"A","text":"Make changes quietly without telling anyone."},
        {"label":"B","text":"Tell everyone the system is broken and demand changes."},
        {"label":"C","text":"Propose a small pilot with a clear metric, align your manager, then improve based on results."},
        {"label":"D","text":"Avoid initiative until you have more seniority."}
      ]$$,
        $$["Why does a pilot reduce risk?","Why does alignment matter?","What metric proves the improvement works?"]$$),
      ('decision_challenge',3,'What must be included in a professional improvement proposal?','multiple_choice', $$[
        {"label":"A","text":"A complaint and a list of frustrations."},
        {"label":"B","text":"A solution only, without context."},
        {"label":"C","text":"Problem, cost, solution, pilot/measurement, and expected impact."},
        {"label":"D","text":"A message to leadership blaming the AI tool."}
      ]$$,
        $$["What makes proposals credible?","What makes them actionable?","What helps leadership say yes quickly?"]$$),
      ('reflection',1,'What is one initiative you could take this week in a hybrid team environment, and what is your smallest safe step?','open_ended', $$null$$,
        $$["Name the friction you noticed.","Describe the smallest safe experiment.","Describe what success looks like."]$$),
      ('reflection',2,'What initiative habit would make a leader think you are future leadership, and why?','open_ended', $$null$$,
        $$["Describe the habit.","Explain how it reduces burden for leaders.","Explain how it improves outcomes for the team."]$$)
  ) AS e(section_type, sort_order, question, question_type, options, thinking_prompts)
    ON e.section_type = sl.section_type
  RETURNING id
)

SELECT
  (SELECT count(*) FROM del_day) AS days_deleted,
  (SELECT count(*) FROM ins_day) AS days_inserted,
  (SELECT count(*) FROM ins_sections) AS sections_inserted,
  (SELECT count(*) FROM ins_exercises) AS exercises_inserted;