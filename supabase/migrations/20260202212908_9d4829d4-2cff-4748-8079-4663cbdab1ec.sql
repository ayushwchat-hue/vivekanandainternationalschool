-- Step 1: Create admin_sessions table for server-side session validation
CREATE TABLE public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT NOT NULL UNIQUE,
  admin_id UUID NOT NULL REFERENCES public.admin_credentials(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS - no policies means only service_role can access
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Add index for fast token lookups
CREATE INDEX idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_expires ON public.admin_sessions(expires_at);

-- Add comment explaining the security design
COMMENT ON TABLE public.admin_sessions IS 'Secured session table - no public access. Only accessible via edge functions using service_role.';

-- Step 2: Drop existing overly permissive policies on admission_inquiries
DROP POLICY IF EXISTS "Anyone can view inquiries" ON public.admission_inquiries;
DROP POLICY IF EXISTS "Anyone can update inquiries" ON public.admission_inquiries;
DROP POLICY IF EXISTS "Anyone can delete inquiries" ON public.admission_inquiries;

-- Step 3: Keep only the INSERT policy for public submissions
-- The "Anyone can submit inquiry" policy remains for public form submissions
-- SELECT/UPDATE/DELETE will only be possible via edge functions (service_role bypasses RLS)