-- ============================================================
-- Day 6 — Reliability Builds Trust in Hybrid Teams (ContentBlock format)
-- program_id: 7da8d569-d5a3-47d8-9101-e8142b44822e
-- ============================================================

WITH
params AS (
  SELECT '7da8d569-d5a3-47d8-9101-e8142b44822e'::uuid AS program_id, 6::int AS day_number
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
    'Reliability Builds Trust in Hybrid Teams'::text,
    'Trust is built through consistency, not intelligence.'::text,
    jsonb_build_object(
      'objective',
      'By the end of today, you will understand how reliability drives credibility in AI-enabled workplaces and how consistent execution becomes a leadership signal that accelerates your opportunities early.'
    ),
    to_jsonb(ARRAY['reality_briefing','workplace_scenario','decision_challenge','artifact_creation','reflection','professional_upgrade']),
    'Reliability is the trust engine of hybrid teams.'::text,
    jsonb_build_object('behaviors', jsonb_build_array(
      'I deliver consistently with clear timelines and proactive communication, not just occasional brilliance.',
      'I verify AI-assisted work before it moves forward because my name is attached to outcomes.',
      'I build trust by being predictable in quality, clarity, and follow-through under pressure.'
    )),
    jsonb_build_object('outcomes', jsonb_build_array(
      'You create a Reliability Operating Standard that defines how you meet deadlines, communicate progress, and protect quality.',
      'You understand why leaders trust consistent operators more than talented but unpredictable contributors.',
      'You leave with a repeatable reliability routine you can apply in any AI-enabled workplace.'
    )),
    jsonb_build_object('close', jsonb_build_array(
      'Reliability is not a personality trait; it is a professional operating choice.',
      'In AI-powered workplaces, speed is common — dependability is rare.',
      'Tomorrow, you will learn how to work effectively with humans and machines as one system.'
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
        {"type":"mapping","text":"AI increases speed. AI accelerates output. AI can reduce manual work. AI can make results look polished. But: AI does NOT build trust. AI does NOT create consistency. AI does NOT earn credibility. Humans do."},
        {"type":"facilitator_script","text":"In AI-enabled workplaces, leaders stop rewarding people who only move fast and start rewarding people they can depend on. Reliability makes leaders delegate to you without fear because they know you will deliver, communicate, and protect quality even when automation is moving quickly."},
        {"type":"teaching_moment","title":"Reliability = Leadership Signal","text":"When your work is predictable in quality and timeline, you reduce management overhead and risk. That makes you valuable, and value earns responsibility."}
      ]$$),

      (2,'workplace_scenario','Workplace Scenario', $$[
        {"type":"scenario_setup","text":"Two new hires deliver similar AI-assisted output, but one becomes the leader’s go-to because they always clarify expectations, hit deadlines, and validate AI output before it reaches stakeholders."},
        {"type":"manager_quote","text":"I don’t need the fastest person. I need the person I can trust with the outcome."},
        {"type":"narrative","text":"Reliability becomes a competitive advantage because leaders route higher-visibility work to the person who reduces uncertainty and prevents surprise problems."}
      ]$$),

      (3,'decision_challenge','Decision Challenge', $$[
        {"type":"challenge","text":"Decide whether you want to be known as “fast” or “dependable.” In AI workplaces, speed is common. Reliability is rare. Your reputation will be built by whether people can predict your follow-through under pressure."},
        {"type":"instruction","text":"Choose the standard you will operate by when deadlines are tight: validate the output, communicate status early, and protect quality, even if it takes extra discipline."}
      ]$$),

      (4,'artifact_creation','Artifact Creation', $$[
        {"type":"assignment","title":"Reliability Operating Standard","structure":[
          "Write how you confirm the ask (what success looks like).",
          "Write how you set timelines and checkpoints (no surprises).",
          "Write how you communicate progress (early + clear).",
          "Write how you validate AI-assisted output (facts, tone, context).",
          "Write how you deliver final work (ownership + quality)."
        ],"length":"10–14 sentences"},
        {"type":"skills_trained","items":["reliability","execution discipline","communication","quality control","stakeholder trust"]}
      ]$$),

      (5,'reflection','Reflection', $$[
        {"type":"instruction","text":"Reflect on whether your default pattern is consistency or intensity. Do you deliver predictably, or do you deliver in bursts that create uncertainty? Name one habit you will practice daily for the next 14 days to become more reliable."},
        {"type":"instruction","text":"Then name your biggest reliability threat: procrastination, overcommitting, unclear communication, perfectionism, or rushing. Write what you will do before the threat shows up so it does not control your outcomes."}
      ]$$),

      (6,'professional_upgrade','Professional Upgrade', $$[
        {"type":"callout","text":"Reliability builds trust faster than talent builds admiration."},
        {"type":"facilitator_script","text":"In AI-powered teams, accountability is expected. Reliability is respected. When leaders can predict your quality and follow-through, they give you more responsibility because they feel safe delegating to you."}
      ]$$)
  ) AS s(sort_order, section_type, title, content)
  RETURNING id, section_type
),

