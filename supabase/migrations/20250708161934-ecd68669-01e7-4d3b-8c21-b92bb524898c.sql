
-- Create a secure function to get all students for admin users
CREATE OR REPLACE FUNCTION public.get_all_students_for_admin(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  email text,
  roll_number text,
  year integer,
  semester integer,
  department_id uuid,
  department_name text,
  department_code text,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role_val user_role;
BEGIN
  -- Get the user's role
  SELECT role INTO user_role_val
  FROM public.profiles
  WHERE profiles.id = p_user_id;

  -- Check if user has admin privileges
  IF user_role_val NOT IN ('admin', 'principal', 'chairman') THEN
    RAISE EXCEPTION 'Access denied: insufficient privileges';
  END IF;

  -- Return all student data with department information
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.email,
    p.roll_number,
    p.year,
    p.semester,
    p.department_id,
    d.name as department_name,
    d.code as department_code,
    p.is_active
  FROM public.profiles p
  LEFT JOIN public.departments d ON p.department_id = d.id
  WHERE p.role = 'student'
    AND p.is_active = true
  ORDER BY p.roll_number;
END;
$$;

-- Fix the check_user_roles function to be more reliable
CREATE OR REPLACE FUNCTION public.check_user_roles(user_id uuid, target_roles text[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
STABLE
AS $$
DECLARE
  user_role_val user_role;
BEGIN
  -- Handle null user_id
  IF user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Get user role
  SELECT role INTO user_role_val
  FROM public.profiles 
  WHERE id = user_id;

  -- Return true if user role is in target roles
  RETURN user_role_val::text = ANY(target_roles);
EXCEPTION
  WHEN OTHERS THEN
    -- Return false on any error to be safe
    RETURN false;
END;
$$;

-- Create a function specifically for student data access with filters
CREATE OR REPLACE FUNCTION public.get_students_with_filters(
  p_user_id uuid,
  p_department_filter text DEFAULT NULL,
  p_year_filter integer DEFAULT NULL,
  p_search_term text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  name text,
  email text,
  roll_number text,
  year integer,
  semester integer,
  department_id uuid,
  department_name text,
  department_code text,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role_val user_role;
BEGIN
  -- Get the user's role
  SELECT role INTO user_role_val
  FROM public.profiles
  WHERE profiles.id = p_user_id;

  -- Check if user has appropriate privileges
  IF user_role_val NOT IN ('admin', 'principal', 'chairman', 'hod') THEN
    RAISE EXCEPTION 'Access denied: insufficient privileges';
  END IF;

  -- Return filtered student data
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.email,
    p.roll_number,
    p.year,
    p.semester,
    p.department_id,
    d.name as department_name,
    d.code as department_code,
    p.is_active
  FROM public.profiles p
  LEFT JOIN public.departments d ON p.department_id = d.id
  WHERE p.role = 'student'
    AND p.is_active = true
    AND (p_department_filter IS NULL OR d.id::text = p_department_filter)
    AND (p_year_filter IS NULL OR p.year = p_year_filter)
    AND (p_search_term IS NULL OR 
         p.name ILIKE '%' || p_search_term || '%' OR
         p.roll_number ILIKE '%' || p_search_term || '%' OR
         p.email ILIKE '%' || p_search_term || '%')
  ORDER BY p.roll_number;
END;
$$;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION public.get_all_students_for_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_students_with_filters(uuid, text, integer, text) TO authenticated;
