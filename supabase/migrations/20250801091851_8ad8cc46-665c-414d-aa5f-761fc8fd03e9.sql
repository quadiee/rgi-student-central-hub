
-- Update the validate_invitation_token function to return department information properly
CREATE OR REPLACE FUNCTION public.validate_invitation_token(p_token text)
RETURNS TABLE(
  id uuid, 
  email text, 
  role user_role, 
  department_id uuid,
  department_name text,
  department_code text,
  roll_number text, 
  employee_id text, 
  is_valid boolean, 
  error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Get invitation by token with department information
  SELECT 
    ui.*,
    d.name as dept_name,
    d.code as dept_code
  INTO invitation_record
  FROM public.user_invitations ui
  LEFT JOIN public.departments d ON ui.department_id = d.id
  WHERE ui.token = p_token;

  -- Check if invitation exists
  IF invitation_record.id IS NULL THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::TEXT, NULL::public.user_role, NULL::UUID,
      NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, 
      FALSE, 'Invalid invitation token'::TEXT;
    RETURN;
  END IF;

  -- Check if invitation is expired
  IF invitation_record.expires_at < now() THEN
    RETURN QUERY SELECT 
      invitation_record.id, invitation_record.email, invitation_record.role, 
      invitation_record.department_id, invitation_record.dept_name, invitation_record.dept_code,
      invitation_record.roll_number, invitation_record.employee_id, 
      FALSE, 'Invitation has expired'::TEXT;
    RETURN;
  END IF;

  -- Check if invitation is already used
  IF invitation_record.used_at IS NOT NULL THEN
    RETURN QUERY SELECT 
      invitation_record.id, invitation_record.email, invitation_record.role, 
      invitation_record.department_id, invitation_record.dept_name, invitation_record.dept_code,
      invitation_record.roll_number, invitation_record.employee_id, 
      FALSE, 'Invitation has already been used'::TEXT;
    RETURN;
  END IF;

  -- Check if invitation is active
  IF NOT invitation_record.is_active THEN
    RETURN QUERY SELECT 
      invitation_record.id, invitation_record.email, invitation_record.role, 
      invitation_record.department_id, invitation_record.dept_name, invitation_record.dept_code,
      invitation_record.roll_number, invitation_record.employee_id, 
      FALSE, 'Invitation is no longer active'::TEXT;
    RETURN;
  END IF;

  -- Invitation is valid
  RETURN QUERY SELECT 
    invitation_record.id, invitation_record.email, invitation_record.role, 
    invitation_record.department_id, invitation_record.dept_name, invitation_record.dept_code,
    invitation_record.roll_number, invitation_record.employee_id, 
    TRUE, NULL::TEXT;
  RETURN;
END;
$function$
