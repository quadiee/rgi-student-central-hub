
-- Create enhanced department analytics function with filtering capabilities
CREATE OR REPLACE FUNCTION public.get_department_analytics_filtered(
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL,
  p_date_filter_type TEXT DEFAULT 'created_at',
  p_department_ids UUID[] DEFAULT NULL,
  p_status_filter TEXT[] DEFAULT NULL,
  p_min_amount NUMERIC DEFAULT NULL,
  p_max_amount NUMERIC DEFAULT NULL
)
RETURNS TABLE(
  department_id uuid,
  department_name text,
  department_code text,
  total_students bigint,
  total_fee_records bigint,
  total_fees numeric,
  total_collected numeric,
  total_pending numeric,
  collection_percentage numeric,
  overdue_records bigint,
  avg_fee_per_student numeric,
  last_updated timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH filtered_fee_records AS (
    SELECT 
      fr.*,
      p.department_id as student_dept_id
    FROM fee_records fr
    JOIN profiles p ON fr.student_id = p.id
    WHERE 1=1
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
      -- Department filtering
      AND (p_department_ids IS NULL OR p.department_id = ANY(p_department_ids))
      -- Status filtering
      AND (p_status_filter IS NULL OR fr.status::text = ANY(p_status_filter))
      -- Amount filtering
      AND (p_min_amount IS NULL OR fr.final_amount >= p_min_amount)
      AND (p_max_amount IS NULL OR fr.final_amount <= p_max_amount)
  )
  SELECT 
    d.id as department_id,
    d.name as department_name,
    d.code as department_code,
    COUNT(DISTINCT p.id) as total_students,
    COUNT(ffr.id) as total_fee_records,
    COALESCE(SUM(ffr.final_amount), 0) as total_fees,
    COALESCE(SUM(ffr.paid_amount), 0) as total_collected,
    COALESCE(SUM(ffr.final_amount - COALESCE(ffr.paid_amount, 0)), 0) as total_pending,
    CASE 
      WHEN SUM(ffr.final_amount) > 0 
      THEN ROUND((SUM(COALESCE(ffr.paid_amount, 0)) / SUM(ffr.final_amount)) * 100, 2)
      ELSE 0 
    END as collection_percentage,
    COUNT(CASE WHEN ffr.status = 'Overdue' THEN 1 END) as overdue_records,
    CASE 
      WHEN COUNT(DISTINCT p.id) > 0 
      THEN ROUND(COALESCE(SUM(ffr.final_amount), 0) / COUNT(DISTINCT p.id), 2)
      ELSE 0 
    END as avg_fee_per_student,
    NOW() as last_updated
  FROM departments d
  LEFT JOIN profiles p ON d.id = p.department_id AND p.role = 'student' AND p.is_active = true
  LEFT JOIN filtered_fee_records ffr ON p.id = ffr.student_id
  WHERE d.is_active = true
  GROUP BY d.id, d.name, d.code
  HAVING COUNT(ffr.id) > 0 OR p_department_ids IS NULL
  ORDER BY d.name;
END;
$function$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_department_analytics_filtered TO authenticated;
