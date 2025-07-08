
-- Phase 1: Database Schema Updates

-- Update the handle_new_user function to handle invitations properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  invitation_record RECORD;
  user_role_val public.user_role;
  dept_id_val uuid;
BEGIN
  -- First check if there's an active invitation for this email
  SELECT * INTO invitation_record
  FROM public.user_invitations
  WHERE email = NEW.email 
    AND is_active = true 
    AND expires_at > now() 
    AND used_at IS NULL
  LIMIT 1;

  IF invitation_record.id IS NOT NULL THEN
    -- Use invitation data
    user_role_val := invitation_record.role;
    
    -- Get department_id from departments table using the invitation department
    SELECT id INTO dept_id_val 
    FROM public.departments 
    WHERE code = invitation_record.department::text 
    LIMIT 1;
    
    -- Mark invitation as used
    UPDATE public.user_invitations 
    SET used_at = now() 
    WHERE id = invitation_record.id;
    
  ELSE
    -- Fallback to metadata or defaults
    user_role_val := COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'student'::public.user_role);
    
    -- Get department_id for CSE as default
    SELECT id INTO dept_id_val 
    FROM public.departments 
    WHERE code = 'CSE' 
    LIMIT 1;
  END IF;

  -- Insert or update profile with correct column names
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
    is_active
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    user_role_val,
    dept_id_val,
    COALESCE(NEW.raw_user_meta_data ->> 'roll_number', invitation_record.roll_number),
    COALESCE(NEW.raw_user_meta_data ->> 'employee_id', invitation_record.employee_id),
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'guardian_name',
    NEW.raw_user_meta_data ->> 'guardian_phone',
    NEW.raw_user_meta_data ->> 'address',
    true
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    department_id = EXCLUDED.department_id,
    roll_number = EXCLUDED.roll_number,
    employee_id = EXCLUDED.employee_id,
    phone = EXCLUDED.phone,
    guardian_name = EXCLUDED.guardian_name,
    guardian_phone = EXCLUDED.guardian_phone,
    address = EXCLUDED.address,
    updated_at = now();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Profile creation error for user %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create function to validate invitation and get details
CREATE OR REPLACE FUNCTION public.validate_invitation_token(p_token TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  role public.user_role,
  department public.department,
  roll_number TEXT,
  employee_id TEXT,
  is_valid BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
      NULL::UUID, NULL::TEXT, NULL::public.user_role, NULL::public.department, 
      NULL::TEXT, NULL::TEXT, FALSE, 'Invalid invitation token'::TEXT;
    RETURN;
  END IF;

  -- Check if invitation is expired
  IF invitation_record.expires_at < now() THEN
    RETURN QUERY SELECT 
      invitation_record.id, invitation_record.email, invitation_record.role, 
      invitation_record.department, invitation_record.roll_number, 
      invitation_record.employee_id, FALSE, 'Invitation has expired'::TEXT;
    RETURN;
  END IF;

  -- Check if invitation is already used
  IF invitation_record.used_at IS NOT NULL THEN
    RETURN QUERY SELECT 
      invitation_record.id, invitation_record.email, invitation_record.role, 
      invitation_record.department, invitation_record.roll_number, 
      invitation_record.employee_id, FALSE, 'Invitation has already been used'::TEXT;
    RETURN;
  END IF;

  -- Check if invitation is active
  IF NOT invitation_record.is_active THEN
    RETURN QUERY SELECT 
      invitation_record.id, invitation_record.email, invitation_record.role, 
      invitation_record.department, invitation_record.roll_number, 
      invitation_record.employee_id, FALSE, 'Invitation is no longer active'::TEXT;
    RETURN;
  END IF;

  -- Invitation is valid
  RETURN QUERY SELECT 
    invitation_record.id, invitation_record.email, invitation_record.role, 
    invitation_record.department, invitation_record.roll_number, 
    invitation_record.employee_id, TRUE, NULL::TEXT;
  RETURN;
END;
$$;

-- Create function to update profile after complete form submission
CREATE OR REPLACE FUNCTION public.complete_invitation_profile(
  p_user_id UUID,
  p_invitation_id UUID,
  p_profile_data JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the profile with complete data
  UPDATE public.profiles SET
    name = p_profile_data->>'name',
    phone = p_profile_data->>'phone',
    roll_number = COALESCE(p_profile_data->>'roll_number', roll_number),
    employee_id = COALESCE(p_profile_data->>'employee_id', employee_id),
    guardian_name = p_profile_data->>'guardian_name',
    guardian_phone = p_profile_data->>'guardian_phone',
    address = p_profile_data->>'address',
    updated_at = now()
  WHERE id = p_user_id;

  -- Mark invitation as used
  UPDATE public.user_invitations 
  SET used_at = now(),
      updated_at = now()
  WHERE id = p_invitation_id;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error completing invitation profile: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Add token column to user_invitations if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_invitations' 
    AND column_name = 'token'
  ) THEN
    ALTER TABLE public.user_invitations ADD COLUMN token TEXT;
    
    -- Generate tokens for existing invitations
    UPDATE public.user_invitations 
    SET token = gen_random_uuid()::text 
    WHERE token IS NULL;
  END IF;
END $$;

-- Create index on token for better performance
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON public.user_invitations(token);

-- Update existing invitations to have tokens if they don't
UPDATE public.user_invitations 
SET token = gen_random_uuid()::text 
WHERE token IS NULL OR token = '';
