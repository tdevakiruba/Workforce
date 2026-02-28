-- ============================================================
-- Day 3 — Human Advantage in an Automated World (ContentBlock format)
-- program_id: 7da8d569-d5a3-47d8-9101-e8142b44822e
-- ============================================================

WITH
params AS (
  SELECT
    '7da8d569-d5a3-47d8-9101-e8142b44822e'::uuid AS program_id,
    3::int AS day_number
),

del_day AS (
  DELETE FROM public."wf-curriculum_days" d
  USING params p
  WHERE d.program_id = p.program_id
    AND d.day_number = p.day_number
  RETURNING d.id
),

ins_day AS (
  INSERT INTO public."wf-curriculum_days"
  (
    program_id, day_number, title, theme,
    day_objective, lesson_flow, key_teaching_quote,
    behaviors_instilled, end_of_day_outcomes, facilitator_close
  )
  SELECT
    p.program_id,
    p.day_number,
    'Human Advantage in an Automated World'::text,
    'Automation increases the need for human clarity, not the opposite.'::text,

    jsonb_build_object(
      'objective',
      'By the end of today, you will understand what humans uniquely contribute in AI-enabled workplaces and why judgment, context, empathy, and responsibility become your competitive advantage when automation is everywhere.'
    ),

    to_jsonb(ARRAY[
      'reality_briefing',
      'workplace_scenario',
      'decision_challenge',
      'artifact_creation',
      'reflection',
      'professional_upgrade'
    ]),

    'If you compete with AI on speed, you lose. If you compete on judgment, you win.'::text,

    jsonb_build_object(
      'behaviors',
      jsonb_build_array(
        'I contribute judgment and context where automation cannot, especially when decisions affect people and trust.',
        'I challenge AI output respectfully when stakes, ethics, or consequences require human responsibility.',
        'I communicate reasoning clearly so leaders can trust my conclusions, not just my output.'
      )
    ),

    jsonb_build_object(
      'outcomes',
      jsonb_build_array(
        'You produce a Human Insight Brief that separates what AI detects from what human judgment must decide.',
        'You build confidence in challenging machine output professionally when stakes are high.',
        'You strengthen your identity as a responsible operator who protects outcomes and trust.'
      )
    ),

    jsonb_build_object(
      'close',
      jsonb_build_array(
        'Your humanity is not a weakness — it is your edge.',
        'In AI workplaces, interpretation is power and responsibility is leadership.',
        'Tomorrow, you will build an ownership mindset for AI-driven workflows.'
      )
    )
  FROM params p
  RETURNING id
),

ins_sections AS (
  INSERT INTO public."wf-curriculum_sections"
  (day_id, sort_order, section_type, title, content)
  SELECT
    d.id,
    s.sort_order,
    s.section_type,
    s.title,
    s.content::jsonb
  FROM ins_day d
  CROSS JOIN (
    VALUES
      -- 1) reality_briefing
      (1, 'reality_briefing', 'Reality Briefing', $$[
        {
          "type":"mapping",
          "text":"AI can summarize. AI can draft. AI can forecast. AI can recommend. But: AI does NOT carry moral responsibility. AI does NOT read unspoken dynamics. AI does NOT repair trust when it breaks. Humans do."
        },
        {
          "type":"facilitator_script",
          "text":"In an automated workplace, your job is not to compete with machines on speed. Speed is now a feature available to everyone. Your job is to bring human clarity and judgment by interpreting what output means, evaluating consequences, and protecting trust when the stakes are real."
        },
        {
          "type":"teaching_moment",
          "title":"Your Differentiator",
          "text":"Human advantage shows up when decisions include nuance: culture, ethics, reputation, empathy, and context. Those are not extra skills. They are the skills that determine who becomes indispensable as AI spreads."
        }
      ]$$),

      -- 2) workplace_scenario
      (2, 'workplace_scenario', 'Workplace Scenario', $$[
        {
          "type":"scenario_setup",
          "text":"Your company uses AI to screen job candidates. The top-ranked candidate looks perfect on paper based on keywords and experience, but in interviews you detect subtle signs of poor collaboration and high ego that the system cannot measure."
        },
        {
          "type":"manager_quote",
          "text":"The AI ranked them #1. Should we move fast and lock them in?"
        },
        {
          "type":"narrative",
          "text":"The decision now requires human judgment because culture damage is expensive and hard to repair, and no model can absorb the consequences when trust breaks."
        }
      ]$$),

      -- 3) decision_challenge
      (3, 'decision_challenge', 'Decision Challenge', $$[
        {
          "type":"challenge",
          "text":"Decide how you will combine machine analysis with human insight. If you blindly trust the algorithm, you risk cultural misalignment. If you ignore the model entirely, you lose useful signal. Professional judgment means you evaluate both, identify what AI cannot see, and recommend a decision that protects long-term outcomes."
        },
        {
          "type":"instruction",
          "text":"Your goal is to communicate reasoning confidently. Leaders do not want feelings. They want interpretation, evidence, and a recommendation that shows accountability."
        }
      ]$$),

      -- 4) artifact_creation
      (4, 'artifact_creation', 'Artifact Creation', $$[
        {
          "type":"assignment",
          "title":"Human Insight Brief",
          "structure":[
            "State what the AI identified in one sentence.",
            "State what the AI could not detect (culture, dynamics, nuance) in one sentence.",
            "Write your human judgment in 2–3 sentences using observed evidence.",
            "Write your final recommendation in 1–2 sentences and name the risk you are protecting against."
          ],
          "length":"8–12 sentences"
        },
        {
          "type":"skills_trained",
          "items":["judgment","context","ethical reasoning","risk awareness","executive communication"]
        }
      ]$$),

      -- 5) reflection
      (5, 'reflection', 'Reflection', $$[
        {
          "type":"instruction",
          "text":"Reflect on when you are willing to challenge machine output. Do you default to trusting AI because it feels authoritative, or do you have the confidence to question it when consequences are high? Identify one situation where your intuition would be valuable and explain why."
        },
        {
          "type":"instruction",
          "text":"Then reflect on responsibility: if a decision fails, what would you want your manager to say about your judgment process? Write the answer as a standard you will follow."
        }
      ]$$),

      -- 6) professional_upgrade
      (6, 'professional_upgrade', 'Professional Upgrade', $$[
        {
          "type":"callout",
          "text":"In the AI era, your value lies in interpreting meaning and carrying responsibility."
        },
        {
          "type":"facilitator_script",
          "text":"When you can challenge automation respectfully, explain reasoning clearly, and protect trust under pressure, you signal leadership potential early because you are doing what machines cannot do: owning consequences."
        }
      ]$$)

  ) AS s(sort_order, section_type, title, content)
  RETURNING id, section_type
),

