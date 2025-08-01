
-- First, let's create a proper function to get faculty with details that handles empty results
CREATE OR REPLACE FUNCTION public.get_faculty_with_details(p_user_id uuid DEFAULT NULL)
RETURNS TABLE(
  faculty_id uuid,
  user_id uuid,
  name text,
  email text,
  employee_code text,
  designation text,
  department_name text,
  department_code text,
  joining_date date,
  phone text,
  gender text,
  age integer,
  years_of_experience integer,
  is_active boolean,
  emergency_contact_name text,
  emergency_contact_phone text,
  current_address text,
  blood_group text,
  marital_status text,
  total_attendance_days integer,
  present_days integer,
  absent_days integer,
  attendance_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fp.id as faculty_id,
    fp.user_id,
    COALESCE(p.name, 'Unknown') as name,
    COALESCE(p.email, 'Unknown') as email,
    COALESCE(fp.employee_code, 'N/A') as employee_code,
    COALESCE(fp.designation, 'Faculty') as designation,
    COALESCE(d.name, 'Unknown Department') as department_name,
    COALESCE(d.code, 'N/A') as department_code,
    fp.joining_date,
    p.phone,
    p.gender,
    p.age,
    fp.years_of_experience,
    fp.is_active,
    fp.emergency_contact_name,
    fp.emergency_contact_phone,
    fp.current_address,
    fp.blood_group,
    fp.marital_status,
    -- Real attendance data (will be 0 if no data exists)
    COALESCE((SELECT COUNT(*) FROM faculty_attendance fa WHERE fa.faculty_id = fp.id), 0)::integer as total_attendance_days,
    COALESCE((SELECT COUNT(*) FROM faculty_attendance fa WHERE fa.faculty_id = fp.id AND fa.overall_status = 'Present'), 0)::integer as present_days,
    COALESCE((SELECT COUNT(*) FROM faculty_attendance fa WHERE fa.faculty_id = fp.id AND fa.overall_status = 'Absent'), 0)::integer as absent_days,
    CASE 
      WHEN (SELECT COUNT(*) FROM faculty_attendance fa WHERE fa.faculty_id = fp.id) > 0 
      THEN ROUND((COALESCE((SELECT COUNT(*) FROM faculty_attendance fa WHERE fa.faculty_id = fp.id AND fa.overall_status = 'Present'), 0)::numeric / (SELECT COUNT(*) FROM faculty_attendance fa WHERE fa.faculty_id = fp.id)::numeric) * 100, 2)
      ELSE 0
    END as attendance_percentage
  FROM faculty_profiles fp
  LEFT JOIN profiles p ON fp.user_id = p.id
  LEFT JOIN departments d ON p.department_id = d.id
  WHERE fp.is_active = true
  ORDER BY p.name NULLS LAST, fp.employee_code;
END;
$$;

-- Update the link_faculty_profile function to CREATE faculty profiles if they don't exist
CREATE OR REPLACE FUNCTION public.create_or_link_faculty_profile(
  p_user_id uuid,
  p_email text,
  p_employee_code text,
  p_name text DEFAULT NULL,
  p_designation text DEFAULT NULL,
  p_department_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  existing_profile_id uuid;
  new_profile_id uuid;
  result json;
BEGIN
  -- Check if faculty profile already exists for this employee code
  SELECT id INTO existing_profile_id
  FROM faculty_profiles
  WHERE employee_code = p_employee_code AND user_id IS NULL;
  
  IF existing_profile_id IS NOT NULL THEN
    -- Link existing profile
    UPDATE faculty_profiles
    SET user_id = p_user_id, is_active = true, updated_at = now()
    WHERE id = existing_profile_id;
    
    result := json_build_object(
      'success', true,
      'message', 'Faculty profile linked successfully',
      'faculty_profile_id', existing_profile_id,
      'action', 'linked'
    );
  ELSE
    -- Create new faculty profile
    INSERT INTO faculty_profiles (
      user_id,
      employee_code,
      designation,
      joining_date,
      is_active
    ) VALUES (
      p_user_id,
      p_employee_code,
      COALESCE(p_designation, 'Faculty'),
      CURRENT_DATE,
      true
    ) RETURNING id INTO new_profile_id;
    
    result := json_build_object(
      'success', true,
      'message', 'Faculty profile created successfully',
      'faculty_profile_id', new_profile_id,
      'action', 'created'
    );
  END IF;
  
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
