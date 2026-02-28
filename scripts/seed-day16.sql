-- ============================================================
-- Day 16 — Influence Without Title in Hybrid Teams (ContentBlock format)
-- program_id: 7da8d569-d5a3-47d8-9101-e8142b44822e
-- ============================================================

WITH
params AS (
  SELECT '7da8d569-d5a3-47d8-9101-e8142b44822e'::uuid AS program_id, 16::int AS day_number
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
    'Influence Without Title in Hybrid Teams'::text,
    'Leadership is behavior before it is position.'::text,

    jsonb_build_object(
      'objective',
      'By the end of today, you will learn how to influence outcomes in AI-enabled workplaces without formal authority by using clarity, reliability, decision framing, and trust behaviors that make people follow your direction.'
    ),

    to_jsonb(ARRAY['reality_briefing','workplace_scenario','decision_challenge','artifact_creation','reflection','professional_upgrade']),

    'If people move because of you, you are leading.'::text,

    jsonb_build_object('behaviors', jsonb_build_array(
      'I influence through clarity and decision framing, not ego or position.',
      'I build alignment by making work easier for others and reducing uncertainty.',
      'I earn followership by being consistent, helpful, and accountable in hybrid workflows.'
    )),

    jsonb_build_object('outcomes', jsonb_build_array(
      'You create an Influence Playbook: how you lead without title in meetings, async, and AI-enabled workflows.',
      'You practice decision-framing language that increases alignment and action.',
      'You leave with a repeatable influence habit that works in any team.'
    )),

    jsonb_build_object('close', jsonb_build_array(
      'Influence is not charisma; it is contribution plus clarity.',
      'Your career accelerates when people trust your direction.',
      'Tomorrow, you will learn ethical judgment and responsible escalation as a leadership trait.'
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
        {"type":"mapping","text":"AI increases speed. AI increases volume. AI can make output look authoritative. But: AI does NOT create alignment. AI does NOT influence people. AI does NOT build trust. Humans do."},
        {"type":"facilitator_script","text":"In hybrid workplaces, leadership is not reserved for managers. Teams follow the person who brings clarity, reduces confusion, and moves the work forward responsibly. Influence is the ability to create direction people choose to follow, even when you do not have a title."},
        {"type":"teaching_moment","title":"Influence = Reduced Friction","text":"People follow you when you reduce friction: you clarify the ask, surface risks early, and make decisions easier for the team to execute."}
      ]$$),

      (2,'workplace_scenario','Workplace Scenario', $$[
        {"type":"scenario_setup","text":"Your team is using AI to generate options for a customer rollout. The AI produced multiple conflicting recommendations, and the team is stuck debating details without a decision path."},
        {"type":"manager_quote","text":"We’re going in circles. Someone needs to propose a decision path so we can move."},
        {"type":"narrative","text":"You do not need authority to lead here. You need clarity. If you can frame the decision, propose options, and create alignment, you become the person the team follows."}
      ]$$),

      (3,'decision_challenge','Decision Challenge', $$[
        {"type":"challenge","text":"Decide how you will lead without title in a moment of confusion. You must propose a decision path that respects others, includes risk awareness, and turns debate into action."},
        {"type":"instruction","text":"Use an influence structure: state the goal, summarize options, name tradeoffs, recommend a path, and define the next step with owner and time."}
      ]$$),

      (4,'artifact_creation','Artifact Creation', $$[
        {"type":"assignment","title":"Influence Playbook","structure":[
          "Write how you influence in meetings (what you say and how you frame decisions).",
          "Write how you influence asynchronously (updates, clarity, next steps).",
          "Write how you influence in AI workflows (validation, risk framing, decision memos).",
          "Write 3 phrases you will use to create alignment without sounding controlling.",
          "Write 1 habit you will practice daily to increase trust and influence."
        ],"length":"12–16 sentences"},
        {"type":"skills_trained","items":["influence","decision framing","alignment","communication","leadership behavior"]}
      ]$$),

      (5,'reflection','Reflection', $$[
        {"type":"instruction","text":"Reflect on whether you equate leadership with title. Identify a moment where you could have influenced an outcome earlier by bringing clarity, but you stayed quiet. Describe what you will do differently next time."},
        {"type":"instruction","text":"Then reflect on language. Influence is often one sentence: the sentence that turns confusion into direction. Write your influence sentence for your own career: what you will say when a team is stuck."}
      ]$$),

      (6,'professional_upgrade','Professional Upgrade', $$[
        {"type":"callout","text":"Leadership begins the moment you create direction other people can act on."},
        {"type":"facilitator_script","text":"When you influence without title, leaders notice because you reduce their burden. You become the person who stabilizes the team under speed, ambiguity, and AI-driven complexity."}
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
      ('decision_challenge',1,'What does “influence without title” mean in an AI-enabled workplace, and why does it matter?','open_ended', $$null$$,
        $$["Define influence as behavior, not authority.","Explain how hybrid teams create ambiguity.","Explain how clarity and trust create followership."]$$),
      ('decision_challenge',2,'Which action most effectively creates influence when a team is stuck?','multiple_choice', $$[
        {"label":"A","text":"Wait for the manager to decide."},
        {"label":"B","text":"Push your opinion loudly so people listen."},
        {"label":"C","text":"Frame the goal, summarize options, name tradeoffs, recommend a path, and define next steps."},
        {"label":"D","text":"Copy the AI output into chat and ask everyone to read it."}
      ]$$,
        $$["What reduces friction?","What converts debate into action?","What signals leadership behavior?"]$$),
      ('decision_challenge',3,'Which sentence is most aligned with leadership influence without title?','multiple_choice', $$[
        {"label":"A","text":"“I think we should do this because I’m right.”"},
        {"label":"B","text":"“Can everyone just decide already?”"},
        {"label":"C","text":"“Here are the options and tradeoffs. I recommend Option B because it aligns with our goal and reduces risk. Next step: X owner by Y date.”"},
        {"label":"D","text":"“AI says Option A, so we should follow it.”"}
      ]$$,
        $$["Which option shows clarity + ownership?","Which option respects others while creating direction?","Which option reduces uncertainty?"]$$),
      ('reflection',1,'Describe one moment you stayed quiet but could have influenced an outcome with clarity. What will you do next time?','open_ended', $$null$$,
        $$["Name the situation.","Describe what you would say now.","Describe the result you expect."]$$),
      ('reflection',2,'Write your “influence sentence” that turns confusion into direction.','open_ended', $$null$$,
        $$["Make it short and actionable.","Include a recommendation and next step.","Keep the tone calm and professional."]$$)
  ) AS e(section_type, sort_order, question, question_type, options, thinking_prompts)
    ON e.section_type = sl.section_type
  RETURNING id
)

SELECT
  (SELECT count(*) FROM del_day) AS days_deleted,
  (SELECT count(*) FROM ins_day) AS days_inserted,
  (SELECT count(*) FROM ins_sections) AS sections_inserted,
  (SELECT count(*) FROM ins_exercises) AS exercises_inserted;