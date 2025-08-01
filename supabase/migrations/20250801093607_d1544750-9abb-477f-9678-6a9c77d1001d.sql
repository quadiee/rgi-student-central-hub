
-- Drop and recreate the validate_invitation_token function with the correct structure
DROP FUNCTION IF EXISTS public.validate_invitation_token(text);

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
SET search_path TO 'public'
AS $function$
DECLARE
  invitation_record RECORD;
  dept_record RECORD;
BEGIN
  -- Get invitation by token
  SELECT ui.* INTO invitation_record
  FROM user_invitations ui
  WHERE ui.token = p_token;

  -- Check if invitation exists
  IF invitation_record.id IS NULL THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::TEXT, NULL::user_role, NULL::UUID,
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
  IF NOT COALESCE(invitation_record.is_active, false) THEN
    RETURN QUERY SELECT 
      invitation_record.id, invitation_record.email, invitation_record.role, 
      NULL::UUID, NULL::TEXT, NULL::TEXT,
      invitation_record.roll_number, invitation_record.employee_id, 
      FALSE, 'Invitation is no longer active'::TEXT;
    RETURN;
  END IF;

  -- Get department details
  IF invitation_record.department_id IS NOT NULL THEN
    -- Use the department_id from the invitation
    SELECT d.id, d.name, d.code INTO dept_record
    FROM departments d 
    WHERE d.id = invitation_record.department_id;
  ELSE
    -- Fallback: try to find department by the old department enum if it exists
    SELECT d.id, d.name, d.code INTO dept_record
    FROM departments d 
    WHERE d.code = invitation_record.department::text
    LIMIT 1;
  END IF;

  -- Return valid invitation with department details
  RETURN QUERY SELECT 
    invitation_record.id, 
    invitation_record.email, 
    invitation_record.role, 
    dept_record.id,
    dept_record.name,
    dept_record.code,
    invitation_record.roll_number, 
    invitation_record.employee_id, 
    TRUE, 
    NULL::TEXT;
  RETURN;
END;
$function$;
