
-- Phase 1: Institutional Structure Enhancement
-- Create departments table with HOD assignments
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  hod_id uuid REFERENCES public.profiles(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Phase 2: Advanced RBAC Implementation
-- Create roles table
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Create permissions table
CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  resource_type text NOT NULL,
  action_type text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create role_permissions mapping table
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- Create user_roles mapping table for flexible role assignment
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE,
  department_id uuid REFERENCES public.departments(id),
  assigned_at timestamp with time zone DEFAULT now(),
  assigned_by uuid REFERENCES public.profiles(id),
  is_active boolean DEFAULT true,
  UNIQUE(user_id, role_id, department_id)
);

-- Insert default departments
INSERT INTO public.departments (name, code, description) VALUES
('Computer Science Engineering', 'CSE', 'Computer Science and Engineering Department'),
('Electronics and Communication Engineering', 'ECE', 'Electronics and Communication Engineering Department'),
('Electrical and Electronics Engineering', 'EEE', 'Electrical and Electronics Engineering Department'),
('Mechanical Engineering', 'MECH', 'Mechanical Engineering Department'),
('Civil Engineering', 'CIVIL', 'Civil Engineering Department'),
('Information Technology', 'IT', 'Information Technology Department'),
('Administration', 'ADMIN', 'Administrative Department');

-- Insert default roles
INSERT INTO public.roles (name, description) VALUES
('student', 'Student role with limited access to personal data'),
('hod', 'Head of Department with department-wide access'),
('principal', 'Principal with institution-wide access'),
('admin', 'System administrator with full access');

-- Insert default permissions
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

-- System permissions
('access_admin_panel', 'Access administrative functions', 'system', 'read'),
('manage_departments', 'Manage department structure', 'departments', 'write'),
('view_system_stats', 'View system statistics', 'stats', 'read');

-- Set up role permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE (
  (r.name = 'student' AND p.name IN ('view_own_fees', 'view_own_profile', 'process_payments')) OR
  (r.name = 'hod' AND p.name IN ('view_department_fees', 'view_department_students', 'generate_reports', 'approve_waivers', 'view_system_stats', 'process_payments')) OR
  (r.name = 'principal' AND p.name IN ('view_all_fees', 'view_all_students', 'modify_fee_structure', 'generate_reports', 'approve_waivers', 'view_system_stats', 'process_payments', 'manage_departments')) OR
  (r.name = 'admin' AND p.name NOT IN ('')) -- Admin gets all permissions
);

-- Add department_id to profiles table
ALTER TABLE public.profiles ADD COLUMN department_id uuid REFERENCES public.departments(id);

-- Update existing profiles to link with departments based on current department enum
UPDATE public.profiles SET department_id = (
  SELECT d.id FROM public.departments d 
  WHERE d.code = public.profiles.department::text
);

-- Create fee_types table for better categorization
CREATE TABLE public.fee_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_mandatory boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default fee types
INSERT INTO public.fee_types (name, description, is_mandatory) VALUES
('Tuition Fee', 'Academic tuition fees', true),
('Lab Fee', 'Laboratory usage fees', true),
('Library Fee', 'Library access and maintenance fees', true),
('Development Fee', 'Infrastructure development fees', true),
('Sports Fee', 'Sports and recreational facilities fees', false),
('Hostel Fee', 'Accommodation charges', false),
('Transport Fee', 'Transportation charges', false),
('Exam Fee', 'Examination and evaluation fees', true),
('Caution Deposit', 'Refundable security deposit', false);

-- Add department_id to fee_structures for department-specific fees
ALTER TABLE public.fee_structures ADD COLUMN department_id uuid REFERENCES public.departments(id);

-- Update existing fee structures to link with CSE department as default
UPDATE public.fee_structures SET department_id = (
  SELECT id FROM public.departments WHERE code = 'CSE' LIMIT 1
);

-- Phase 3: Performance Optimization Views
-- Student fee summary view
CREATE OR REPLACE VIEW public.student_fee_summary AS
SELECT 
    p.id as student_id,
    p.name,
    p.roll_number,
    p.department_id,
    d.name as department_name,
    COUNT(fr.id) as total_fee_records,
    COALESCE(SUM(fr.final_amount), 0) as total_fees,
    COALESCE(SUM(fr.paid_amount), 0) as total_paid,
    COALESCE(SUM(fr.final_amount) - SUM(fr.paid_amount), 0) as pending_amount,
    CASE 
        WHEN COUNT(fr.id) = 0 THEN 'No Fees'
        WHEN SUM(fr.final_amount) = SUM(fr.paid_amount) THEN 'Fully Paid'
        WHEN SUM(fr.paid_amount) > 0 THEN 'Partially Paid'
        ELSE 'Unpaid'
    END as payment_status
