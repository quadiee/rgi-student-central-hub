
-- First, let's check if department_id column already exists and handle it properly
DO $$
BEGIN
    -- Add department_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_invitations' 
        AND column_name = 'department_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_invitations 
        ADD COLUMN department_id UUID;
        
        -- Add foreign key constraint
        ALTER TABLE public.user_invitations 
        ADD CONSTRAINT fk_user_invitations_department 
        FOREIGN KEY (department_id) REFERENCES public.departments(id);
    END IF;
END $$;

-- Migrate existing data from department enum to department_id UUID
-- Map the enum values to actual department UUIDs from the departments table
UPDATE public.user_invitations 
SET department_id = (
    CASE 
        WHEN department::text = 'CSE' THEN (SELECT id FROM public.departments WHERE code = 'CSE' LIMIT 1)
        WHEN department::text = 'ECE' THEN (SELECT id FROM public.departments WHERE code = 'ECE' LIMIT 1)
        WHEN department::text = 'EEE' THEN (SELECT id FROM public.departments WHERE code = 'EEE' LIMIT 1)
        WHEN department::text = 'MECH' THEN (SELECT id FROM public.departments WHERE code = 'MECH' LIMIT 1)
        WHEN department::text = 'CIVIL' THEN (SELECT id FROM public.departments WHERE code = 'CIVIL' LIMIT 1)
        WHEN department::text = 'ADMIN' THEN (SELECT id FROM public.departments WHERE code = 'ADMIN' LIMIT 1)
        ELSE (SELECT id FROM public.departments WHERE code = 'CSE' LIMIT 1) -- Default to CSE
    END
)
WHERE department_id IS NULL AND department IS NOT NULL;

-- Make department_id NOT NULL after migration
ALTER TABLE public.user_invitations 
ALTER COLUMN department_id SET NOT NULL;

-- Drop the old department enum column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_invitations' 
        AND column_name = 'department'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_invitations 
        DROP COLUMN department;
    END IF;
END $$;

-- Update the validate_invitation_token function to return department info
CREATE OR REPLACE FUNCTION public.validate_invitation_token(p_token text)
RETURNS TABLE(
  id uuid, 
  email text, 
  role user_role, 
  department_id uuid,
  department_name text,
  department_code text,
  roll_number text, 
  employee_id text, 
  is_valid boolean, 
  error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Get invitation by token with department info
  SELECT 
    ui.*,
    d.name as dept_name,
    d.code as dept_code
  INTO invitation_record
  FROM public.user_invitations ui
  LEFT JOIN public.departments d ON ui.department_id = d.id
  WHERE ui.token = p_token;

  -- Check if invitation exists
  IF invitation_record.id IS NULL THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::TEXT, NULL::public.user_role, NULL::UUID,
      NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, 
      FALSE, 'Invalid invitation token'::TEXT;
    RETURN;
  END IF;

  -- Check if invitation is expired
  IF invitation_record.expires_at < now() THEN
    RETURN QUERY SELECT 
      invitation_record.id, invitation_record.email, invitation_record.role, 
      invitation_record.department_id, invitation_record.dept_name, invitation_record.dept_code,
      invitation_record.roll_number, invitation_record.employee_id, 
      FALSE, 'Invitation has expired'::TEXT;
    RETURN;
  END IF;

  -- Check if invitation is already used
  IF invitation_record.used_at IS NOT NULL THEN
    RETURN QUERY SELECT 
      invitation_record.id, invitation_record.email, invitation_record.role, 
      invitation_record.department_id, invitation_record.dept_name, invitation_record.dept_code,
      invitation_record.roll_number, invitation_record.employee_id, 
      FALSE, 'Invitation has already been used'::TEXT;
    RETURN;
  END IF;

  -- Check if invitation is active
  IF NOT invitation_record.is_active THEN
    RETURN QUERY SELECT 
      invitation_record.id, invitation_record.email, invitation_record.role, 
      invitation_record.department_id, invitation_record.dept_name, invitation_record.dept_code,
      invitation_record.roll_number, invitation_record.employee_id, 
      FALSE, 'Invitation is no longer active'::TEXT;
    RETURN;
  END IF;

  -- Invitation is valid
  RETURN QUERY SELECT 
    invitation_record.id, invitation_record.email, invitation_record.role, 
    invitation_record.department_id, invitation_record.dept_name, invitation_record.dept_code,
    invitation_record.roll_number, invitation_record.employee_id, 
    TRUE, NULL::TEXT;
  RETURN;
END;
$$;

-- Create a function to get faculty with details that works with the new schema
CREATE OR REPLACE FUNCTION public.get_faculty_with_details(p_user_id uuid)
RETURNS TABLE(
    faculty_id uuid,
    user_id uuid,
    name text,
    email text,
    employee_code text,
    designation text,
    department_id uuid,
    department_name text,
    department_code text,
    joining_date date,
    phone text,
    is_active boolean,
    years_of_experience integer,
    attendance_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fp.id as faculty_id,
        fp.user_id,
        COALESCE(p.name, 'Unknown') as name,
        COALESCE(p.email, 'No Email') as email,
        COALESCE(fp.employee_code, 'N/A') as employee_code,
        COALESCE(fp.designation, 'Faculty') as designation,
        p.department_id,
        COALESCE(d.name, 'Unknown Department') as department_name,
        COALESCE(d.code, 'UNK') as department_code,
        fp.joining_date,
        p.phone,
        COALESCE(fp.is_active, false) as is_active,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, fp.joining_date))::integer as years_of_experience,
        0::numeric as attendance_percentage -- Placeholder for now
    FROM faculty_profiles fp
    LEFT JOIN profiles p ON fp.user_id = p.id
    LEFT JOIN departments d ON p.department_id = d.id
    WHERE fp.is_active = true
    ORDER BY p.name;
END;
$$;
