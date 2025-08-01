
-- This function is called by useFacultyStats hook
CREATE OR REPLACE FUNCTION public.get_faculty_with_details(p_user_id uuid)
 RETURNS TABLE(
   faculty_id uuid,
   user_id uuid,
   name text,
   email text,
   employee_code text,
   designation text,
   department_name text,
   department_code text,
   department_id uuid,
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
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role_val user_role;
  user_dept_id uuid;
BEGIN
  -- Get the user's role and department
  SELECT role, department_id INTO user_role_val, user_dept_id
  FROM public.profiles
  WHERE id = p_user_id;

  -- Check if user has permission to view faculty data
  IF user_role_val NOT IN ('admin', 'principal', 'chairman', 'hod', 'faculty') THEN
    RAISE EXCEPTION 'Access denied: insufficient privileges';
  END IF;

  -- Return faculty data with attendance statistics
  RETURN QUERY
  SELECT 
    fp.id as faculty_id,
    fp.user_id,
    p.name,
    p.email,
    fp.employee_code,
    fp.designation,
    d.name as department_name,
    d.code as department_code,
    p.department_id,
    fp.joining_date,
    p.phone,
    p.gender,
    p.age,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, fp.joining_date))::integer as years_of_experience,
    fp.is_active,
    fp.emergency_contact_name,
    fp.emergency_contact_phone,
    fp.current_address,
    fp.blood_group,
    fp.marital_status,
    COALESCE(att_stats.total_days, 0) as total_attendance_days,
    COALESCE(att_stats.present_days, 0) as present_days,
    COALESCE(att_stats.absent_days, 0) as absent_days,
    CASE 
      WHEN COALESCE(att_stats.total_days, 0) > 0 
      THEN ROUND((COALESCE(att_stats.present_days, 0)::numeric / att_stats.total_days::numeric) * 100, 2)
      ELSE 0 
    END as attendance_percentage
  FROM public.faculty_profiles fp
  JOIN public.profiles p ON fp.user_id = p.id
  LEFT JOIN public.departments d ON p.department_id = d.id
  LEFT JOIN (
    SELECT 
      faculty_id,
      COUNT(*) as total_days,
      COUNT(CASE WHEN overall_status IN ('Present', 'Partial') THEN 1 END) as present_days,
      COUNT(CASE WHEN overall_status = 'Absent' THEN 1 END) as absent_days
    FROM public.faculty_attendance 
    WHERE attendance_date >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY faculty_id
  ) att_stats ON fp.id = att_stats.faculty_id
  WHERE 
    -- Permission-based filtering
    (
      user_role_val IN ('admin', 'principal', 'chairman') OR
      (user_role_val = 'hod' AND p.department_id = user_dept_id) OR
      (user_role_val = 'faculty' AND fp.user_id = p_user_id)
    )
    AND fp.is_active = true
  ORDER BY p.name;
END;
$function$
