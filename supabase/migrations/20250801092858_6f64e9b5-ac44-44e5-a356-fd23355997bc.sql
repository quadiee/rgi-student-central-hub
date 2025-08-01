
-- Simplify the validate_invitation_token function to return consistent data
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
  dept_record RECORD;
BEGIN
  -- Get invitation by token
  SELECT * INTO invitation_record
  FROM public.user_invitations ui
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
      NULL::UUID, NULL::TEXT, NULL::TEXT,
      invitation_record.roll_number, invitation_record.employee_id, 
      FALSE, 'Invitation has expired'::TEXT;
    RETURN;
  END IF;

  -- Check if invitation is already used
  IF invitation_record.used_at IS NOT NULL THEN
    RETURN QUERY SELECT 
      invitation_record.id, invitation_record.email, invitation_record.role, 
      NULL::UUID, NULL::TEXT, NULL::TEXT,
      invitation_record.roll_number, invitation_record.employee_id, 
      FALSE, 'Invitation has already been used'::TEXT;
    RETURN;
  END IF;

  -- Check if invitation is active
  IF NOT invitation_record.is_active THEN
    RETURN QUERY SELECT 
      invitation_record.id, invitation_record.email, invitation_record.role, 
      NULL::UUID, NULL::TEXT, NULL::TEXT,
      invitation_record.roll_number, invitation_record.employee_id, 
      FALSE, 'Invitation is no longer active'::TEXT;
    RETURN;
  END IF;

  -- Get department details if department_id exists
  IF invitation_record.department_id IS NOT NULL THEN
    SELECT id, name, code INTO dept_record
    FROM public.departments 
    WHERE id = invitation_record.department_id;
  ELSE
    -- Fallback: try to find department by the old department enum
    SELECT id, name, code INTO dept_record
    FROM public.departments 
    WHERE code = invitation_record.department::text;
  END IF;

  -- Return valid invitation with department details
  RETURN QUERY SELECT 
    invitation_record.id, 
    invitation_record.email, 
    invitation_record.role, 
    COALESCE(invitation_record.department_id, dept_record.id),
    dept_record.name,
    dept_record.code,
    invitation_record.roll_number, 
    invitation_record.employee_id, 
    TRUE, 
    NULL::TEXT;
  RETURN;
END;
$function$;