section_lookup AS (
  SELECT id AS section_id, section_type FROM ins_sections
),

ins_exercises AS (
  INSERT INTO public."wf-curriculum_exercises" (section_id, sort_order, question, question_type, options, thinking_prompts)
  SELECT sl.section_id, e.sort_order, e.question, e.question_type, e.options::jsonb, e.thinking_prompts::jsonb
  FROM section_lookup sl
  JOIN (
    VALUES
      ('decision_challenge',1,'In an AI-enabled workplace, why does reliability accelerate your career faster than raw speed?','open_ended', $$null$$,
        $$["Explain how reliability reduces risk and management overhead.","Describe how predictability changes what leaders delegate to you.","Give one example of reliability preventing a stakeholder issue."]$$),
      ('decision_challenge',2,'Which behavior most strongly signals reliability in hybrid human + AI workflows?','multiple_choice', $$[
        {"label":"A","text":"Delivering fast output even if quality varies."},
        {"label":"B","text":"Waiting for instructions so you never make mistakes."},
        {"label":"C","text":"Meeting deadlines consistently, validating AI-assisted output, and communicating proactively."},
        {"label":"D","text":"Only taking tasks you already know how to do."}
      ]$$,
        $$["What makes leaders feel safe delegating to you?","Where does AI increase the risk of careless forwarding?","What behavior reduces confusion for stakeholders?"]$$),
      ('decision_challenge',3,'You have a tight deadline and AI produced a polished deliverable. What is the most professional next step?','multiple_choice', $$[
        {"label":"A","text":"Send immediately to save time."},
        {"label":"B","text":"Skim quickly for spelling and send."},
        {"label":"C","text":"Validate assumptions, check accuracy and tone, confirm context alignment, then send with ownership."},
        {"label":"D","text":"Avoid AI next time to eliminate risk."}
      ]$$,
        $$["What is the cost of one unverified assumption?","How do you balance speed with responsibility?","What does ownership look like at the point of sending?"]$$),
      ('reflection',1,'Identify one reliability habit you will practice daily for the next 14 days, and define how you will measure success.','open_ended', $$null$$,
        $$["What exact behavior will you repeat daily?","What proof will show you did it?","How will this habit change how leaders experience working with you?"]$$),
      ('reflection',2,'What is your biggest reliability risk, and how will you reduce it?','open_ended', $$null$$,
        $$["Name the pattern honestly.","Describe the trigger.","Describe one preventive action you will take before it happens."]$$)
  ) AS e(section_type, sort_order, question, question_type, options, thinking_prompts)
    ON e.section_type = sl.section_type
  RETURNING id
)

SELECT
  (SELECT count(*) FROM del_day) AS days_deleted,
  (SELECT count(*) FROM ins_day) AS days_inserted,
  (SELECT count(*) FROM ins_sections) AS sections_inserted,
  (SELECT count(*) FROM ins_exercises) AS exercises_inserted;