section_lookup AS (
  SELECT id AS section_id, section_type
  FROM ins_sections
),

ins_exercises AS (
  INSERT INTO public."wf-curriculum_exercises"
  (section_id, sort_order, question, question_type, options, thinking_prompts)
  SELECT
    sl.section_id,
    e.sort_order,
    e.question,
    e.question_type,
    e.options::jsonb,
    e.thinking_prompts::jsonb
  FROM section_lookup sl
  JOIN (
    VALUES
      ('decision_challenge', 1,
        'Describe one workplace decision where AI output could be “correct” but still lead to a bad outcome without human judgment.',
        'open_ended',
        $$null$$,
        $$[
          "What would AI optimize for in that scenario?",
          "What would AI miss (trust, culture, ethics, context)?",
          "What would you validate before deciding?"
        ]$$
      ),
      ('decision_challenge', 2,
        'What is the strongest example of human advantage in an automated workplace?',
        'multiple_choice',
        $$[
          {"label":"A","text":"Producing more output than everyone else."},
          {"label":"B","text":"Following AI recommendations without hesitation."},
          {"label":"C","text":"Interpreting output with context, protecting trust, and owning consequences."},
          {"label":"D","text":"Avoiding AI tools entirely."}
        ]$$,
        $$[
          "Why is speed not enough anymore?",
          "Where does responsibility sit?",
          "What does trust protection look like in practice?"
        ]$$
      ),
      ('decision_challenge', 3,
        'A leader says, “The AI ranked this as best.” What is the most professional response?',
        'multiple_choice',
        $$[
          {"label":"A","text":"“Then we should do it.”"},
          {"label":"B","text":"“AI is unreliable, we should ignore it.”"},
          {"label":"C","text":"“Let’s use it as input, validate assumptions, and check stakeholder impact before we decide.”"},
          {"label":"D","text":"“I don’t know, whatever you want.”"}
        ]$$,
        $$[
          "How do you avoid sounding anti-AI while still being responsible?",
          "What assumptions should be validated?",
          "What risks should be considered?"
        ]$$
      ),
      ('reflection', 1,
        'Write two sentences describing when you will challenge AI output and what evidence you will bring to support your position.',
        'open_ended',
        $$null$$,
        $$[
          "What triggers a challenge (stakes, risk, ethics)?",
          "What validation step will you use?",
          "How will you keep your tone professional?"
        ]$$
      ),
      ('reflection', 2,
        'What is one human skill you will deliberately strengthen in the next 14 days, and how will you practice it weekly?',
        'open_ended',
        $$null$$,
        $$[
          "Choose a skill: judgment, empathy, context reading, communication, or ethical reasoning.",
          "Describe a weekly practice routine.",
          "Describe how you will measure improvement."
        ]$$
      )
  ) AS e(section_type, sort_order, question, question_type, options, thinking_prompts)
    ON e.section_type = sl.section_type
  RETURNING id
)

SELECT
  (SELECT count(*) FROM del_day)       AS days_deleted,
  (SELECT count(*) FROM ins_day)       AS days_inserted,
  (SELECT count(*) FROM ins_sections)  AS sections_inserted,
  (SELECT count(*) FROM ins_exercises) AS exercises_inserted;