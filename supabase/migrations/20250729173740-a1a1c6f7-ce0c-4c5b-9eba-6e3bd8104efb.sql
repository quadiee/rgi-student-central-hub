
-- Check current structure and migrate properly
DO $$
BEGIN
    -- Check if department_id column exists, if not, add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_invitations' 
                   AND column_name = 'department_id') THEN
        
        -- Add the new department_id column
        ALTER TABLE user_invitations 
        ADD COLUMN department_id UUID REFERENCES departments(id);
        
        -- If there's existing data with old department enum, migrate it
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_invitations' 
                   AND column_name = 'department') THEN
            
            -- Update department_id based on department enum values
            UPDATE user_invitations 
            SET department_id = (
                SELECT d.id 
                FROM departments d 
                WHERE d.code = user_invitations.department::text
            );
            
            -- Drop the old department column
            ALTER TABLE user_invitations DROP COLUMN department;
        END IF;
    END IF;
END $$;

-- Update the validate_invitation_token function to return department_id
CREATE OR REPLACE FUNCTION public.validate_invitation_token(p_token text)
RETURNS TABLE(id uuid, email text, role user_role, department_id uuid, roll_number text, employee_id text, is_valid boolean, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Get invitation by token
  SELECT * INTO invitation_record
  FROM public.user_invitations ui
  WHERE ui.token = p_token;

  -- Check if invitation exists
  IF invitation_record.id IS NULL THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::TEXT, NULL::public.user_role, NULL::UUID,
      NULL::TEXT, NULL::TEXT, FALSE, 'Invalid invitation token'::TEXT;
    RETURN;
  END IF;

  -- Check if invitation is expired
  IF invitation_record.expires_at < now() THEN
    RETURN QUERY SELECT 
      invitation_record.id, invitation_record.email, invitation_record.role, 
      invitation_record.department_id, invitation_record.roll_number, 
      invitation_record.employee_id, FALSE, 'Invitation has expired'::TEXT;
    RETURN;
  END IF;

  -- Check if invitation is already used
  IF invitation_record.used_at IS NOT NULL THEN
    RETURN QUERY SELECT 
      invitation_record.id, invitation_record.email, invitation_record.role, 
      invitation_record.department_id, invitation_record.roll_number, 
      invitation_record.employee_id, FALSE, 'Invitation has already been used'::TEXT;
    RETURN;
  END IF;

  -- Check if invitation is active
  IF NOT invitation_record.is_active THEN
    RETURN QUERY SELECT 
      invitation_record.id, invitation_record.email, invitation_record.role, 
      invitation_record.department_id, invitation_record.roll_number, 
      invitation_record.employee_id, FALSE, 'Invitation is no longer active'::TEXT;
    RETURN;
  END IF;

  -- Invitation is valid
  RETURN QUERY SELECT 
    invitation_record.id, invitation_record.email, invitation_record.role, 
    invitation_record.department_id, invitation_record.roll_number, 
    invitation_record.employee_id, TRUE, NULL::TEXT;
  RETURN;
END;
$function$;

-- Update the get_invitation_details function to use department_id
CREATE OR REPLACE FUNCTION public.get_invitation_details(invitation_email text)
RETURNS TABLE(id uuid, email text, role user_role, department_id uuid, roll_number text, employee_id text, invited_at timestamp with time zone, expires_at timestamp with time zone, used_at timestamp with time zone, is_active boolean, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF invitation_email IS NULL OR invitation_email = '' THEN
    RAISE EXCEPTION 'Invalid email parameter';
  END IF;

  RETURN QUERY
  SELECT 
    ui.id,
    ui.email,
    ui.role,
    ui.department_id,
    ui.roll_number,
    ui.employee_id,
    ui.invited_at,
    ui.expires_at,
    ui.used_at,
    ui.is_active,
    (ui.is_active = true AND ui.expires_at > now() AND ui.used_at IS NULL) as is_valid
  FROM public.user_invitations ui
  WHERE ui.email = invitation_email;
END;
$function$;
