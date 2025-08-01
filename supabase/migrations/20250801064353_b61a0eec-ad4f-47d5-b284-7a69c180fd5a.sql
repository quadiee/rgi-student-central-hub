
-- Add department_id column to user_invitations table
ALTER TABLE public.user_invitations 
ADD COLUMN department_id UUID REFERENCES public.departments(id);

-- Migrate existing data from department enum to department_id UUID
-- Map the enum values to actual department UUIDs
UPDATE public.user_invitations 
SET department_id = (
  SELECT d.id 
  FROM public.departments d 
  WHERE d.code = user_invitations.department::text
)
WHERE department_id IS NULL;

-- Make department_id NOT NULL after migration
ALTER TABLE public.user_invitations 
ALTER COLUMN department_id SET NOT NULL;

-- Drop the old department enum column
ALTER TABLE public.user_invitations 
DROP COLUMN department;

-- Update the validate_invitation_token function to use department_id
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
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Get invitation by token with department info
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
$$;

-- Update the handle_new_user trigger function to work with department_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  invitation_record RECORD;
  user_role_val public.user_role;
  dept_id_val uuid;
BEGIN
  -- Check if there's an active invitation for this email
  SELECT * INTO invitation_record
  FROM public.user_invitations
  WHERE email = NEW.email 
    AND is_active = true 
    AND expires_at > now() 
    AND used_at IS NULL
  LIMIT 1;

  IF invitation_record.id IS NOT NULL THEN
    -- For invitation-based users, create minimal placeholder profile
    INSERT INTO public.profiles (
      id,
      name,
      email,
      role,
      department_id,
      roll_number,
      employee_id,
      is_active,
      profile_completed
    ) VALUES (
      NEW.id,
      NEW.email, -- Use email as temporary name
      NEW.email,
      invitation_record.role,
      invitation_record.department_id, -- Use department_id from invitation
      invitation_record.roll_number,
      invitation_record.employee_id,
      false, -- Keep inactive until profile is completed
      false  -- Mark as incomplete
    );
    
  ELSE
    -- For direct signups (non-invitation), create complete profile as before
    user_role_val := COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'student'::public.user_role);
    
    SELECT id INTO dept_id_val 
    FROM public.departments 
    WHERE code = 'CSE' 
    LIMIT 1;
    
    INSERT INTO public.profiles (
      id,
      name,
      email,
      role,
      department_id,
      roll_number,
      employee_id,
      phone,
      guardian_name,
      guardian_phone,
      address,
      is_active,
      profile_completed
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
      NEW.email,
      user_role_val,
      dept_id_val,
      NEW.raw_user_meta_data ->> 'roll_number',
      NEW.raw_user_meta_data ->> 'employee_id',
      NEW.raw_user_meta_data ->> 'phone',
      NEW.raw_user_meta_data ->> 'guardian_name',
      NEW.raw_user_meta_data ->> 'guardian_phone',
      NEW.raw_user_meta_data ->> 'address',
      true,  -- Direct signups are active
      true   -- Direct signups are complete
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Profile creation error for user %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;
