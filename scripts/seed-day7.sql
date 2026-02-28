-- ============================================================
-- Day 7 — Working Effectively with Humans + Machines (ContentBlock format)
-- program_id: 7da8d569-d5a3-47d8-9101-e8142b44822e
-- ============================================================

WITH
params AS (
  SELECT '7da8d569-d5a3-47d8-9101-e8142b44822e'::uuid AS program_id, 7::int AS day_number
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
    'Working Effectively with Humans + Machines'::text,
    'Your future teammates will include both people and intelligent systems.'::text,
    jsonb_build_object(
      'objective',
      'By the end of today, you will learn how to collaborate inside hybrid teams where AI is embedded in the workflow, including how to communicate clearly, keep accountability human, and use automation without damaging trust or alignment.'
    ),
    to_jsonb(ARRAY['reality_briefing','workplace_scenario','decision_challenge','artifact_creation','reflection','professional_upgrade']),
    'Hybrid teams require human-centered clarity.'::text,
    jsonb_build_object('behaviors', jsonb_build_array(
      'I use AI transparently and responsibly to support collaboration, not replace it.',
      'I keep accountability human by validating AI-assisted work before it impacts stakeholders.',
      'I build trust in hybrid teams through clarity, alignment, and proactive communication.'
    )),
    jsonb_build_object('outcomes', jsonb_build_array(
      'You create a Human + AI Collaboration Plan that shows how you use automation while protecting trust and alignment.',
      'You learn how to communicate AI-assisted work without sounding dependent or hiding your process.',
      'You gain a repeatable collaboration pattern that works across managers, teammates, and AI systems.'
    )),
    jsonb_build_object('close', jsonb_build_array(
      'AI can accelerate work, but only humans can align a team.',
      'Your advantage is not just using AI — it is collaborating responsibly with it.',
      'Tomorrow, you enter Strategic Operation: prompting as a professional skill.'
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
        {"type":"mapping","text":"AI supports workflows. AI drafts outputs. AI summarizes decisions. AI accelerates coordination. But: AI does NOT create alignment. AI does NOT repair misunderstandings. AI does NOT build trust. Humans do."},
        {"type":"facilitator_script","text":"In real organizations, AI is embedded inside the team workflow, not used as a private shortcut. That means your output must fit the shared system. If your automation creates surprises, confusion, or tone problems, you may move fast but you will lose trust."},
        {"type":"teaching_moment","title":"The Hybrid Rule","text":"When AI touches a stakeholder, you protect accuracy, tone, context, and relationship. That is what professional collaboration looks like."}
      ]$$),

      (2,'workplace_scenario','Workplace Scenario', $$[
        {"type":"scenario_setup","text":"Your team uses AI to draft customer responses and summarize support tickets. Some teammates copy AI responses directly, causing tone issues and escalations. Others treat AI as a starting point and humanize the message before sending."},
        {"type":"manager_quote","text":"Customer satisfaction is slipping. Help us use AI better without creating risk."},
        {"type":"narrative","text":"This is not a tool issue. It is a workflow and trust issue. Hybrid teams win when they protect people while increasing speed."}
      ]$$),

      (3,'decision_challenge','Decision Challenge', $$[
        {"type":"challenge","text":"Decide how you will use AI to improve team performance without breaking trust. You must choose how transparent you will be about automation, how you will validate AI output, and how you will communicate so stakeholders feel aligned rather than surprised."},
        {"type":"instruction","text":"Write your collaboration rule in one sentence: AI is input, humans are accountable, and communication carries ownership."}
      ]$$),

      (4,'artifact_creation','Artifact Creation', $$[
        {"type":"assignment","title":"Human + AI Collaboration Plan","structure":[
          "Describe when you will use AI and when you will not.",
          "Describe how you validate AI output before it touches stakeholders.",
          "Describe how you communicate AI-assisted work with ownership.",
          "Describe how you handle disagreements about AI output professionally.",
          "Describe how you escalate risk without sounding resistant."
        ],"length":"10–14 sentences"},
        {"type":"skills_trained","items":["collaboration","transparency","communication","risk management","stakeholder trust"]}
      ]$$),

      (5,'reflection','Reflection', $$[
        {"type":"instruction","text":"Reflect on how you currently use AI. Are you using it to avoid thinking, or to enhance thinking? Identify one place where AI makes you faster but could make you careless, and explain the validation step you will add immediately."},
        {"type":"instruction","text":"Then reflect on your communication habits. Do you provide context proactively, or do people have to chase clarity from you? In hybrid teams, silence creates confusion, and confusion destroys trust."}
      ]$$),

      (6,'professional_upgrade','Professional Upgrade', $$[
        {"type":"callout","text":"The winners are not the people who use automation the most. They are the people who integrate automation with trust."},
        {"type":"facilitator_script","text":"If you can help a team move faster without creating confusion, your responsibility will expand quickly. That is how you turn AI into acceleration instead of chaos."}
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
      ('decision_challenge',1,'What is the biggest risk of using AI inside team workflows without transparency?','open_ended', $$null$$,
        $$["Describe how hidden automation creates misalignment.","Explain how trust erodes when reasoning is unclear.","Give one example of transparency protecting the team."]$$),
      ('decision_challenge',2,'Which approach best supports collaboration in hybrid teams?','multiple_choice', $$[
        {"label":"A","text":"Use AI privately to look smarter, and share only the final result."},
        {"label":"B","text":"Copy AI output directly to maximize speed."},
        {"label":"C","text":"Use AI as input, validate and humanize the output, then communicate context and ownership clearly."},
        {"label":"D","text":"Avoid AI so you never risk mistakes."}
      ]$$,
        $$["What protects stakeholder trust?","Where does AI fail most (tone, facts, context)?","How does proactive context reduce confusion?"]$$),
      ('decision_challenge',3,'A teammate insists AI output is “good enough” to send to a customer. What is the most professional response?','multiple_choice', $$[
        {"label":"A","text":"Agree and send it to avoid conflict."},
        {"label":"B","text":"Reject AI entirely and insist on manual work only."},
        {"label":"C","text":"Propose a quick validation and tone check, explain relationship risk, and recommend a human-reviewed final message."},
        {"label":"D","text":"Escalate immediately without offering a solution."}
      ]$$,
        $$["How do you address risk without sounding resistant?","What validation step is fast but protective?","How do you preserve speed and trust?"]$$),
      ('reflection',1,'Where does AI make you faster but potentially more careless, and what validation step will you add immediately?','open_ended', $$null$$,
        $$["Name the risky workflow step.","Describe the exact validation step.","Explain how it protects trust and credibility."]$$),
      ('reflection',2,'What is one proactive communication habit you will practice in hybrid teams to prevent confusion?','open_ended', $$null$$,
        $$["Define the habit in one sentence.","Describe when you will do it.","Describe how it changes teamwork outcomes."]$$)
  ) AS e(section_type, sort_order, question, question_type, options, thinking_prompts)
    ON e.section_type = sl.section_type
  RETURNING id
)

SELECT
  (SELECT count(*) FROM del_day) AS days_deleted,
  (SELECT count(*) FROM ins_day) AS days_inserted,
  (SELECT count(*) FROM ins_sections) AS sections_inserted,
  (SELECT count(*) FROM ins_exercises) AS exercises_inserted;