
-- Phase 1: Database Schema Update for user_invitations table

-- Step 1: Add department_id column as nullable first
ALTER TABLE public.user_invitations 
ADD COLUMN department_id uuid REFERENCES public.departments(id);

-- Step 2: Update existing records to populate department_id based on department enum
UPDATE public.user_invitations 
SET department_id = d.id
FROM public.departments d
WHERE d.code = user_invitations.department::text;

-- Step 3: Make department_id NOT NULL after data migration
ALTER TABLE public.user_invitations 
ALTER COLUMN department_id SET NOT NULL;

-- Step 4: Drop the old department enum column
ALTER TABLE public.user_invitations 
DROP COLUMN department;

-- Step 5: Update the handle_new_user function to work with department_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  invitation_record RECORD;
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
      invitation_record.department_id, -- Use department_id from invitation
      false, -- Keep inactive until profile is completed
      false  -- Mark as incomplete
    );
    
  ELSE
    -- For direct signups (non-invitation), create complete profile as before
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
      COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'student'::public.user_role),
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

-- Step 6: Update other functions that reference department enum
CREATE OR REPLACE FUNCTION public.get_invitation_details(invitation_email text)
RETURNS TABLE(
  id uuid, 
  email text, 
  role user_role, 
  department_id uuid,
  department_name text,
  department_code text,
  roll_number text, 
  employee_id text, 
  invited_at timestamp with time zone, 
  expires_at timestamp with time zone, 
  used_at timestamp with time zone, 
  is_active boolean, 
  is_valid boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF invitation_email IS NULL OR invitation_email = '' THEN
    RAISE EXCEPTION 'Invalid email parameter';
  END IF;

  RETURN QUERY
  SELECT 
    ui.id,
    ui.email,
    ui.role,
    ui.department_id,
    d.name as department_name,
    d.code as department_code,
    ui.roll_number,
    ui.employee_id,
    ui.invited_at,
    ui.expires_at,
    ui.used_at,
    ui.is_active,
    (ui.is_active = true AND ui.expires_at > now() AND ui.used_at IS NULL) as is_valid
  FROM public.user_invitations ui
  LEFT JOIN public.departments d ON ui.department_id = d.id
  WHERE ui.email = invitation_email;
END;
$$;
