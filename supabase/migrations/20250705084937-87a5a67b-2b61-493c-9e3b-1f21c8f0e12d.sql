
-- Fix the handle_new_user function to properly handle invitations
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
