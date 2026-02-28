-- ============================================================
-- Day 19 — Capstone Build: AI-Ready Portfolio Artifacts (ContentBlock format)
-- program_id: 7da8d569-d5a3-47d8-9101-e8142b44822e
-- ============================================================

WITH
params AS (
  SELECT '7da8d569-d5a3-47d8-9101-e8142b44822e'::uuid AS program_id, 19::int AS day_number
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
    'Capstone Build: AI-Ready Portfolio Artifacts'::text,
    'Proof beats claims.'::text,

    jsonb_build_object(
      'objective',
      'By the end of today, you will build portfolio-grade artifacts that demonstrate AI workforce readiness, including decision memos, validation notes, and impact briefs that show you can operate responsibly inside AI-enabled organizations.'
    ),

    to_jsonb(ARRAY['reality_briefing','workplace_scenario','decision_challenge','artifact_creation','reflection','professional_upgrade']),

    'Employers don’t trust keywords. They trust evidence.'::text,

    jsonb_build_object('behaviors', jsonb_build_array(
      'I build proof of capability through artifacts that show judgment, validation, and impact.',
      'I communicate AI-assisted work with ownership and documented reasoning.',
      'I translate work into resume language that demonstrates contribution in AI-enabled workflows.'
    )),

    jsonb_build_object('outcomes', jsonb_build_array(
      'You produce 2–3 portfolio artifacts (impact brief, validation note, decision memo).',
      'You learn how to describe AI-assisted work in credible, employer-ready language.',
      'You create a capstone package you can reuse for applications and interviews.'
    )),

    jsonb_build_object('close', jsonb_build_array(
      'Your portfolio is your proof of operating ability.',
      'Tomorrow, you will pressure-test your capstone through a workplace simulation.',
      'Day 21 you will finalize certification and your next 90-day trajectory plan.'
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
        {"type":"mapping","text":"AI can generate content. AI can draft analysis. AI can create artifacts quickly. But: AI does NOT prove your capability. AI does NOT prove your judgment. AI does NOT prove your ownership. Humans do."},
        {"type":"facilitator_script","text":"The job market is full of AI claims. What’s rare is proof that you can operate responsibly. Your capstone artifacts show employers you can work in hybrid systems with judgment, validation, ethics, and impact framing."},
        {"type":"teaching_moment","title":"Artifacts = Evidence","text":"Artifacts turn vague claims into visible competence. If you can show your reasoning process, your validation step, and your decision framing, you stand out in AI-enabled hiring."}
      ]$$),

      (2,'workplace_scenario','Workplace Scenario', $$[
        {"type":"scenario_setup","text":"A recruiter asks, “How have you used AI in real work?” Many candidates say “I use ChatGPT.” Very few can show a decision memo, a risk note, and an impact brief that proves responsible use."},
        {"type":"manager_quote","text":"Show me how you think, not just what tools you use."},
        {"type":"narrative","text":"Today you build what most candidates never build: evidence of how you operate in AI workflows."}
      ]$$),

      (3,'decision_challenge','Decision Challenge', $$[
        {"type":"challenge","text":"Decide what you want your artifacts to prove: judgment, validation, impact translation, ethical awareness, and executive communication. Your capstone must demonstrate you are ready to operate, not just learn."},
        {"type":"instruction","text":"Choose one scenario (customer, product, hiring, finance, support) and build three artifacts that show the complete operator chain: insight → validation → decision → communication."}
      ]$$),

      (4,'artifact_creation','Artifact Creation', $$[
        {"type":"assignment","title":"Capstone Artifact Pack (Pick 3)","structure":[
          "Business Impact Brief (what it means, why it matters, what to do next).",
          "Validation Note (facts checked, assumptions surfaced, risk flagged).",
          "Decision Memo (options, tradeoffs, recommendation, next step).",
          "Ethical Decision Note (who is impacted, what must be protected).",
          "Executive Summary Statement (headline recommendation with risk and next step)."
        ],"length":"3 artifacts (each 8–12 sentences)"},
        {"type":"skills_trained","items":["portfolio building","business writing","validation","decision framing","career positioning"]}
      ]$$),

      (5,'reflection','Reflection', $$[
        {"type":"instruction","text":"Reflect on which artifact felt hardest to write and why. Difficulty usually reveals your growth edge: clarity, confidence, risk thinking, or decision framing. Name your edge and how you will practice it."},
        {"type":"instruction","text":"Then reflect on your positioning. Write the one sentence you want your artifacts to prove about you to an employer, and describe how each artifact supports that claim."}
      ]$$),

      (6,'professional_upgrade','Professional Upgrade', $$[
        {"type":"callout","text":"Your artifacts are your advantage because they show how you operate under real constraints."},
        {"type":"facilitator_script","text":"When your portfolio demonstrates judgment, validation, and impact communication, you separate from candidates who only know tools. You become the candidate who can be trusted inside AI-enabled organizations."}
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
      ('decision_challenge',1,'Why are portfolio artifacts more credible than saying “I use AI” on a resume?','open_ended', $$null$$,
        $$["Explain why claims are common.","Explain what artifacts prove (judgment, process, ownership).","Explain how artifacts reduce employer risk."]$$),
      ('decision_challenge',2,'Which set best demonstrates AI workforce readiness?','multiple_choice', $$[
        {"label":"A","text":"A list of AI tools and buzzwords."},
        {"label":"B","text":"A long AI-generated essay with no validation."},
        {"label":"C","text":"An impact brief, a validation note, and a decision memo tied to one scenario."},
        {"label":"D","text":"Screenshots of AI outputs without explanation."}
      ]$$,
        $$["Which option shows a complete operator chain?","Which option demonstrates ownership?","Which option is easiest for an employer to trust?"]$$),
      ('decision_challenge',3,'What makes an artifact “employer-ready” instead of “school-ready”?','multiple_choice', $$[
        {"label":"A","text":"It is long and detailed."},
        {"label":"B","text":"It repeats the AI output clearly."},
        {"label":"C","text":"It is decision-focused, tied to impact, includes validation/risk, and communicates ownership."},
        {"label":"D","text":"It uses impressive vocabulary."}
      ]$$,
        $$["Where does ownership show up?","Where is risk handled?","Where is action clear?"]$$),
      ('reflection',1,'Which artifact was hardest for you to write and what does that reveal about your growth edge?','open_ended', $$null$$,
        $$["Name the artifact.","Name the reason it was difficult.","Describe how you will practice that skill next week."]$$),
      ('reflection',2,'Write the one sentence you want your artifacts to prove about you to an employer, and explain how each artifact supports it.','open_ended', $$null$$,
        $$["Write the sentence clearly.","Map each artifact to the claim.","Keep your explanation concrete and behavior-based."]$$)
  ) AS e(section_type, sort_order, question, question_type, options, thinking_prompts)
    ON e.section_type = sl.section_type
  RETURNING id
)

SELECT
  (SELECT count(*) FROM del_day) AS days_deleted,
  (SELECT count(*) FROM ins_day) AS days_inserted,
  (SELECT count(*) FROM ins_sections) AS sections_inserted,
  (SELECT count(*) FROM ins_exercises) AS exercises_inserted;