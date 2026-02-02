-- Enable RLS on admin_credentials table (blocks all access by default)
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- No policies are created intentionally - this means:
-- - anon users: NO access
-- - authenticated users: NO access  
-- - service_role (edge functions): FULL access (bypasses RLS)

-- Add a comment explaining the security design
COMMENT ON TABLE public.admin_credentials IS 'Secured table - no public access. Only accessible via edge functions using service_role.';