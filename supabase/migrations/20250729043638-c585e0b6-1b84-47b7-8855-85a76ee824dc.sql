
-- Add gender field to profiles table if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('Male', 'Female', 'Other'));

-- Add date_of_birth field to faculty_profiles for age calculation
ALTER TABLE faculty_profiles ADD COLUMN IF NOT EXISTS date_of_birth date;

-- Create a view for faculty analytics with computed fields
CREATE OR REPLACE VIEW faculty_analytics_view AS
SELECT 
  p.id,
  p.name,
  p.email,
  p.role,
  p.gender,
  p.phone,
  p.is_active,
  p.created_at,
  p.department_id,
  d.name as department_name,
  d.code as department_code,
  fp.id as faculty_profile_id,
  fp.employee_code,
  fp.designation,
  fp.joining_date,
  fp.date_of_birth,
  -- Calculate age if date_of_birth exists
  CASE 
    WHEN fp.date_of_birth IS NOT NULL 
    THEN EXTRACT(YEAR FROM AGE(fp.date_of_birth))::integer 
    ELSE NULL 
  END as age,
  -- Calculate years of experience
  CASE 
    WHEN fp.joining_date IS NOT NULL 
    THEN EXTRACT(YEAR FROM AGE(fp.joining_date))::integer 
    ELSE NULL 
  END as years_of_experience,
  -- Emergency contact info
  fp.emergency_contact_name,
  fp.emergency_contact_phone,
  fp.current_address,
  fp.blood_group,
  fp.marital_status,
  fp.spouse_name
FROM profiles p
LEFT JOIN faculty_profiles fp ON p.id = fp.user_id
LEFT JOIN departments d ON p.department_id = d.id
WHERE p.role = 'faculty';

-- Create function to get faculty with details including attendance summary
CREATE OR REPLACE FUNCTION get_faculty_with_details(p_user_id uuid)
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
  total_attendance_days bigint,
  present_days bigint,
  absent_days bigint,
  attendance_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role_val user_role;
  user_dept_id uuid;
BEGIN
  -- Get user role and department
  SELECT role, department_id INTO user_role_val, user_dept_id
  FROM public.profiles 
  WHERE id = p_user_id;

  -- Return data based on permissions
  RETURN QUERY
  SELECT 
    fav.faculty_profile_id as faculty_id,
    fav.id as user_id,
    fav.name,
    fav.email,
    COALESCE(fav.employee_code, 'N/A') as employee_code,
    COALESCE(fav.designation, 'N/A') as designation,
    COALESCE(fav.department_name, 'Unknown') as department_name,
    COALESCE(fav.department_code, 'N/A') as department_code,
    fav.joining_date,
    fav.phone,
    fav.gender,
    fav.age,
    fav.years_of_experience,
    fav.is_active,
    fav.emergency_contact_name,
    fav.emergency_contact_phone,
    fav.current_address,
    fav.blood_group,
    fav.marital_status,
    COALESCE(att_summary.total_days, 0) as total_attendance_days,
    COALESCE(att_summary.present_days, 0) as present_days,
    COALESCE(att_summary.absent_days, 0) as absent_days,
    COALESCE(att_summary.attendance_percentage, 0) as attendance_percentage
  FROM faculty_analytics_view fav
  LEFT JOIN (
    SELECT 
      fp_inner.id as faculty_profile_id,
      COUNT(fa.id) as total_days,
      COUNT(CASE WHEN fa.overall_status = 'Present' THEN 1 END) as present_days,
      COUNT(CASE WHEN fa.overall_status = 'Absent' THEN 1 END) as absent_days,
      CASE 
        WHEN COUNT(fa.id) > 0 
        THEN ROUND((COUNT(CASE WHEN fa.overall_status = 'Present' THEN 1 END)::numeric / COUNT(fa.id)::numeric) * 100, 2)
        ELSE 0 
      END as attendance_percentage
    FROM faculty_profiles fp_inner
    LEFT JOIN faculty_attendance fa ON fp_inner.id = fa.faculty_id
    GROUP BY fp_inner.id
  ) att_summary ON fav.faculty_profile_id = att_summary.faculty_profile_id
  WHERE 
    -- Permission filtering
    (
      user_role_val IN ('admin', 'principal', 'chairman') OR
      (user_role_val = 'hod' AND fav.department_id = user_dept_id)
    )
  ORDER BY fav.name;
END;
$$;

-- Create function to get individual faculty attendance history
CREATE OR REPLACE FUNCTION get_faculty_attendance_history(p_faculty_id uuid, p_limit integer DEFAULT 50)
RETURNS TABLE(
  attendance_date date,
  total_periods integer,
  present_periods integer,
  absent_periods integer,
  late_periods integer,
  overall_status text,
  first_punch_time time,
  last_punch_time time,
  total_working_hours interval,
  remarks text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fa.attendance_date,
    fa.total_periods,
    fa.present_periods,
    fa.absent_periods,
    fa.late_periods,
    fa.overall_status,
    fa.first_punch_time,
    fa.last_punch_time,
    fa.total_working_hours,
    fa.remarks
  FROM faculty_attendance fa
  WHERE fa.faculty_id = p_faculty_id
  ORDER BY fa.attendance_date DESC
  LIMIT p_limit;
END;
$$;
