
-- Delete the existing invitation completely to avoid unique constraint violation
DELETE FROM public.user_invitations 
WHERE email = 'praveen@rgce.edu.in';

-- Create a new admin invitation for praveen@rgce.edu.in
INSERT INTO public.user_invitations (
  email,
  role,
  department,
  employee_id,
  invited_by,
  is_active,
  expires_at
) VALUES (
  'praveen@rgce.edu.in',
  'admin'::public.user_role,
  'ADMIN'::public.department,
  'ADMIN001',
  NULL,
  true,
  now() + interval '30 days'
);
