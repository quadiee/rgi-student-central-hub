-- Update existing fee_records policies to include chairman role
DROP POLICY IF EXISTS "Admins can view all fee records" ON public.fee_records;
CREATE POLICY "Admins and chairman can view all fee records"
ON public.fee_records
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY (ARRAY['admin'::user_role, 'principal'::user_role, 'chairman'::user_role])
  )
);

-- Update fee_records insert policy to include chairman
DROP POLICY IF EXISTS "Admins can insert fee records" ON public.fee_records;
CREATE POLICY "Admins and chairman can insert fee records"
ON public.fee_records
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY (ARRAY['admin'::user_role, 'principal'::user_role, 'chairman'::user_role])
  )
);

-- Update fee_records update policy to include chairman
DROP POLICY IF EXISTS "Admins can update fee records" ON public.fee_records;
CREATE POLICY "Admins and chairman can update fee records"
ON public.fee_records
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY (ARRAY['admin'::user_role, 'principal'::user_role, 'chairman'::user_role])
  )
);

-- Update payment_transactions policies to include chairman
DROP POLICY IF EXISTS "Admins can view all payment transactions" ON public.payment_transactions;
CREATE POLICY "Admins and chairman can view all payment transactions"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY (ARRAY['admin'::user_role, 'principal'::user_role, 'chairman'::user_role])
  )
);

DROP POLICY IF EXISTS "Admins can insert payment transactions" ON public.payment_transactions;
CREATE POLICY "Admins and chairman can insert payment transactions"
ON public.payment_transactions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY (ARRAY['admin'::user_role, 'principal'::user_role, 'chairman'::user_role])
  )
);

DROP POLICY IF EXISTS "Admins can update payment transactions" ON public.payment_transactions;
CREATE POLICY "Admins and chairman can update payment transactions"
ON public.payment_transactions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY (ARRAY['admin'::user_role, 'principal'::user_role, 'chairman'::user_role])
  )
);

-- Update the get_fee_records_with_filters function to include chairman role
CREATE OR REPLACE FUNCTION public.get_fee_records_with_filters(
  p_user_id uuid, 
  p_department text DEFAULT NULL::text, 
  p_year integer DEFAULT NULL::integer, 
  p_fee_type uuid DEFAULT NULL::uuid, 
  p_status text DEFAULT NULL::text, 
  p_limit integer DEFAULT 50, 
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid, 
  student_id uuid, 
  student_name text, 
  roll_number text, 
  department_name text, 
  year integer, 
  semester integer, 
  fee_type_name text, 
  academic_year text, 
  original_amount numeric, 
  final_amount numeric, 
  paid_amount numeric, 
  status fee_status, 
  due_date date, 
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role user_role;
  user_dept_id UUID;
BEGIN
  -- Get user role and department
  SELECT role, department_id INTO user_role, user_dept_id
  FROM public.profiles 
  WHERE profiles.id = p_user_id;

  -- Return filtered results based on user permissions
  RETURN QUERY
  SELECT 
    fr.id,
    fr.student_id,
    p.name as student_name,
    p.roll_number,
    d.name as department_name,
    p.year,
    fr.semester,
    ft.name as fee_type_name,
    fr.academic_year,
    fr.original_amount,
    fr.final_amount,
    fr.paid_amount,
    fr.status,
    fr.due_date,
    fr.created_at
  FROM public.fee_records fr
  JOIN public.profiles p ON fr.student_id = p.id
  LEFT JOIN public.departments d ON p.department_id = d.id
  LEFT JOIN public.fee_types ft ON fr.fee_type_id = ft.id
  WHERE 
    -- Permission-based filtering - now includes chairman
    (
      user_role IN ('admin', 'principal', 'chairman') OR
      (user_role = 'hod' AND p.department_id = user_dept_id) OR
      (user_role = 'student' AND fr.student_id = p_user_id)
    )
    -- Additional filters
    AND (p_department IS NULL OR d.name ILIKE '%' || p_department || '%')
    AND (p_year IS NULL OR p.year = p_year)
    AND (p_fee_type IS NULL OR fr.fee_type_id = p_fee_type)
    AND (p_status IS NULL OR fr.status::TEXT = p_status)
  ORDER BY fr.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$function$;