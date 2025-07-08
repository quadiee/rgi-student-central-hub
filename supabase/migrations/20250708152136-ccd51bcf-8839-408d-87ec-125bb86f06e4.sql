
-- Add missing RLS policies for fee_records table to allow admins to manage fees
CREATE POLICY "Admins can insert fee records" 
ON public.fee_records FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'principal', 'chairman')
  )
);

CREATE POLICY "Admins can update fee records" 
ON public.fee_records FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'principal', 'chairman')
  )
);

CREATE POLICY "Admins can delete fee records" 
ON public.fee_records FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'principal', 'chairman')
  )
);

-- Update the get_fee_records_with_filters function to include date and amount filtering
CREATE OR REPLACE FUNCTION public.get_fee_records_with_filters(
  p_user_id uuid, 
  p_department text DEFAULT NULL::text, 
  p_year integer DEFAULT NULL::integer, 
  p_fee_type uuid DEFAULT NULL::uuid, 
  p_status text DEFAULT NULL::text, 
  p_from_date date DEFAULT NULL::date,
  p_to_date date DEFAULT NULL::date,
  p_date_filter_type text DEFAULT 'created_at'::text,
  p_min_amount numeric DEFAULT NULL::numeric,
  p_max_amount numeric DEFAULT NULL::numeric,
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
    -- Permission-based filtering
    (
      user_role IN ('admin', 'principal', 'chairman') OR
      (user_role = 'hod' AND p.department_id = user_dept_id) OR
      (user_role = 'student' AND fr.student_id = p_user_id)
    )
    -- Existing filters
    AND (p_department IS NULL OR d.name ILIKE '%' || p_department || '%')
    AND (p_year IS NULL OR p.year = p_year)
    AND (p_fee_type IS NULL OR fr.fee_type_id = p_fee_type)
    AND (p_status IS NULL OR fr.status::TEXT = p_status)
    -- Date filtering based on selected type
    AND (
      CASE 
        WHEN p_date_filter_type = 'created_at' AND p_from_date IS NOT NULL THEN fr.created_at::date >= p_from_date
        WHEN p_date_filter_type = 'due_date' AND p_from_date IS NOT NULL THEN fr.due_date >= p_from_date
        WHEN p_date_filter_type = 'payment_date' AND p_from_date IS NOT NULL THEN fr.last_payment_date::date >= p_from_date
        ELSE TRUE
      END
    )
    AND (
      CASE 
        WHEN p_date_filter_type = 'created_at' AND p_to_date IS NOT NULL THEN fr.created_at::date <= p_to_date
        WHEN p_date_filter_type = 'due_date' AND p_to_date IS NOT NULL THEN fr.due_date <= p_to_date
        WHEN p_date_filter_type = 'payment_date' AND p_to_date IS NOT NULL THEN fr.last_payment_date::date <= p_to_date
        ELSE TRUE
      END
    )
    -- Amount filtering
    AND (p_min_amount IS NULL OR fr.final_amount >= p_min_amount)
    AND (p_max_amount IS NULL OR fr.final_amount <= p_max_amount)
  ORDER BY fr.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$function$;
