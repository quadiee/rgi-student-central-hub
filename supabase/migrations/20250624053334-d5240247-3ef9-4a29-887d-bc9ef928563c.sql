
-- Create a function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    name,
    email,
    role,
    department,
    roll_number,
    employee_id,
    is_active
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'student'),
    COALESCE((NEW.raw_user_meta_data ->> 'department')::department, 'CSE'),
    NEW.raw_user_meta_data ->> 'roll_number',
    NEW.raw_user_meta_data ->> 'employee_id',
    true
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a table for user invitations
CREATE TABLE IF NOT EXISTS public.user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL,
  department department NOT NULL,
  roll_number TEXT,
  employee_id TEXT,
  invited_by UUID REFERENCES public.profiles(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on invitations table
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for invitations - only admins can manage
CREATE POLICY "Admins can manage invitations" ON public.user_invitations
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'principal'));

-- Update profiles RLS policies to be more specific
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "HODs can view department profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view and manage all profiles" ON public.profiles
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'principal'));

CREATE POLICY "HODs can view department profiles" ON public.profiles
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'hod' AND 
    department = public.get_user_department(auth.uid())
  );

-- Function to validate invitation token and get invitation details
CREATE OR REPLACE FUNCTION public.get_invitation_details(invitation_email TEXT)
RETURNS TABLE (
  role user_role,
  department department,
  roll_number TEXT,
  employee_id TEXT,
  is_valid BOOLEAN
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    inv.role,
    inv.department,
    inv.roll_number,
    inv.employee_id,
    (inv.expires_at > now() AND inv.used_at IS NULL AND inv.is_active = true) as is_valid
  FROM public.user_invitations inv
  WHERE inv.email = invitation_email
  ORDER BY inv.invited_at DESC
  LIMIT 1;
$$;

-- Function to mark invitation as used
CREATE OR REPLACE FUNCTION public.mark_invitation_used(invitation_email TEXT)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  UPDATE public.user_invitations
  SET used_at = now()
  WHERE email = invitation_email AND used_at IS NULL;
$$;
