-- First, drop all RLS policies that depend on is_director and has_role functions

-- Drop policies on profiles table
DROP POLICY IF EXISTS "Directors can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Drop policies on user_roles table
DROP POLICY IF EXISTS "Directors can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Drop policies on site_content table
DROP POLICY IF EXISTS "Directors can manage site content" ON public.site_content;
DROP POLICY IF EXISTS "Anyone can view site content" ON public.site_content;

-- Drop policies on admission_inquiries table
DROP POLICY IF EXISTS "Directors and teachers can view inquiries" ON public.admission_inquiries;
DROP POLICY IF EXISTS "Directors can manage inquiries" ON public.admission_inquiries;
DROP POLICY IF EXISTS "Directors can delete inquiries" ON public.admission_inquiries;
DROP POLICY IF EXISTS "Anyone can submit inquiry" ON public.admission_inquiries;

-- Drop policies on announcements table
DROP POLICY IF EXISTS "Directors can manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Anyone can view active announcements" ON public.announcements;

-- Drop policies on events table
DROP POLICY IF EXISTS "Directors can manage events" ON public.events;
DROP POLICY IF EXISTS "Anyone can view active events" ON public.events;

-- Drop policies on gallery table
DROP POLICY IF EXISTS "Directors can manage gallery" ON public.gallery;
DROP POLICY IF EXISTS "Anyone can view active gallery items" ON public.gallery;

-- Drop trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.is_director(uuid);
DROP FUNCTION IF EXISTS public.has_role(uuid, user_role);

-- Drop tables
DROP TABLE IF EXISTS public.announcements;
DROP TABLE IF EXISTS public.events;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.user_roles;

-- Drop the user_role enum type
DROP TYPE IF EXISTS public.user_role;

-- Recreate simple RLS policies for remaining tables (no auth required, public access)

-- site_content: Public read, public write (for simplicity since no auth)
CREATE POLICY "Anyone can view site content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Anyone can update site content" ON public.site_content FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert site content" ON public.site_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete site content" ON public.site_content FOR DELETE USING (true);

-- admission_inquiries: Public submit, public view/manage (for simplicity since no auth)
CREATE POLICY "Anyone can view inquiries" ON public.admission_inquiries FOR SELECT USING (true);
CREATE POLICY "Anyone can submit inquiry" ON public.admission_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update inquiries" ON public.admission_inquiries FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete inquiries" ON public.admission_inquiries FOR DELETE USING (true);

-- gallery: Public access
CREATE POLICY "Anyone can view gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Anyone can insert gallery" ON public.gallery FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update gallery" ON public.gallery FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete gallery" ON public.gallery FOR DELETE USING (true);