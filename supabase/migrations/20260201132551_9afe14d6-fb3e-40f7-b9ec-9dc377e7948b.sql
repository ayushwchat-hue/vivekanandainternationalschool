-- Create table for admin credentials (single admin account)
CREATE TABLE public.admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE DEFAULT 'admin',
  password_hash text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- Only allow reading via edge functions (no direct client access)
-- No policies = no direct access, must go through edge functions

-- Add trigger for updated_at
CREATE TRIGGER update_admin_credentials_updated_at
BEFORE UPDATE ON public.admin_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin credentials (password: admin123 - will be hashed by edge function on first change)
-- Using bcrypt format placeholder that will be replaced
INSERT INTO public.admin_credentials (username, password_hash) 
VALUES ('admin', '$2a$10$rQEY7GxLqpLFqKpVL1QqKuZVLqKpVL1QqKuZVLqKpVL1QqKuZVLqK');