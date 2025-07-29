
-- Phase 1: Fix Database Schema and Type Issues
-- Update user_invitations table to use department_id instead of enum

-- First, add the department_id column
ALTER TABLE public.user_invitations 
ADD COLUMN department_id uuid REFERENCES public.departments(id);

-- Update existing records to map department enum to department_id
UPDATE public.user_invitations 
SET department_id = (
  SELECT id FROM public.departments 
  WHERE code = user_invitations.department::text
);

-- Drop the old department enum column
ALTER TABLE public.user_invitations 
DROP COLUMN department;

-- Make department_id required
ALTER TABLE public.user_invitations 
ALTER COLUMN department_id SET NOT NULL;

-- Update the handle_new_user function to work with department_id
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
      invitation_record.department_id,
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
