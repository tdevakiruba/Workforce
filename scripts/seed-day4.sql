-- ============================================================
-- Day 4 — Ownership in AI-Driven Workflows (ContentBlock format)
-- program_id: 7da8d569-d5a3-47d8-9101-e8142b44822e
-- ============================================================

WITH
params AS (
  SELECT
    '7da8d569-d5a3-47d8-9101-e8142b44822e'::uuid AS program_id,
    4::int AS day_number
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
    'Ownership in AI-Driven Workflows'::text,
    'AI may generate the work, but you own the outcome.'::text,

    jsonb_build_object(
      'objective',
      'By the end of today, you will internalize professional accountability by learning how ownership works when AI assists execution, and you will define a validation process that protects credibility, trust, and outcomes.'
    ),

    to_jsonb(ARRAY[
      'reality_briefing',
      'workplace_scenario',
      'decision_challenge',
      'artifact_creation',
      'reflection',
      'professional_upgrade'
    ]),

    'Professionals don’t hide behind tools. They stand behind outcomes.'::text,

    jsonb_build_object(
      'behaviors',
      jsonb_build_array(
        'I validate AI-assisted work before it reaches stakeholders because my name is attached to outcomes.',
        'I prioritize responsibility over speed when the consequences of errors are high.',
        'I build trust by practicing consistent due diligence instead of relying on automation confidence.'
      )
    ),

    jsonb_build_object(
      'outcomes',
      jsonb_build_array(
        'You write a Pre-Submission Ownership Statement that defines your verification and quality process.',
        'You strengthen an accountability reflex that prevents “forwarding risk” in AI workflows.',
        'You learn how ownership functions as a leadership signal in AI-enabled teams.'
      )
    ),

    jsonb_build_object(
      'close',
      jsonb_build_array(
        'In the workplace, responsibility begins when you submit.',
        'Ownership builds trust faster than brilliance.',
        'Tomorrow, you will build learning velocity as your survival strategy in fast-changing environments.'
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
      (1, 'reality_briefing', 'Reality Briefing', $$[
        {
          "type":"mapping",
          "text":"AI can generate drafts. AI can produce reports. AI can sound confident. AI can move work fast. But: AI does NOT verify truth. AI does NOT absorb consequences. AI does NOT protect your reputation. Humans do."
        },
        {
          "type":"facilitator_script",
          "text":"In school, you submit work and your responsibility ends. In the workplace, your responsibility begins when work is sent, because your output affects customers, teams, and business outcomes. AI makes it easier to produce deliverables quickly, but it also makes it easier to forward unverified assumptions at scale."
        },
        {
          "type":"teaching_moment",
          "title":"Ownership Standard",
          "text":"Ownership means you do not outsource accountability to automation. You use AI to accelerate drafts, but you take responsibility for the final deliverable because your reputation will be judged by outcomes, not tools."
        }
      ]$$),

      (2, 'workplace_scenario', 'Workplace Scenario', $$[
        {
          "type":"scenario_setup",
          "text":"You use AI to draft a client proposal summary. It looks polished, so you forward it quickly. Later, the client flags incorrect assumptions in the message and your manager asks whether you validated the claims before sending."
        },
        {
          "type":"manager_quote",
          "text":"Did you validate this before it went to the client?"
        },
        {
          "type":"narrative",
          "text":"This is not an AI failure. It is an ownership failure. The organization does not care where the words came from; it cares who stood behind the message when it reached a stakeholder."
        }
      ]$$),

      (3, 'decision_challenge', 'Decision Challenge', $$[
        {
          "type":"challenge",
          "text":"Decide what standards you will uphold before AI-assisted work leaves your hands. Speed feels rewarding, but credibility compounds. Your job is to build a validation habit that protects accuracy, tone, context, and stakeholder trust every time."
        },
        {
          "type":"instruction",
          "text":"Write your decision as a principle: when AI touches stakeholder communication, you will treat it as input and take responsibility for the final message."
        }
      ]$$),

      (4, 'artifact_creation', 'Artifact Creation', $$[
        {
          "type":"assignment",
          "title":"Pre-Submission Ownership Statement",
          "structure":[
            "State your verification rule for facts and assumptions in one sentence.",
            "State your tone/relationship check in one sentence.",
            "State your context alignment check (audience + purpose) in one sentence.",
            "State what you do when you are uncertain (escalate/ask/flag) in one sentence."
          ],
          "length":"6–10 sentences"
        },
        {
          "type":"skills_trained",
          "items":["accountability","risk awareness","quality control","stakeholder communication","professional judgment"]
        }
      ]$$),

      (5, 'reflection', 'Reflection', $$[
        {
          "type":"instruction",
          "text":"Reflect on whether you default to speed or responsibility under pressure. Identify one moment where you rushed in the past and describe what validation step would have protected you."
        },
        {
          "type":"instruction",
          "text":"Then reflect on trust: what would make a leader confident you will not create surprise problems? Write the answer as a daily operating behavior you will commit to."
        }
      ]$$),

      (6, 'professional_upgrade', 'Professional Upgrade', $$[
        {
          "type":"callout",
          "text":"Ownership builds trust faster than brilliance."
        },
        {
          "type":"facilitator_script",
          "text":"In AI-powered teams, accountability is a leadership signal because it proves you can be trusted with decisions, stakeholders, and consequences. If you want responsibility early, act like someone who already has it: validate, communicate, and stand behind outcomes."
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
        'Explain why “polished AI output” is not the same as “safe professional deliverable.”',
        'open_ended',
        $$null$$,
        $$[
          "What are the most common hidden risks in AI drafts?",
          "What happens when assumptions slip through to stakeholders?",
          "How does verification protect credibility?"
        ]$$
      ),
      ('decision_challenge', 2,
        'Which action best demonstrates ownership in AI-driven workflows?',
        'multiple_choice',
        $$[
          {"label":"A","text":"Forward AI output quickly so the team stays fast."},
          {"label":"B","text":"Avoid AI completely to eliminate risk."},
          {"label":"C","text":"Validate assumptions, verify facts, adjust tone, and send with accountability."},
          {"label":"D","text":"Only check grammar and formatting."}
        ]$$,
        $$[
          "What is the cost of one wrong assumption?",
          "Which checks protect stakeholders most?",
          "What does accountability look like at send-time?"
        ]$$
      ),
      ('decision_challenge', 3,
        'Your manager asks, “Did you validate this?” What is the strongest ownership response?',
        'multiple_choice',
        $$[
          {"label":"A","text":"“AI generated it, so I assumed it was fine.”"},
          {"label":"B","text":"“I didn’t have time to check it.”"},
          {"label":"C","text":"“Yes — here are the assumptions I verified and the risks I flagged before sending.”"},
          {"label":"D","text":"“I thought you would review it anyway.”"}
        ]$$,
        $$[
          "What does a leader need to hear to trust you?",
          "How do you show process, not excuses?",
          "How do you demonstrate risk awareness?"
        ]$$
      ),
      ('reflection', 1,
        'Write one sentence that defines your personal ownership standard for AI-assisted work.',
        'open_ended',
        $$null$$,
        $$[
          "Make it measurable and specific.",
          "Include validation and accountability.",
          "Write it as a rule you will follow."
        ]$$
      ),
      ('reflection', 2,
        'Name one area where you tend to rush, and describe the validation step you will add to protect outcomes.',
        'open_ended',
        $$null$$,
        $$[
          "What triggers your rushing?",
          "What is the smallest effective verification step?",
          "How does it protect trust and credibility?"
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