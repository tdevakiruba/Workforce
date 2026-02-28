-- ============================================================
-- Day 5 — Skill, Adaptability, and Learning Velocity (ContentBlock format)
-- program_id: 7da8d569-d5a3-47d8-9101-e8142b44822e
-- ============================================================

WITH
params AS (
  SELECT
    '7da8d569-d5a3-47d8-9101-e8142b44822e'::uuid AS program_id,
    5::int AS day_number
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
    'Skill, Adaptability, and Learning Velocity'::text,
    'Your degree got you here. Your adaptability determines how far you go.'::text,

    jsonb_build_object(
      'objective',
      'By the end of today, you will design a personal learning velocity system that prioritizes capability over credentials, so you can stay relevant as AI tools, workflows, and job expectations evolve rapidly.'
    ),

    to_jsonb(ARRAY[
      'reality_briefing',
      'workplace_scenario',
      'decision_challenge',
      'artifact_creation',
      'reflection',
      'professional_upgrade'
    ]),

    'High performers don’t wait to be trained. They train themselves.'::text,

    jsonb_build_object(
      'behaviors',
      jsonb_build_array(
        'I build weekly learning habits that increase capability through application, not consumption.',
        'I experiment responsibly with tools and refine through iteration, feedback, and reflection.',
        'I measure growth by outcomes I can produce, not by content I can recite.'
      )
    ),

    jsonb_build_object(
      'outcomes',
      jsonb_build_array(
        'You write a Learning Velocity Plan with weekly habits and monthly stretch challenges.',
        'You identify the specific tools and skills that will make you valuable in AI-enabled workplaces.',
        'You leave with a survival strategy for staying relevant as roles evolve.'
      )
    ),

    jsonb_build_object(
      'close',
      jsonb_build_array(
        'Careers in the AI era reward momentum.',
        'Stagnation is not neutral — it is decline.',
        'Tomorrow, you will learn how reliability builds trust in hybrid teams.'
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
          "text":"AI tools evolve monthly. Workflows shift constantly. Roles change quickly. Competition increases. But: AI does NOT guarantee your relevance. AI does NOT build your capability. AI does NOT drive your growth. Humans do."
        },
        {
          "type":"facilitator_script",
          "text":"In the AI era, your degree is not a lifetime advantage. It is a starting point. What determines your trajectory is how quickly you can learn, apply, and improve in real workflows. Learning velocity is the speed at which you turn new information into capability."
        },
        {
          "type":"teaching_moment",
          "title":"The Real Advantage",
          "text":"High performers are not always the smartest people in the room; they are the fastest learners. They experiment, they adapt, and they build skill through repetition. The people who wait for formal training get left behind because the market moves faster than training calendars."
        }
      ]$$),

      (2, 'workplace_scenario', 'Workplace Scenario', $$[
        {
          "type":"scenario_setup",
          "text":"Two new hires join an AI-enabled company. Hire A relies on past education and waits for official training before using new tools. Hire B experiments weekly, studies workflow patterns, asks strategic questions, and seeks feedback."
        },
        {
          "type":"narrative",
          "text":"Six months later, Hire B is trusted with more complex work because adaptability signals future leadership, and leadership invests in the person who demonstrates momentum."
        }
      ]$$),

      (3, 'decision_challenge', 'Decision Challenge', $$[
        {
          "type":"challenge",
          "text":"Decide whether you will build capability continuously or defend credentials. In AI workplaces, relevance is not guaranteed. You must design habits that keep you upgrading faster than the industry changes."
        },
        {
          "type":"instruction",
          "text":"Choose one learning system you will actually execute weekly, then decide how you will prove progress through outcomes, not consumption."
        }
      ]$$),

      (4, 'artifact_creation', 'Artifact Creation', $$[
        {
          "type":"assignment",
          "title":"Learning Velocity Plan",
          "structure":[
            "Name 2 AI tools you will practice weekly and what you will produce with them.",
            "Name 1 business skill you will deepen weekly (e.g., analysis, customer thinking, product sense).",
            "Define a weekly practice schedule (days + time + output).",
            "Define one monthly stretch challenge tied to a real portfolio artifact."
          ],
          "length":"10–14 sentences"
        },
        {
          "type":"skills_trained",
          "items":["learning agility","tool fluency","self-management","portfolio building","execution discipline"]
        }
      ]$$),

      (5, 'reflection', 'Reflection', $$[
        {
          "type":"instruction",
          "text":"Reflect on your current learning habits. Are you consuming information or building capability? Identify one habit that creates the illusion of progress without real skill growth, and name what you will replace it with."
        },
        {
          "type":"instruction",
          "text":"Then reflect on fear. What tool, skill, or area do you avoid because it feels unfamiliar? Name it directly and describe how you will practice it safely and consistently."
        }
      ]$$),

      (6, 'professional_upgrade', 'Professional Upgrade', $$[
        {
          "type":"callout",
          "text":"Careers in the AI era reward momentum."
        },
        {
          "type":"facilitator_script",
          "text":"High performers do not wait to be trained; they build learning systems and upgrade continuously because adaptability is the skill that keeps you employable and promotable. When you build learning velocity, leaders trust you with new problems because you prove you can grow into complexity."
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
        'Define learning velocity in your own words and explain why it matters more than credentials in AI-enabled workplaces.',
        'open_ended',
        $$null$$,
        $$[
          "What is the difference between learning and capability?",
          "How does learning velocity change opportunity and trust?",
          "How does the market punish stagnation?"
        ]$$
      ),
      ('decision_challenge', 2,
        'Which habit most strongly increases learning velocity?',
        'multiple_choice',
        $$[
          {"label":"A","text":"Waiting for formal training before trying tools."},
          {"label":"B","text":"Weekly experimentation, reflection, and application to real workflows."},
          {"label":"C","text":"Only learning when your manager assigns it."},
          {"label":"D","text":"Reading content without practicing."}
        ]$$,
        $$[
          "What turns knowledge into capability?",
          "What makes weekly repetition powerful?",
          "How does experimentation reduce fear?"
        ]$$
      ),
      ('decision_challenge', 3,
        'Which plan is most likely to keep you relevant over the next 12 months?',
        'multiple_choice',
        $$[
          {"label":"A","text":"“I’ll rely on what I learned in school.”"},
          {"label":"B","text":"“I’ll learn only when I’m required.”"},
          {"label":"C","text":"“I’ll build weekly practice habits, track progress, and complete monthly stretch projects tied to real outcomes.”"},
          {"label":"D","text":"“I’ll avoid new tools until they become mandatory.”"}
        ]$$,
        $$[
          "What makes a plan measurable?",
          "How does a stretch challenge accelerate growth?",
          "How do you prove progress to yourself and leaders?"
        ]$$
      ),
      ('reflection', 1,
        'Name one “fake progress” habit you currently have and what you will replace it with to build real capability.',
        'open_ended',
        $$null$$,
        $$[
          "What does fake progress look like for you?",
          "What replacement habit produces measurable output?",
          "How will you track improvement weekly?"
        ]$$
      ),
      ('reflection', 2,
        'What is one tool or skill you avoid because it feels unfamiliar, and what is your 7-day practice plan to confront it?',
        'open_ended',
        $$null$$,
        $$[
          "Name the fear trigger.",
          "Describe a safe, small daily practice step.",
          "Describe what success looks like at day 7."
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