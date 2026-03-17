-- Create wf-lab_submissions table
CREATE TABLE IF NOT EXISTS "wf-lab_submissions" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES "wf-programs"(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'approved', 'needs_revision', 'completed')),
  feedback TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_lab_submissions_user_program ON "wf-lab_submissions"(user_id, program_id);
CREATE INDEX IF NOT EXISTS idx_lab_submissions_status ON "wf-lab_submissions"(status);
CREATE INDEX IF NOT EXISTS idx_lab_submissions_created_at ON "wf-lab_submissions"(created_at DESC);

-- Enable RLS
ALTER TABLE "wf-lab_submissions" ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own submissions"
  ON "wf-lab_submissions" FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions"
  ON "wf-lab_submissions" FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND EXISTS (
      SELECT 1 FROM "wf-enrollments"
      WHERE user_id = auth.uid()
      AND program_id = "wf-lab_submissions".program_id
      AND status = 'active'
    )
  );

CREATE POLICY "Users can update own submissions"
  ON "wf-lab_submissions" FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