FROM public.profiles p
LEFT JOIN public.departments d ON p.department_id = d.id
LEFT JOIN public.fee_records fr ON p.id = fr.student_id
WHERE p.role = 'student' AND p.is_active = true
GROUP BY p.id, p.name, p.roll_number, p.department_id, d.name;

-- HOD department summary view
CREATE OR REPLACE VIEW public.hod_department_summary AS
SELECT 
    d.id as department_id,
    d.name as department_name,
    d.code as department_code,
    COUNT(DISTINCT p.id) as total_students,
    COUNT(DISTINCT fr.id) as total_fee_records,
    COALESCE(SUM(fr.final_amount), 0) as total_department_fees,
    COALESCE(SUM(fr.paid_amount), 0) as total_collected,
    COALESCE(SUM(fr.final_amount) - SUM(fr.paid_amount), 0) as total_pending,
    ROUND(
        CASE 
            WHEN SUM(fr.final_amount) > 0 
            THEN (SUM(fr.paid_amount) * 100.0 / SUM(fr.final_amount))
            ELSE 0 
        END, 2
    ) as collection_percentage
FROM public.departments d
LEFT JOIN public.profiles p ON d.id = p.department_id AND p.role = 'student' AND p.is_active = true
LEFT JOIN public.fee_records fr ON p.id = fr.student_id
WHERE d.is_active = true
GROUP BY d.id, d.name, d.code;

-- Principal institution summary view
CREATE OR REPLACE VIEW public.principal_institution_summary AS
SELECT 
    COUNT(DISTINCT d.id) as total_departments,
    COUNT(DISTINCT p.id) as total_students,
    COUNT(DISTINCT fr.id) as total_fee_records,
    COALESCE(SUM(fr.final_amount), 0) as total_institution_fees,
    COALESCE(SUM(fr.paid_amount), 0) as total_collected,
    COALESCE(SUM(fr.final_amount) - SUM(fr.paid_amount), 0) as total_pending,
    ROUND(
        CASE 
            WHEN SUM(fr.final_amount) > 0 
            THEN (SUM(fr.paid_amount) * 100.0 / SUM(fr.final_amount))
            ELSE 0 
        END, 2
    ) as overall_collection_percentage,
    COUNT(DISTINCT CASE WHEN fr.status = 'Overdue' THEN fr.id END) as overdue_records
FROM public.departments d
LEFT JOIN public.profiles p ON d.id = p.department_id AND p.role = 'student' AND p.is_active = true
LEFT JOIN public.fee_records fr ON p.id = fr.student_id
WHERE d.is_active = true;

-- Create functions for permission checking
CREATE OR REPLACE FUNCTION public.user_has_permission(
    user_id uuid, 
    permission_name text, 
    department_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = user_has_permission.user_id
        AND p.name = user_has_permission.permission_name
        AND ur.is_active = true
        AND (user_has_permission.department_id IS NULL OR ur.department_id = user_has_permission.department_id OR ur.department_id IS NULL)
    );
$$;

-- Create function to get user department
CREATE OR REPLACE FUNCTION public.get_user_department_id(user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT department_id FROM public.profiles WHERE id = user_id;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_department_role ON public.profiles(department_id, role) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_fee_records_student_status ON public.fee_records(student_id, status);
CREATE INDEX IF NOT EXISTS idx_fee_records_due_date ON public.fee_records(due_date) WHERE status != 'Paid';
CREATE INDEX IF NOT EXISTS idx_payment_transactions_fee_record ON public.payment_transactions(fee_record_id, status);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_active ON public.user_roles(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_departments_code ON public.departments(code) WHERE is_active = true;

-- Enable RLS on new tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
-- Departments - readable by all authenticated users
CREATE POLICY "Departments are readable by authenticated users" 
    ON public.departments FOR SELECT 
    TO authenticated 
    USING (true);

-- Only admins and principals can modify departments
CREATE POLICY "Admins and principals can modify departments" 
    ON public.departments FOR ALL 
    TO authenticated 
    USING (public.user_has_permission(auth.uid(), 'manage_departments'));

-- Roles and permissions - readable by authenticated users
CREATE POLICY "Roles are readable by authenticated users" 
    ON public.roles FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Permissions are readable by authenticated users" 
    ON public.permissions FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Role permissions are readable by authenticated users" 
    ON public.role_permissions FOR SELECT 
    TO authenticated 
    USING (true);

-- User roles - users can view their own roles, admins can view all
CREATE POLICY "Users can view their own roles" 
    ON public.user_roles FOR SELECT 
    TO authenticated 
    USING (user_id = auth.uid() OR public.user_has_permission(auth.uid(), 'manage_users'));

-- Fee types - readable by all authenticated users
CREATE POLICY "Fee types are readable by authenticated users" 
    ON public.fee_types FOR SELECT 
    TO authenticated 
    USING (true);
