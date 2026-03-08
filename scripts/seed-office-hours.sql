-- Seed office hours for WorkforceReady program
-- Get the program ID for workforce-ready
DO $$
DECLARE
  workforce_program_id uuid;
BEGIN
  SELECT id INTO workforce_program_id FROM programs WHERE slug = 'workforce-ready' LIMIT 1;
  
  -- Insert recurring office hours sessions
  INSERT INTO "wf-office_hours" (id, program_id, title, description, meeting_url, scheduled_at, duration_minutes, status, created_at, updated_at)
  VALUES 
    -- Weekly sessions for the next 8 weeks
    (gen_random_uuid(), workforce_program_id, 'Weekly Office Hours', 'Live Q&A session with program facilitators. Bring your questions, scenarios, and challenges for real-time guidance.', 'https://us02web.zoom.us/j/7066175410', (CURRENT_DATE + INTERVAL '3 days')::timestamp + TIME '14:00:00', 60, 'scheduled', NOW(), NOW()),
    (gen_random_uuid(), workforce_program_id, 'Weekly Office Hours', 'Live Q&A session with program facilitators. Bring your questions, scenarios, and challenges for real-time guidance.', 'https://us02web.zoom.us/j/7066175410', (CURRENT_DATE + INTERVAL '10 days')::timestamp + TIME '14:00:00', 60, 'scheduled', NOW(), NOW()),
    (gen_random_uuid(), workforce_program_id, 'Weekly Office Hours', 'Live Q&A session with program facilitators. Bring your questions, scenarios, and challenges for real-time guidance.', 'https://us02web.zoom.us/j/7066175410', (CURRENT_DATE + INTERVAL '17 days')::timestamp + TIME '14:00:00', 60, 'scheduled', NOW(), NOW()),
    (gen_random_uuid(), workforce_program_id, 'Weekly Office Hours', 'Live Q&A session with program facilitators. Bring your questions, scenarios, and challenges for real-time guidance.', 'https://us02web.zoom.us/j/7066175410', (CURRENT_DATE + INTERVAL '24 days')::timestamp + TIME '14:00:00', 60, 'scheduled', NOW(), NOW()),
    (gen_random_uuid(), workforce_program_id, 'Career Strategy Deep Dive', 'Special session focused on career positioning, networking, and job search strategies in AI-driven workplaces.', 'https://us02web.zoom.us/j/7066175410', (CURRENT_DATE + INTERVAL '5 days')::timestamp + TIME '18:00:00', 90, 'scheduled', NOW(), NOW()),
    (gen_random_uuid(), workforce_program_id, 'AI Tools Workshop', 'Hands-on session exploring practical AI tools for professional productivity and workflow optimization.', 'https://us02web.zoom.us/j/7066175410', (CURRENT_DATE + INTERVAL '12 days')::timestamp + TIME '16:00:00', 75, 'scheduled', NOW(), NOW())
  ON CONFLICT DO NOTHING;
END $$;
