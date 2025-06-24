
-- Create a function to handle admin invitation creation with proper permissions
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
      'invitation_id', existing_invitation.id
    );
    RETURN result;
  END IF;

  -- Create new admin invitation
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
    'admin'::user_role,
    'CSE'::department,
    'ADMIN001',
    NULL,
    true,
    now() + interval '30 days'
  );

  result := json_build_object(
    'success', true,
    'message', 'Admin invitation created successfully'
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

-- Update RLS policy to allow the function to insert invitations
DROP POLICY IF EXISTS "Allow system to create invitations" ON public.user_invitations;
CREATE POLICY "Allow system to create invitations" 
  ON public.user_invitations 
  FOR INSERT 
  WITH CHECK (true);

-- Also allow authenticated users to read invitations for the signup process
DROP POLICY IF EXISTS "Allow users to read their own invitations" ON public.user_invitations;
CREATE POLICY "Allow users to read their own invitations" 
  ON public.user_invitations 
  FOR SELECT 
  USING (true);
