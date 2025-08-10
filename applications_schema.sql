-- ========================================
-- APPLICATIONS TABLE SCHEMA
-- ========================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.applications;

-- Create comprehensive applications table
CREATE TABLE public.applications (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Application content
  cover_letter TEXT,
  resume_base64 TEXT, -- Store resume as base64 (like profile pictures)
  resume_filename TEXT,
  resume_type TEXT CHECK (resume_type IN ('application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')),
  additional_info TEXT, -- Extra description/notes
  
  -- Application status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected', 'withdrawn')),
  
  -- Applicant info snapshot (for easy display)
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_profile_picture TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(opportunity_id, applicant_id) -- Prevent duplicate applications
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_applications_opportunity_id ON public.applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON public.applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.applications(created_at);

-- ========================================
-- TRIGGERS
-- ========================================

-- Update updated_at timestamp
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Applicants can view their own applications
CREATE POLICY "applicants_view_own" ON public.applications
  FOR SELECT USING (auth.uid() = applicant_id);

-- Opportunity creators can view applications to their opportunities
CREATE POLICY "creators_view_applications" ON public.applications
  FOR SELECT USING (
    auth.uid() IN (
      SELECT created_by FROM public.opportunities WHERE id = opportunity_id
    )
  );

-- Users can create applications
CREATE POLICY "users_create_applications" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

-- Users can update their own applications (withdraw, etc.)
CREATE POLICY "users_update_own_applications" ON public.applications
  FOR UPDATE USING (auth.uid() = applicant_id);

-- Opportunity creators can update application status
CREATE POLICY "creators_update_status" ON public.applications
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT created_by FROM public.opportunities WHERE id = opportunity_id
    )
  );

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE public.applications IS 'Applications submitted by users for opportunities';
COMMENT ON COLUMN public.applications.resume_base64 IS 'Base64 encoded resume file (PDF/DOC/DOCX)';
COMMENT ON COLUMN public.applications.applicant_name IS 'Snapshot of applicant name at time of application';
COMMENT ON COLUMN public.applications.applicant_email IS 'Snapshot of applicant email at time of application';

-- ========================================
-- SAMPLE USAGE
-- ========================================

/*
-- Example: Insert a new application
INSERT INTO public.applications (
  opportunity_id,
  applicant_id,
  cover_letter,
  resume_base64,
  resume_filename,
  resume_type,
  additional_info,
  applicant_name,
  applicant_email,
  applicant_profile_picture
) VALUES (
  'opportunity-uuid-here',
  'user-uuid-here',
  'I am very interested in this position...',
  'base64-encoded-resume-here',
  'john_doe_resume.pdf',
  'application/pdf',
  'Available to start immediately',
  'John Doe',
  'john@example.com',
  'base64-profile-pic-here'
);

-- Example: Get all applications for an opportunity
SELECT 
  a.*,
  o.title as opportunity_title
FROM applications a
JOIN opportunities o ON a.opportunity_id = o.id
WHERE a.opportunity_id = 'opportunity-uuid-here'
ORDER BY a.created_at DESC;

-- Example: Get user's applications
SELECT 
  a.*,
  o.title as opportunity_title,
  o.Creator as opportunity_creator
FROM applications a
JOIN opportunities o ON a.opportunity_id = o.id
WHERE a.applicant_id = 'user-uuid-here'
ORDER BY a.created_at DESC;
*/

