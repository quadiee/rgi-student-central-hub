
-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role public.user_role DEFAULT 'student'::public.user_role,
ADD COLUMN department public.department DEFAULT 'CSE'::public.department;

-- Add missing columns to user_invitations table  
ALTER TABLE public.user_invitations
ADD COLUMN role public.user_role DEFAULT 'student'::public.user_role,
ADD COLUMN department public.department DEFAULT 'CSE'::public.department;

-- Create the missing get_invitation_details function
CREATE OR REPLACE FUNCTION public.get_invitation_details(invitation_email text)
RETURNS TABLE (
  id uuid,
  email text,
  role public.user_role,
  department public.department,
  roll_number text,
  employee_id text,
  invited_at timestamptz,
  expires_at timestamptz,
  used_at timestamptz,
  is_active boolean,
  is_valid boolean
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    ui.id,
    ui.email,
    ui.role,
    ui.department,
    ui.roll_number,
    ui.employee_id,
    ui.invited_at,
    ui.expires_at,
    ui.used_at,
    ui.is_active,
    (ui.is_active = true AND ui.expires_at > now() AND ui.used_at IS NULL) as is_valid
  FROM public.user_invitations ui
  WHERE ui.email = invitation_email;
$$;
