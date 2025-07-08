
-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Chairman can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Chairman can view all fee records" ON public.fee_records;

-- Create a security definer function to check if user is chairman
-- This bypasses RLS and prevents recursion
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

-- Recreate chairman policies using the security definer function
CREATE POLICY "Chairman can view all profiles" 
ON public.profiles
FOR SELECT 
TO authenticated
USING (
  public.is_chairman(auth.uid()) OR
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'principal')
  )
);

CREATE POLICY "Chairman can view all fee records" 
ON public.fee_records
FOR SELECT 
TO authenticated
USING (
  public.is_chairman(auth.uid()) OR
  student_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'principal')
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.profiles student ON fee_records.student_id = student.id
    WHERE p.id = auth.uid() 
    AND p.role = 'hod'
    AND p.department_id = student.department_id
  )
);
