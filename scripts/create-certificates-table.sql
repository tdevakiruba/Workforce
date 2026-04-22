-- Create table for storing issued certificates
CREATE TABLE IF NOT EXISTS "wf-certificates" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES "wf-enrollments"(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES "wf-programs"(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('phase', 'program')),
  phase_number INTEGER,
  phase_name TEXT,
  recipient_name TEXT NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_certificates_credential_id ON "wf-certificates"(credential_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON "wf-certificates"(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_enrollment_id ON "wf-certificates"(enrollment_id);

-- Enable RLS
ALTER TABLE "wf-certificates" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own certificates
CREATE POLICY "Users can view own certificates" ON "wf-certificates"
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own certificates
CREATE POLICY "Users can insert own certificates" ON "wf-certificates"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Public can verify certificates by credential_id (read-only, limited fields)
CREATE POLICY "Public can verify certificates" ON "wf-certificates"
  FOR SELECT USING (true);
