
-- First, add the new department_id column to user_invitations table
ALTER TABLE public.user_invitations 
ADD COLUMN department_id UUID REFERENCES public.departments(id);

-- Migrate existing data from department enum to department_id foreign key
UPDATE public.user_invitations 
SET department_id = d.id 
FROM public.departments d 
WHERE d.code = user_invitations.department::text;

-- Make department_id NOT NULL after migration
ALTER TABLE public.user_invitations 
ALTER COLUMN department_id SET NOT NULL;

-- Drop the old department enum column
ALTER TABLE public.user_invitations 
DROP COLUMN department;

-- Update the send-invitation-email edge function to handle the new schema
-- (This will be done in code changes)
