-- Create wf-office_hours table
CREATE TABLE IF NOT EXISTS "wf-office_hours" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES "wf-programs"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  meeting_url TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_office_hours_program_status ON "wf-office_hours"(program_id, status);
CREATE INDEX IF NOT EXISTS idx_office_hours_scheduled_at ON "wf-office_hours"(scheduled_at);

-- Enable RLS
ALTER TABLE "wf-office_hours" ENABLE ROW LEVEL SECURITY;

-- RLS policies - allow authenticated users to view office hours for their programs
CREATE POLICY "Authenticated users can view office hours"
  ON "wf-office_hours" FOR SELECT
  USING (
    auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM "wf-enrollments"
      WHERE user_id = auth.uid()
      AND program_id = "wf-office_hours".program_id
      AND status = 'active'
    )
  );
