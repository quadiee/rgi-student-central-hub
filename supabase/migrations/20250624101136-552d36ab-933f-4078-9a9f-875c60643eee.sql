
-- Fix RLS policies for profiles table to allow automatic profile creation

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view and manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "HODs can view department profiles" ON public.profiles;

-- Create a policy that allows the system to create profiles during signup
CREATE POLICY "Allow system profile creation" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow admins to view and manage all profiles
CREATE POLICY "Admins can view and manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'principal')
    )
  );

-- Allow HODs to view department profiles
CREATE POLICY "HODs can view department profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles hod
      WHERE hod.id = auth.uid() 
      AND hod.role = 'hod' 
      AND hod.department_id = profiles.department_id
    )
  );

-- Create proper departments and populate with basic data
INSERT INTO public.departments (id, name, code, description, is_active) VALUES
  (gen_random_uuid(), 'Computer Science & Engineering', 'CSE', 'Computer Science and Engineering Department', true),
  (gen_random_uuid(), 'Electronics & Communication Engineering', 'ECE', 'Electronics and Communication Engineering Department', true),
  (gen_random_uuid(), 'Electrical & Electronics Engineering', 'EEE', 'Electrical and Electronics Engineering Department', true),
  (gen_random_uuid(), 'Mechanical Engineering', 'MECH', 'Mechanical Engineering Department', true),
  (gen_random_uuid(), 'Civil Engineering', 'CIVIL', 'Civil Engineering Department', true),
  (gen_random_uuid(), 'Information Technology', 'IT', 'Information Technology Department', true),
  (gen_random_uuid(), 'Administration', 'ADMIN', 'Administrative Department', true)
ON CONFLICT (code) DO NOTHING;

-- Update the handle_new_user function to work with department_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_role_val public.user_role;
  user_dept_val public.department;
  dept_id_val uuid;
BEGIN
  -- Get role and department from user metadata with safe defaults
  user_role_val := COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'student'::public.user_role);
  user_dept_val := COALESCE((NEW.raw_user_meta_data ->> 'department')::public.department, 'CSE'::public.department);

  -- Get the department_id based on the department code
  SELECT id INTO dept_id_val 
  FROM public.departments 
  WHERE code = user_dept_val::text 
  LIMIT 1;

  -- If no department found, use CSE as default
  IF dept_id_val IS NULL THEN
    SELECT id INTO dept_id_val 
    FROM public.departments 
    WHERE code = 'CSE' 
    LIMIT 1;
  END IF;

  -- Insert or update profile
  INSERT INTO public.profiles (
    id,
    name,
    email,
    role,
    department,
    department_id,
    roll_number,
    employee_id,
    is_active
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    user_role_val,
    user_dept_val,
    dept_id_val,
    NEW.raw_user_meta_data ->> 'roll_number',
    NEW.raw_user_meta_data ->> 'employee_id',
    true
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    department_id = EXCLUDED.department_id,
    updated_at = now();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Profile creation error for user %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- Add RLS policies for other important tables
-- User invitations policies
DROP POLICY IF EXISTS "Admins can manage invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Allow system to create invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Allow users to read their own invitations" ON public.user_invitations;

CREATE POLICY "Allow system to create invitations" ON public.user_invitations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to read invitations" ON public.user_invitations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage invitations" ON public.user_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'principal')
    )
  );
