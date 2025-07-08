
-- First, completely disable RLS temporarily to clear everything
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_records DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Chairman can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view accessible profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Drop ALL existing policies on fee_records table
DROP POLICY IF EXISTS "Students can view their own fee records" ON public.fee_records;
DROP POLICY IF EXISTS "Chairman can view all fee records" ON public.fee_records;
DROP POLICY IF EXISTS "Admins can view all fee records" ON public.fee_records;
DROP POLICY IF EXISTS "Admins and chairman can view all fee records" ON public.fee_records;
DROP POLICY IF EXISTS "HODs can view department fee records" ON public.fee_records;
DROP POLICY IF EXISTS "Admins and chairman can insert fee records" ON public.fee_records;
DROP POLICY IF EXISTS "Admins and chairman can update fee records" ON public.fee_records;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_records ENABLE ROW LEVEL SECURITY;

-- Create fresh, clean policies for profiles table
CREATE POLICY "profiles_select_own" 
ON public.profiles
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "profiles_select_chairman" 
ON public.profiles
FOR SELECT 
TO authenticated
USING (public.is_chairman(auth.uid()));

CREATE POLICY "profiles_select_admin" 
ON public.profiles
FOR SELECT 
TO authenticated
USING (public.is_admin_or_principal(auth.uid()));

CREATE POLICY "profiles_insert_own" 
ON public.profiles
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" 
ON public.profiles
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

-- Create fresh, clean policies for fee_records table
CREATE POLICY "fee_records_select_own" 
ON public.fee_records
FOR SELECT 
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "fee_records_select_chairman" 
ON public.fee_records
FOR SELECT 
TO authenticated
USING (public.is_chairman(auth.uid()));

CREATE POLICY "fee_records_select_admin" 
ON public.fee_records
FOR SELECT 
TO authenticated
USING (public.is_admin_or_principal(auth.uid()));

CREATE POLICY "fee_records_select_hod" 
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
