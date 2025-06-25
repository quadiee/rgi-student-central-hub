
-- Create the missing roles table if not exists
INSERT INTO public.roles (name, description) VALUES
('student', 'Student role with limited access to personal data'),
('hod', 'Head of Department with department-wide access'),
('principal', 'Principal with institution-wide access'),
('admin', 'System administrator with full access')
ON CONFLICT (name) DO NOTHING;

-- Create missing permissions if not exists
INSERT INTO public.permissions (name, description, resource_type, action_type) VALUES
-- Fee management permissions
('view_own_fees', 'View own fee records', 'fees', 'read'),
('view_department_fees', 'View all fee records in department', 'fees', 'read'),
('view_all_fees', 'View all fee records', 'fees', 'read'),
('process_payments', 'Process fee payments', 'payments', 'create'),
('modify_fee_structure', 'Create/modify fee structures', 'fee_structures', 'write'),
('generate_reports', 'Generate fee reports', 'reports', 'read'),
('approve_waivers', 'Approve fee waivers', 'waivers', 'write'),

-- User management permissions
('view_own_profile', 'View own profile', 'profiles', 'read'),
('view_department_students', 'View students in department', 'profiles', 'read'),
('view_all_students', 'View all students', 'profiles', 'read'),
('manage_users', 'Create/modify user accounts', 'profiles', 'write'),
('manage_invitations', 'Send user invitations', 'invitations', 'write'),
('impersonate_users', 'Switch to other user views', 'system', 'admin'),

-- System permissions
('access_admin_panel', 'Access administrative functions', 'system', 'read'),
('manage_departments', 'Manage department structure', 'departments', 'write'),
('view_system_stats', 'View system statistics', 'stats', 'read'),
('manage_roles', 'Manage user roles and permissions', 'roles', 'write')
ON CONFLICT (name) DO NOTHING;

-- Set up role permissions - Clear existing and recreate
DELETE FROM public.role_permissions;

-- Admin gets all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'admin';

-- Principal permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'principal' AND p.name IN (
  'view_all_fees', 'view_all_students', 'modify_fee_structure', 'generate_reports', 
  'approve_waivers', 'view_system_stats', 'process_payments', 'manage_departments'
);

-- HOD permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'hod' AND p.name IN (
  'view_department_fees', 'view_department_students', 'generate_reports', 
  'approve_waivers', 'view_system_stats', 'process_payments'
);

-- Student permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'student' AND p.name IN (
  'view_own_fees', 'view_own_profile', 'process_payments'
);

-- Create user roles for existing users based on their profile role
INSERT INTO public.user_roles (user_id, role_id, department_id, is_active)
SELECT 
  p.id as user_id,
  r.id as role_id,
  p.department_id,
  true
FROM public.profiles p
JOIN public.roles r ON r.name = p.role::text
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = p.id AND ur.role_id = r.id
);

-- Create enhanced admin session table for role switching
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES public.profiles(id) NOT NULL,
  impersonated_user_id uuid REFERENCES public.profiles(id),
  impersonated_role text,
  session_start timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Admin session policies
CREATE POLICY "Admins can manage their own sessions" 
  ON public.admin_sessions FOR ALL 
  TO authenticated 
  USING (admin_user_id = auth.uid() OR public.user_has_permission(auth.uid(), 'manage_users'));

-- Update RLS policies for better admin access
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON public.profiles;

-- Create comprehensive profile policies
CREATE POLICY "Users can view accessible profiles" 
  ON public.profiles FOR SELECT 
  TO authenticated 
  USING (
    id = auth.uid() OR 
    public.user_has_permission(auth.uid(), 'view_all_students') OR
    (public.user_has_permission(auth.uid(), 'view_department_students') AND 
     department_id = public.get_user_department_id(auth.uid()))
  );

CREATE POLICY "Admins can modify all profiles" 
  ON public.profiles FOR UPDATE 
  TO authenticated 
  USING (public.user_has_permission(auth.uid(), 'manage_users'));

CREATE POLICY "Users can update own profiles" 
  ON public.profiles FOR UPDATE 
  TO authenticated 
  USING (id = auth.uid());

-- Enhanced user invitation policies
CREATE POLICY "Authorized users can send invitations" 
  ON public.user_invitations FOR INSERT 
  TO authenticated 
  WITH CHECK (public.user_has_permission(auth.uid(), 'manage_invitations'));

CREATE POLICY "Authorized users can view invitations" 
  ON public.user_invitations FOR SELECT 
  TO authenticated 
  USING (public.user_has_permission(auth.uid(), 'manage_invitations'));
