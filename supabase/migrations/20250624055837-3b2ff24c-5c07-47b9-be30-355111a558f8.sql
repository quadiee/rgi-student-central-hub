
-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role public.user_role DEFAULT 'student'::public.user_role,
ADD COLUMN IF NOT EXISTS department public.department DEFAULT 'CSE'::public.department;

-- Add missing columns to user_invitations table  
ALTER TABLE public.user_invitations
ADD COLUMN IF NOT EXISTS role public.user_role DEFAULT 'student'::public.user_role,
ADD COLUMN IF NOT EXISTS department public.department DEFAULT 'CSE'::public.department;

-- Update the get_invitation_details function to ensure proper return types
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

-- Update the admin invitation creation function to use correct admin role
CREATE OR REPLACE FUNCTION public.create_admin_invitation_if_not_exists()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_invitation record;
  result json;
BEGIN
  -- Check if admin invitation already exists and is valid
  SELECT * INTO existing_invitation
  FROM public.user_invitations
  WHERE email = 'praveen@rgce.edu.in'
    AND is_active = true
    AND expires_at > now()
    AND used_at IS NULL;

  IF existing_invitation.id IS NOT NULL THEN
    result := json_build_object(
      'success', true,
      'message', 'Admin invitation already exists',
      'invitation_id', existing_invitation.id,
      'role', existing_invitation.role
    );
    RETURN result;
  END IF;

  -- Create new admin invitation with correct admin role
  INSERT INTO public.user_invitations (
    email,
    role,
    department,
    employee_id,
    invited_by,
    is_active,
    expires_at
  ) VALUES (
    'praveen@rgce.edu.in',
    'admin'::public.user_role,
    'ADMIN'::public.department,
    'ADMIN001',
    NULL,
    true,
    now() + interval '30 days'
  );

  result := json_build_object(
    'success', true,
    'message', 'Admin invitation created successfully with admin role'
  );

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'error', SQLERRM
    );
    RETURN result;
END;
$$;
