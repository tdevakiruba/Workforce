-- ============================================================
-- Day 1 — From Graduate to AI-Ready Professional (ContentBlock format)
-- program_id: 7da8d569-d5a3-47d8-9101-e8142b44822e
-- ============================================================

WITH
params AS (
  SELECT '7da8d569-d5a3-47d8-9101-e8142b44822e'::uuid AS program_id, 1::int AS day_number
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
    'From Graduate to AI-Ready Professional'::text,
    'You are not entering a job market — you are entering an operating system.'::text,

    jsonb_build_object(
      'objective',
      'By the end of today, you will shift from a student mindset to a professional operator mindset by understanding that AI-enabled workplaces reward judgment, ownership, and trust more than task completion, and you will define the behaviors that prove you are AI Workforce Ready.'
    ),

    to_jsonb(ARRAY['reality_briefing','workplace_scenario','decision_challenge','artifact_creation','reflection','professional_upgrade']),

    'Stop preparing to be hired. Start preparing to operate.'::text,

    jsonb_build_object('behaviors', jsonb_build_array(
      'I think in outcomes, not assignments, and I take responsibility for impact rather than effort.',
      'I treat AI as part of the environment I operate in, not a shortcut I hide behind or depend on blindly.',
      'I build credibility through clarity, follow-through, and ownership so leaders can trust me with real responsibility.'
    )),

    jsonb_build_object('outcomes', jsonb_build_array(
      'You create an AI-Ready Professional Identity Statement that defines how you will operate differently than a student.',
      'You define what “AI Workforce Ready” means as daily behavior, not a buzzword.',
      'You leave with a baseline operating standard you will apply throughout this 21-day accelerator.'
    )),

    jsonb_build_object('close', jsonb_build_array(
      'Your degree proves you learned; your behavior proves you are ready.',
      'In the AI workforce, output is common — ownership is rare.',
      'Tomorrow, you will learn how AI organizations actually function and where accountability lives.'
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
        {
          "type":"mapping",
          "text":"AI accelerates output. AI drafts content. AI summarizes decisions. AI supports workflows. But: AI does NOT define professionalism. AI does NOT earn trust. AI does NOT own outcomes. Humans do."
        },
        {
          "type":"facilitator_script",
          "text":"Most graduates think career success comes from being smart, working hard, and finishing tasks quickly. In the AI era, that mindset is incomplete because AI can help anyone produce output faster. What separates people now is judgment, ownership, and the ability to operate inside real workflows where consequences matter."
        },
        {
          "type":"teaching_moment",
          "title":"Operator Mindset",
          "text":"A student finishes tasks. A professional operator protects outcomes. Operators validate, communicate, and stand behind results because their reputation is built on what stakeholders experience, not what tools they used."
        }
      ]$$),

      (2,'workplace_scenario','Workplace Scenario', $$[
        {
          "type":"scenario_setup",
          "text":"You start a new role where your team uses AI to write first drafts, summarize meetings, and propose next steps. Everyone has access to the same tools, so leadership is not impressed by output volume."
        },
        {
          "type":"manager_quote",
          "text":"I’m looking for people who can take ownership of outcomes, not just produce content."
        },
        {
          "type":"narrative",
          "text":"In your first week, you are asked to send a client update. AI drafts a polished message instantly. The real question is whether you will operate like a professional by verifying facts, adjusting tone, and owning the outcome of what gets communicated."
        }
      ]$$),

      (3,'decision_challenge','Decision Challenge', $$[
        {
          "type":"challenge",
          "text":"Decide what identity you will build in the workplace. You can be the person who completes tasks, or you can be the person who delivers outcomes with clarity and ownership. In AI-enabled environments, leaders elevate the people who reduce uncertainty."
        },
        {
          "type":"instruction",
          "text":"Write your operator rule in one sentence: AI is input, humans are accountable, and you own what leaves your hands."
        }
      ]$$),

      (4,'artifact_creation','Artifact Creation', $$[
        {
          "type":"assignment",
          "title":"AI-Ready Professional Identity Statement",
          "structure":[
            "Write one sentence defining how you will operate differently than a student.",
            "Write one sentence describing how you will handle AI-assisted work (validation + ownership).",
            "Write one sentence describing how you will communicate progress and reduce uncertainty.",
            "Write one sentence describing the reputation you are building in 30 days."
          ],
          "length":"6–10 sentences"
        },
        {
          "type":"skills_trained",
          "items":["ownership","professional identity","communication","trust-building","judgment"]
        }
      ]$$),

      (5,'reflection','Reflection', $$[
        {
          "type":"instruction",
          "text":"Reflect on the biggest student habit that could hurt you at work. Name it directly, then describe the professional behavior you will replace it with and how the replacement changes your results and credibility."
        },
        {
          "type":"instruction",
          "text":"Then reflect on trust. What would make a manager feel safe delegating to you by week two? Write your answer as behaviors, not traits, because trust is built through what you repeatedly do."
        }
      ]$$),

      (6,'professional_upgrade','Professional Upgrade', $$[
        {
          "type":"callout",
          "text":"Output gets you noticed. Ownership gets you trusted."
        },
        {
          "type":"facilitator_script",
          "text":"Professionals do not see isolated tasks. They see chains of impact. When you operate with clarity, verification, and ownership, leaders stop managing you closely and start giving you higher responsibility earlier."
        }
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
      ('decision_challenge',1,'In an AI-enabled workplace, what does it mean to “operate” instead of “complete tasks”?','open_ended', $$null$$,
        $$["Describe the difference between output and outcomes.","Explain how ownership changes your behavior when AI is involved.","Describe one way an operator reduces uncertainty for leaders."]$$),
      ('decision_challenge',2,'Which behavior most strongly signals an AI-ready professional identity?','multiple_choice', $$[
        {"label":"A","text":"Finishing tasks quickly and moving on."},
        {"label":"B","text":"Waiting for detailed instructions before acting."},
        {"label":"C","text":"Owning outcomes, validating AI-assisted work, and communicating proactively."},
        {"label":"D","text":"Using AI secretly so you look more capable."}
      ]$$,
        $$["What makes leaders trust you with higher responsibility?","What does validation protect (trust, quality, risk)?","Why is secrecy a trust breaker in hybrid teams?"]$$),
      ('decision_challenge',3,'Your manager asks you to send a client update, and AI produces a polished draft instantly. What is the most professional next step?','multiple_choice', $$[
        {"label":"A","text":"Send it immediately because it is polished."},
        {"label":"B","text":"Skim for spelling and send."},
        {"label":"C","text":"Verify facts, adjust tone for the relationship, confirm context, then send with ownership."},
        {"label":"D","text":"Avoid AI so you never risk a mistake."}
      ]$$,
        $$["What are the most common failure points in AI drafts (facts, tone, context)?","How does ownership show up at the point of sending?","What is the cost of a small error with a stakeholder?"]$$),
      ('reflection',1,'What is the biggest student habit you must stop immediately to succeed in the AI workforce, and what professional behavior will replace it?','open_ended', $$null$$,
        $$["Name the habit honestly.","Describe the replacement behavior in one sentence.","Explain how you will measure whether you changed."]$$),
      ('reflection',2,'What three behaviors would make a manager feel safe delegating to you in your first two weeks, and why?','open_ended', $$null$$,
        $$["Describe behaviors, not personality traits.","Explain how each behavior reduces uncertainty.","Explain how these behaviors build trust in hybrid teams."]$$)
  ) AS e(section_type, sort_order, question, question_type, options, thinking_prompts)
    ON e.section_type = sl.section_type
  RETURNING id
)

SELECT
  (SELECT count(*) FROM del_day) AS days_deleted,
  (SELECT count(*) FROM ins_day) AS days_inserted,
  (SELECT count(*) FROM ins_sections) AS sections_inserted,
  (SELECT count(*) FROM ins_exercises) AS exercises_inserted;