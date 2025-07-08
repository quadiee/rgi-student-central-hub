
-- Step 1: Completely disable RLS on all related tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_records DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies by their exact names
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Chairman can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view accessible profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_chairman" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

DROP POLICY IF EXISTS "Students can view their own fee records" ON public.fee_records;
DROP POLICY IF EXISTS "Chairman can view all fee records" ON public.fee_records;
DROP POLICY IF EXISTS "Admins can view all fee records" ON public.fee_records;
DROP POLICY IF EXISTS "Admins and chairman can view all fee records" ON public.fee_records;
DROP POLICY IF EXISTS "HODs can view department fee records" ON public.fee_records;
DROP POLICY IF EXISTS "Admins and chairman can insert fee records" ON public.fee_records;
DROP POLICY IF EXISTS "Admins and chairman can update fee records" ON public.fee_records;
DROP POLICY IF EXISTS "fee_records_select_own" ON public.fee_records;
DROP POLICY IF EXISTS "fee_records_select_chairman" ON public.fee_records;
DROP POLICY IF EXISTS "fee_records_select_admin" ON public.fee_records;
DROP POLICY IF EXISTS "fee_records_select_hod" ON public.fee_records;

-- Step 3: Drop all existing security definer functions
DROP FUNCTION IF EXISTS public.is_chairman(uuid);
DROP FUNCTION IF EXISTS public.is_admin_or_principal(uuid);
DROP FUNCTION IF EXISTS public.is_hod_for_department(uuid, uuid);

-- Step 4: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_records ENABLE ROW LEVEL SECURITY;

-- Step 5: Create new security definer functions that bypass RLS
CREATE OR REPLACE FUNCTION public.check_user_role(user_id uuid, target_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role::text = target_role
  );
$$;

CREATE OR REPLACE FUNCTION public.check_user_roles(user_id uuid, target_roles text[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role::text = ANY(target_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.check_hod_department(user_id uuid, dept_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role::text = 'hod' AND department_id = dept_id
  );
$$;

-- Step 6: Create simple, non-recursive policies for profiles
CREATE POLICY "allow_own_profile" 
ON public.profiles
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "allow_chairman_all_profiles" 
ON public.profiles
FOR SELECT 
TO authenticated
USING (public.check_user_role(auth.uid(), 'chairman'));

CREATE POLICY "allow_admin_all_profiles" 
ON public.profiles
FOR SELECT 
TO authenticated
USING (public.check_user_roles(auth.uid(), ARRAY['admin', 'principal']));

CREATE POLICY "allow_profile_insert" 
ON public.profiles
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_profile_update" 
ON public.profiles
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

-- Step 7: Create simple, non-recursive policies for fee_records
CREATE POLICY "allow_own_fee_records" 
ON public.fee_records
FOR SELECT 
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "allow_chairman_all_fees" 
ON public.fee_records
FOR SELECT 
TO authenticated
USING (public.check_user_role(auth.uid(), 'chairman'));

CREATE POLICY "allow_admin_all_fees" 
ON public.fee_records
FOR SELECT 
TO authenticated
USING (public.check_user_roles(auth.uid(), ARRAY['admin', 'principal']));

CREATE POLICY "allow_hod_dept_fees" 
ON public.fee_records
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles student
    WHERE student.id = fee_records.student_id 
    AND public.check_hod_department(auth.uid(), student.department_id)
  )
);
