
-- Ensure enum types exist and are properly defined
DO $$ 
BEGIN
  -- Drop and recreate user_role enum to ensure it's properly defined
  DROP TYPE IF EXISTS public.user_role CASCADE;
  CREATE TYPE public.user_role AS ENUM ('student', 'faculty', 'hod', 'principal', 'admin');
  
  -- Drop and recreate department enum to ensure it's properly defined  
  DROP TYPE IF EXISTS public.department CASCADE;
  CREATE TYPE public.department AS ENUM ('CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Ignore if already exists
END $$;

-- Update the handle_new_user function with better error handling and enum casting
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_role_val public.user_role;
  user_dept_val public.department;
BEGIN
  -- Safely cast role with fallback
  BEGIN
    user_role_val := COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'student'::public.user_role);
  EXCEPTION
    WHEN invalid_text_representation THEN
      user_role_val := 'student'::public.user_role;
  END;
  
  -- Safely cast department with fallback
  BEGIN
    user_dept_val := COALESCE((NEW.raw_user_meta_data ->> 'department')::public.department, 'CSE'::public.department);
  EXCEPTION
    WHEN invalid_text_representation THEN
      user_dept_val := 'CSE'::public.department;
  END;

  INSERT INTO public.profiles (
    id,
    name,
    email,
    role,
    department,
    roll_number,
    employee_id,
    is_active
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'User'),
    NEW.email,
    user_role_val,
    user_dept_val,
    NEW.raw_user_meta_data ->> 'roll_number',
    NEW.raw_user_meta_data ->> 'employee_id',
    true
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger to use the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update the admin invitation function to use the recreated enum
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
    'admin'::public.user_role,
    'CSE'::public.department,
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
