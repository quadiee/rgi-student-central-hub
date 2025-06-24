
-- Simplify the admin setup by creating a direct admin user creation function
CREATE OR REPLACE FUNCTION public.create_direct_admin()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Delete any existing admin invitation to start fresh
  DELETE FROM public.user_invitations 
  WHERE email = 'praveen@rgce.edu.in';
  
  -- Create a simple admin invitation that doesn't expire
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
    'ADMIN'::public.department,
    'ADMIN001',
    NULL,
    true,
    now() + interval '1 year' -- Long expiration
  ) ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    is_active = true,
    expires_at = now() + interval '1 year',
    used_at = NULL;

  result := json_build_object(
    'success', true,
    'message', 'Admin invitation created and ready for registration'
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

-- Update the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_role_val public.user_role;
  user_dept_val public.department;
BEGIN
  -- Get role and department from user metadata with safe defaults
  user_role_val := COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'student'::public.user_role);
  user_dept_val := COALESCE((NEW.raw_user_meta_data ->> 'department')::public.department, 'CSE'::public.department);

  -- Insert or update profile (handle case where profile might already exist)
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
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    user_role_val,
    user_dept_val,
    NEW.raw_user_meta_data ->> 'roll_number',
    NEW.raw_user_meta_data ->> 'employee_id',
    true
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    updated_at = now();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Profile creation error for user %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the admin invitation immediately
SELECT public.create_direct_admin();
