
-- Create function to get fee type analytics with filters
CREATE OR REPLACE FUNCTION public.get_fee_type_analytics_filtered(
  p_from_date date DEFAULT NULL::date,
  p_to_date date DEFAULT NULL::date,
  p_date_filter_type text DEFAULT 'created_at'::text,
  p_department_ids uuid[] DEFAULT NULL::uuid[],
  p_status_filter text[] DEFAULT NULL::text[],
  p_min_amount numeric DEFAULT NULL::numeric,
  p_max_amount numeric DEFAULT NULL::numeric
)
RETURNS TABLE (
  fee_type_id uuid,
  fee_type_name text,
  fee_type_description text,
  is_mandatory boolean,
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
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_fee_records AS (
    SELECT 
      fr.*,
      p.department_id as student_dept_id
    FROM fee_records fr
    JOIN profiles p ON fr.student_id = p.id
    WHERE fr.fee_type_id IS NOT NULL
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
    ft.id as fee_type_id,
    ft.name as fee_type_name,
    ft.description as fee_type_description,
    ft.is_mandatory,
    COUNT(DISTINCT ffr.student_id) as total_students,
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
      WHEN COUNT(DISTINCT ffr.student_id) > 0 
      THEN ROUND(COALESCE(SUM(ffr.final_amount), 0) / COUNT(DISTINCT ffr.student_id), 2)
      ELSE 0 
    END as avg_fee_per_student,
    NOW() as last_updated
  FROM fee_types ft
  LEFT JOIN filtered_fee_records ffr ON ft.id = ffr.fee_type_id
  WHERE ft.is_active = true
  GROUP BY ft.id, ft.name, ft.description, ft.is_mandatory
  HAVING COUNT(ffr.id) > 0 OR p_department_ids IS NULL
  ORDER BY total_fees DESC;
END;
$$;
