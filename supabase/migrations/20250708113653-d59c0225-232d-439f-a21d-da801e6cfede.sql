
-- Drop ALL problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Chairman can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Chairman can view all fee records" ON public.fee_records;
DROP POLICY IF EXISTS "Users can view accessible profiles" ON public.profiles;

-- Create security definer functions to check roles without triggering RLS
CREATE OR REPLACE FUNCTION public.is_chairman(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'chairman'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_principal(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('admin', 'principal')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_hod_for_department(user_id uuid, dept_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'hod' AND department_id = dept_id
  );
$$;

-- Recreate clean profiles policies using only security definer functions
CREATE POLICY "Users can view their own profile" 
ON public.profiles
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Chairman can view all profiles" 
ON public.profiles
FOR SELECT 
TO authenticated
USING (public.is_chairman(auth.uid()));

CREATE POLICY "Admins can view all profiles" 
ON public.profiles
FOR SELECT 
TO authenticated
USING (public.is_admin_or_principal(auth.uid()));

-- Recreate clean fee_records policies
CREATE POLICY "Students can view their own fee records" 
ON public.fee_records
FOR SELECT 
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Chairman can view all fee records" 
ON public.fee_records
FOR SELECT 
TO authenticated
USING (public.is_chairman(auth.uid()));

CREATE POLICY "Admins can view all fee records" 
ON public.fee_records
FOR SELECT 
TO authenticated
USING (public.is_admin_or_principal(auth.uid()));

CREATE POLICY "HODs can view department fee records" 
ON public.fee_records
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles student
    WHERE student.id = fee_records.student_id 
    AND public.is_hod_for_department(auth.uid(), student.department_id)
  )
);
