
-- Create fee_record_types junction table to link fee records with fee types
CREATE TABLE public.fee_record_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fee_record_id UUID REFERENCES public.fee_records(id) ON DELETE CASCADE NOT NULL,
  fee_type_id UUID REFERENCES public.fee_types(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(fee_record_id, fee_type_id)
);

-- Enable RLS on fee_record_types
ALTER TABLE public.fee_record_types ENABLE ROW LEVEL SECURITY;

-- Create policy for fee_record_types
CREATE POLICY "Users can view fee record types based on fee record access" 
  ON public.fee_record_types 
  FOR SELECT 
  USING (
    fee_record_id IN (
      SELECT id FROM public.fee_records 
      WHERE student_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'principal', 'hod')
      )
    )
  );

-- Create policy for admins to manage fee record types
CREATE POLICY "Admins can manage fee record types" 
  ON public.fee_record_types 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'principal')
    )
  );

-- Add fee_type_id to fee_records for primary fee type
ALTER TABLE public.fee_records 
ADD COLUMN fee_type_id UUID REFERENCES public.fee_types(id);

-- Create function to get fee records with filters
CREATE OR REPLACE FUNCTION public.get_fee_records_with_filters(
  p_user_id UUID,
  p_department TEXT DEFAULT NULL,
  p_year INTEGER DEFAULT NULL,
  p_fee_type UUID DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  student_id UUID,
  student_name TEXT,
  roll_number TEXT,
  department_name TEXT,
  year INTEGER,
  semester INTEGER,
  fee_type_name TEXT,
  academic_year TEXT,
  original_amount NUMERIC,
  final_amount NUMERIC,
  paid_amount NUMERIC,
  status fee_status,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
      user_role IN ('admin', 'principal') OR
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
$$;

-- Create function for bulk fee record updates
CREATE OR REPLACE FUNCTION public.bulk_update_fee_records(
  p_user_id UUID,
  p_record_ids UUID[],
  p_status fee_status DEFAULT NULL,
  p_due_date DATE DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role user_role;
  updated_count INTEGER := 0;
  result JSON;
BEGIN
  -- Check user permissions
  SELECT role INTO user_role
  FROM public.profiles 
  WHERE id = p_user_id;

  IF user_role NOT IN ('admin', 'principal') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient permissions'
    );
  END IF;

  -- Update records
  UPDATE public.fee_records 
  SET 
    status = COALESCE(p_status, status),
    due_date = COALESCE(p_due_date, due_date),
    updated_at = now()
  WHERE id = ANY(p_record_ids);

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  result := json_build_object(
    'success', true,
    'updated_count', updated_count
  );

  RETURN result;
END;
$$;

-- Update process_fee_csv_upload to handle fee types
CREATE OR REPLACE FUNCTION public.process_fee_csv_upload_with_types(
  p_academic_year TEXT,
  p_semester INTEGER,
  p_department department,
  p_csv_data JSONB,
  p_uploaded_by UUID
)
RETURNS JSON
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  result JSON;
  student_data JSONB;
  processed_count INTEGER := 0;
  fee_type_id UUID;
  student_id UUID;
  fee_record_id UUID;
BEGIN
  -- Process each student in CSV data
  FOR student_data IN SELECT * FROM jsonb_array_elements(p_csv_data)
  LOOP
    -- Get student ID
    SELECT id INTO student_id
    FROM public.profiles 
    WHERE roll_number = student_data->>'roll_number';

    IF student_id IS NULL THEN
      CONTINUE;
    END IF;

    -- Get fee type ID (default to first available if not specified)
    IF student_data ? 'fee_type' THEN
      SELECT id INTO fee_type_id
      FROM public.fee_types 
      WHERE name ILIKE student_data->>'fee_type';
    ELSE
      SELECT id INTO fee_type_id
      FROM public.fee_types 
      WHERE name = 'Semester Fee'
      LIMIT 1;
    END IF;

    -- Insert or update fee record
    INSERT INTO public.fee_records (
      student_id,
      academic_year,
      semester,
      fee_type_id,
      original_amount,
      final_amount,
      due_date,
      status
    ) 
    VALUES (
      student_id,
      p_academic_year,
      p_semester,
      fee_type_id,
      (student_data->>'fee_amount')::NUMERIC,
      (student_data->>'fee_amount')::NUMERIC,
      (student_data->>'due_date')::DATE,
      'Pending'
    )
    ON CONFLICT (student_id, academic_year, semester) 
    DO UPDATE SET 
      fee_type_id = EXCLUDED.fee_type_id,
      original_amount = EXCLUDED.original_amount,
      final_amount = EXCLUDED.final_amount,
      due_date = EXCLUDED.due_date
    RETURNING id INTO fee_record_id;

    processed_count := processed_count + 1;
  END LOOP;

  result := json_build_object(
    'success', true,
    'message', 'CSV processed successfully',
    'processed_count', processed_count
  );

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'error', SQLERRM
    );
    RETURN result;
END;
$$;

-- Insert default fee types if they don't exist
INSERT INTO public.fee_types (name, description, is_mandatory, is_active)
VALUES 
  ('Semester Fee', 'Regular semester tuition fee', true, true),
  ('Exam Fee', 'Examination and assessment fee', true, true),
  ('Lab Fee', 'Laboratory usage and equipment fee', false, true),
  ('Library Fee', 'Library access and resources fee', false, true),
  ('Sports Fee', 'Sports facilities and activities fee', false, true),
  ('Development Fee', 'Infrastructure development fee', false, true)
ON CONFLICT (name) DO NOTHING;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_fee_records_student_year ON public.fee_records(student_id, academic_year);
CREATE INDEX IF NOT EXISTS idx_fee_records_type_status ON public.fee_records(fee_type_id, status);
CREATE INDEX IF NOT EXISTS idx_fee_record_types_fee_record ON public.fee_record_types(fee_record_id);
