
-- Create user activity logging table for audit trails
CREATE TABLE public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for user activity logs
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for activity logs
CREATE POLICY "Users can view their own activity logs" 
  ON public.user_activity_logs 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activity logs" 
  ON public.user_activity_logs 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'principal')
  ));

CREATE POLICY "System can insert activity logs" 
  ON public.user_activity_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Create department fee analytics view
CREATE OR REPLACE VIEW public.department_fee_analytics AS
SELECT 
  d.id as department_id,
  d.name as department_name,
  d.code as department_code,
  COUNT(DISTINCT p.id) as total_students,
  COUNT(fr.id) as total_fee_records,
  COALESCE(SUM(fr.final_amount), 0) as total_fees,
  COALESCE(SUM(fr.paid_amount), 0) as total_collected,
  COALESCE(SUM(fr.final_amount - COALESCE(fr.paid_amount, 0)), 0) as total_pending,
  ROUND(
    CASE 
      WHEN SUM(fr.final_amount) > 0 
      THEN (SUM(COALESCE(fr.paid_amount, 0)) * 100.0 / SUM(fr.final_amount))
      ELSE 0 
    END, 2
  ) as collection_percentage,
  COUNT(CASE WHEN fr.status = 'Overdue' THEN 1 END) as overdue_records
FROM public.departments d
LEFT JOIN public.profiles p ON d.id = p.department_id AND p.role = 'student'
LEFT JOIN public.fee_records fr ON p.id = fr.student_id
WHERE d.is_active = true
GROUP BY d.id, d.name, d.code;

-- Create function to automatically generate fee records for new students
CREATE OR REPLACE FUNCTION public.generate_fee_record_for_student(
  p_student_id UUID,
  p_academic_year TEXT DEFAULT '2024-25',
  p_semester INTEGER DEFAULT 5
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  fee_structure_record RECORD;
  fee_record_id UUID;
  student_dept_id UUID;
BEGIN
  -- Get student's department
  SELECT department_id INTO student_dept_id
  FROM public.profiles
  WHERE id = p_student_id;

  -- Get appropriate fee structure
  SELECT * INTO fee_structure_record
  FROM public.fee_structures
  WHERE academic_year = p_academic_year
    AND semester = p_semester
    AND (department_id = student_dept_id OR department_id IS NULL)
    AND is_active = true
  ORDER BY department_id NULLS LAST
  LIMIT 1;

  IF fee_structure_record.id IS NOT NULL THEN
    -- Create fee record
    INSERT INTO public.fee_records (
      student_id,
      fee_structure_id,
      academic_year,
      semester,
      original_amount,
      final_amount,
      due_date,
      status
    ) VALUES (
      p_student_id,
      fee_structure_record.id,
      p_academic_year,
      p_semester,
      fee_structure_record.total_amount,
      fee_structure_record.total_amount,
      fee_structure_record.due_date,
      'Pending'
    ) RETURNING id INTO fee_record_id;

    -- Log the activity
    INSERT INTO public.user_activity_logs (
      user_id,
      activity_type,
      activity_description,
      metadata
    ) VALUES (
      p_student_id,
      'fee_record_created',
      'Fee record automatically generated for student',
      jsonb_build_object(
        'fee_record_id', fee_record_id,
        'academic_year', p_academic_year,
        'semester', p_semester,
        'amount', fee_structure_record.total_amount
      )
    );

    RETURN fee_record_id;
  END IF;

  RETURN NULL;
END;
$$;

-- Update the handle_new_user function to generate fee records
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  invitation_record RECORD;
  user_role_val public.user_role;
  dept_id_val uuid;
BEGIN
  -- Check if there's an active invitation for this email
  SELECT * INTO invitation_record
  FROM public.user_invitations
  WHERE email = NEW.email 
    AND is_active = true 
    AND expires_at > now() 
    AND used_at IS NULL
  LIMIT 1;

  IF invitation_record.id IS NOT NULL THEN
    -- Use invitation data
    user_role_val := invitation_record.role;
    
    -- Get department_id from departments table
    SELECT id INTO dept_id_val 
    FROM public.departments 
    WHERE code = invitation_record.department::text 
    LIMIT 1;
    
    -- Mark invitation as used
    UPDATE public.user_invitations 
    SET used_at = now() 
    WHERE id = invitation_record.id;
    
  ELSE
    -- Fallback to metadata or defaults
    user_role_val := COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'student'::public.user_role);
    
    -- Get department_id for CSE as default
    SELECT id INTO dept_id_val 
    FROM public.departments 
    WHERE code = 'CSE' 
    LIMIT 1;
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (
    id,
    name,
    email,
    role,
    department_id,
    roll_number,
    employee_id,
    phone,
    guardian_name,
    guardian_phone,
    address,
    is_active
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    user_role_val,
    dept_id_val,
    COALESCE(NEW.raw_user_meta_data ->> 'roll_number', invitation_record.roll_number),
    COALESCE(NEW.raw_user_meta_data ->> 'employee_id', invitation_record.employee_id),
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'guardian_name',
    NEW.raw_user_meta_data ->> 'guardian_phone',
    NEW.raw_user_meta_data ->> 'address',
    true
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    department_id = EXCLUDED.department_id,
    roll_number = EXCLUDED.roll_number,
    employee_id = EXCLUDED.employee_id,
    phone = EXCLUDED.phone,
    guardian_name = EXCLUDED.guardian_name,
    guardian_phone = EXCLUDED.guardian_phone,
    address = EXCLUDED.address,
    updated_at = now();

  -- Generate fee record for students
  IF user_role_val = 'student' THEN
    PERFORM public.generate_fee_record_for_student(NEW.id);
  END IF;

  -- Log user creation activity
  INSERT INTO public.user_activity_logs (
    user_id,
    activity_type,
    activity_description,
    metadata
  ) VALUES (
    NEW.id,
    'user_registered',
    'User account created',
    jsonb_build_object(
      'role', user_role_val,
      'email', NEW.email,
      'invitation_used', invitation_record.id IS NOT NULL
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Profile creation error for user %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Create function to log payment activities
CREATE OR REPLACE FUNCTION public.log_payment_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log payment transaction activity
  INSERT INTO public.user_activity_logs (
    user_id,
    activity_type,
    activity_description,
    metadata
  ) VALUES (
    NEW.student_id,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'payment_created'
      WHEN TG_OP = 'UPDATE' THEN 'payment_updated'
    END,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'Payment transaction created'
      WHEN TG_OP = 'UPDATE' THEN 'Payment transaction updated'
    END,
    jsonb_build_object(
      'transaction_id', NEW.id,
      'fee_record_id', NEW.fee_record_id,
      'amount', NEW.amount,
      'payment_method', NEW.payment_method,
      'status', NEW.status,
      'old_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END
    )
  );

  RETURN NEW;
END;
$$;

-- Create trigger for payment activity logging
DROP TRIGGER IF EXISTS payment_activity_log_trigger ON public.payment_transactions;
CREATE TRIGGER payment_activity_log_trigger
  AFTER INSERT OR UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.log_payment_activity();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON public.user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON public.user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_fee_records_student_status ON public.fee_records(student_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_student_status ON public.payment_transactions(student_id, status);
