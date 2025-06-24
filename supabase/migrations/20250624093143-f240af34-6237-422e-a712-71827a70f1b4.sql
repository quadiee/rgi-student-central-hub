
-- First, update any existing faculty users to 'admin' role
UPDATE public.profiles SET role = 'admin' WHERE role = 'faculty';
UPDATE public.user_invitations SET role = 'admin' WHERE role = 'faculty';

-- Remove any default values that might conflict
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE public.user_invitations ALTER COLUMN role DROP DEFAULT;

-- Create new enum without faculty
CREATE TYPE public.user_role_new AS ENUM ('student', 'hod', 'principal', 'admin');

-- Update the profiles table to use the new enum
ALTER TABLE public.profiles ALTER COLUMN role TYPE user_role_new USING role::text::user_role_new;

-- Update user_invitations table to use the new enum
ALTER TABLE public.user_invitations ALTER COLUMN role TYPE user_role_new USING role::text::user_role_new;

-- Drop the old enum with CASCADE to remove dependent objects
DROP TYPE public.user_role CASCADE;

-- Rename the new enum
ALTER TYPE public.user_role_new RENAME TO user_role;

-- Set new default values
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'student'::user_role;
ALTER TABLE public.user_invitations ALTER COLUMN role SET DEFAULT 'student'::user_role;

-- Recreate the get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = user_id;
$function$;

-- Recreate the get_invitation_details function
CREATE OR REPLACE FUNCTION public.get_invitation_details(invitation_email text)
RETURNS TABLE(id uuid, email text, role user_role, department department, roll_number text, employee_id text, invited_at timestamp with time zone, expires_at timestamp with time zone, used_at timestamp with time zone, is_active boolean, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF invitation_email IS NULL OR invitation_email = '' THEN
    RAISE EXCEPTION 'Invalid email parameter';
  END IF;

  RETURN QUERY
  SELECT 
    ui.id,
    ui.email,
    ui.role,
    ui.department,
    ui.roll_number,
    ui.employee_id,
    ui.invited_at,
    ui.expires_at,
    ui.used_at,
    ui.is_active,
    (ui.is_active = true AND ui.expires_at > now() AND ui.used_at IS NULL) as is_valid
  FROM public.user_invitations ui
  WHERE ui.email = invitation_email;
END;
$function$;

-- Add profile photo URL column to profiles table for student photos
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Add indexes for better performance on fee-related queries
CREATE INDEX IF NOT EXISTS idx_fee_records_student_status ON public.fee_records(student_id, status);
CREATE INDEX IF NOT EXISTS idx_fee_records_due_date ON public.fee_records(due_date);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_student ON public.payment_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_department_role ON public.profiles(department, role);
