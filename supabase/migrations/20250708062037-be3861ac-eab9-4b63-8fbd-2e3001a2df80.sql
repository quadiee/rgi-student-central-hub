
-- Add profile completion tracking field
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;

-- Update the handle_new_user function to create minimal placeholder profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
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
      is_active,
      profile_completed
    ) VALUES (
      NEW.id,
      NEW.email, -- Use email as temporary name
      NEW.email,
      invitation_record.role,
      (SELECT id FROM public.departments WHERE code = invitation_record.department::text LIMIT 1),
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

-- Update the complete_invitation_profile function to properly complete profiles
CREATE OR REPLACE FUNCTION public.complete_invitation_profile(p_user_id uuid, p_invitation_id uuid, p_profile_data jsonb)
 RETURNS boolean
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
    is_active = true,           -- Activate the profile
    profile_completed = true,   -- Mark as completed
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

-- Update existing incomplete profiles (one-time fix)
UPDATE public.profiles 
SET profile_completed = true 
WHERE profile_completed IS NULL;
