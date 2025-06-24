
-- Fix all database functions to use immutable search paths for security

-- 1. Update calculate_penalty_amount function
CREATE OR REPLACE FUNCTION public.calculate_penalty_amount(due_date date, original_amount numeric, penalty_percentage numeric)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE 
    WHEN CURRENT_DATE > due_date 
    THEN (original_amount * penalty_percentage / 100) * (CURRENT_DATE - due_date) / 30
    ELSE 0
  END;
$$;

-- 2. Update update_fee_record_status function
CREATE OR REPLACE FUNCTION public.update_fee_record_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update the fee record status based on payments
  UPDATE public.fee_records
  SET 
    paid_amount = (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.payment_transactions
      WHERE fee_record_id = NEW.fee_record_id AND status = 'Success'
    ),
    status = CASE
      WHEN (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.payment_transactions
        WHERE fee_record_id = NEW.fee_record_id AND status = 'Success'
      ) >= final_amount THEN 'Paid'
      WHEN (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.payment_transactions
        WHERE fee_record_id = NEW.fee_record_id AND status = 'Success'
      ) > 0 THEN 'Partial'
      WHEN due_date < CURRENT_DATE THEN 'Overdue'
      ELSE 'Pending'
    END,
    last_payment_date = CASE
      WHEN NEW.status = 'Success' THEN NEW.processed_at
      ELSE last_payment_date
    END,
    updated_at = now()
  WHERE id = NEW.fee_record_id;
  
  RETURN NEW;
END;
$$;

-- 3. Update generate_receipt_number function
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  receipt_num TEXT;
  counter INTEGER;
BEGIN
  -- Get the current count of transactions for today
  SELECT COUNT(*) + 1 INTO counter
  FROM public.payment_transactions
  WHERE DATE(created_at) = CURRENT_DATE;
  
  -- Generate receipt number: RCP-YYYYMMDD-XXXX
  receipt_num := 'RCP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
  
  RETURN receipt_num;
END;
$$;

-- 4. Update create_installments function
CREATE OR REPLACE FUNCTION public.create_installments(p_fee_record_id uuid, p_total_amount numeric, p_num_installments integer, p_first_due_date date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  installment_amount DECIMAL(10,2);
  i INTEGER;
BEGIN
  -- Validate input parameters
  IF p_fee_record_id IS NULL OR p_total_amount <= 0 OR p_num_installments <= 0 OR p_first_due_date IS NULL THEN
    RAISE EXCEPTION 'Invalid input parameters for create_installments';
  END IF;

  installment_amount := p_total_amount / p_num_installments;
  
  FOR i IN 1..p_num_installments LOOP
    INSERT INTO public.fee_installments (
      fee_record_id,
      installment_number,
      amount,
      due_date,
      status
    ) VALUES (
      p_fee_record_id,
      i,
      CASE WHEN i = p_num_installments 
           THEN p_total_amount - (installment_amount * (i - 1))
           ELSE installment_amount
      END,
      p_first_due_date + INTERVAL '1 month' * (i - 1),
      'Pending'
    );
  END LOOP;
END;
$$;

-- 5. Update mark_invitation_used function
CREATE OR REPLACE FUNCTION public.mark_invitation_used(invitation_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Validate input
  IF invitation_email IS NULL OR invitation_email = '' THEN
    RAISE EXCEPTION 'Invalid email parameter';
  END IF;

  UPDATE public.user_invitations
  SET used_at = now()
  WHERE email = invitation_email AND used_at IS NULL;
END;
$$;

-- 6. Update create_admin_invitation_if_not_exists function
CREATE OR REPLACE FUNCTION public.create_admin_invitation_if_not_exists()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  existing_invitation record;
  result json;
BEGIN
  -- Check if admin invitation already exists and is valid
  SELECT * INTO existing_invitation
  FROM public.user_invitations
  WHERE email = 'praveen@rgce.edu.in'
    AND is_active = true
    AND expires_at > now()
    AND used_at IS NULL;

  IF existing_invitation.id IS NOT NULL THEN
    result := json_build_object(
      'success', true,
      'message', 'Admin invitation already exists',
      'invitation_id', existing_invitation.id
    );
    RETURN result;
  END IF;

  -- Create new admin invitation
  INSERT INTO public.user_invitations (
    email,
    role,
    department,
    employee_id,
    invited_by,
    is_active,
    expires_at
  ) VALUES (
    'praveen@rgce.edu.in',
    'admin'::public.user_role,
    'ADMIN'::public.department,
    'ADMIN001',
    NULL,
    true,
    now() + interval '30 days'
  );

  result := json_build_object(
    'success', true,
    'message', 'Admin invitation created successfully'
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

-- 7. Update get_invitation_details function
CREATE OR REPLACE FUNCTION public.get_invitation_details(invitation_email text)
RETURNS TABLE(id uuid, email text, role user_role, department department, roll_number text, employee_id text, invited_at timestamp with time zone, expires_at timestamp with time zone, used_at timestamp with time zone, is_active boolean, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Validate input
  IF invitation_email IS NULL OR invitation_email = '' THEN
    RAISE EXCEPTION 'Invalid email parameter';
  END IF;

  RETURN QUERY
  SELECT 
    ui.id,
    ui.email,
    ui.role,
    ui.department,
    ui.roll_number,
    ui.employee_id,
    ui.invited_at,
    ui.expires_at,
    ui.used_at,
    ui.is_active,
    (ui.is_active = true AND ui.expires_at > now() AND ui.used_at IS NULL) as is_valid
  FROM public.user_invitations ui
  WHERE ui.email = invitation_email;
END;
$$;

-- 8. Update create_direct_admin function
CREATE OR REPLACE FUNCTION public.create_direct_admin()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result json;
BEGIN
  -- Delete any existing admin invitation to start fresh
  DELETE FROM public.user_invitations 
  WHERE email = 'praveen@rgce.edu.in';
  
  -- Create a simple admin invitation that doesn't expire
  INSERT INTO public.user_invitations (
    email,
    role,
    department,
    employee_id,
    invited_by,
    is_active,
    expires_at
  ) VALUES (
    'praveen@rgce.edu.in',
    'admin'::public.user_role,
    'ADMIN'::public.department,
    'ADMIN001',
    NULL,
    true,
    now() + interval '1 year' -- Long expiration
  ) ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    is_active = true,
    expires_at = now() + interval '1 year',
    used_at = NULL;

  result := json_build_object(
    'success', true,
    'message', 'Admin invitation created and ready for registration'
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

-- Add missing RLS policies for better security

-- Enable RLS on all tables if not already enabled
ALTER TABLE public.fee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Create security definer functions for RLS policies to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_user_department(user_id uuid)
RETURNS department
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
STABLE
AS $$
  SELECT department FROM public.profiles WHERE id = user_id;
$$;

-- RLS policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view and manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "HODs can view department profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view and manage all profiles" ON public.profiles
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'principal'));

CREATE POLICY "HODs can view department profiles" ON public.profiles
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'hod' AND 
    department = public.get_user_department(auth.uid())
  );

-- RLS policies for fee_records
DROP POLICY IF EXISTS "Students can view their own fee records" ON public.fee_records;
DROP POLICY IF EXISTS "Faculty can view department fee records" ON public.fee_records;
DROP POLICY IF EXISTS "Admins can manage all fee records" ON public.fee_records;

CREATE POLICY "Students can view their own fee records" ON public.fee_records
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Faculty can view department fee records" ON public.fee_records
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('faculty', 'hod') AND
    student_id IN (
      SELECT id FROM public.profiles 
      WHERE department = public.get_user_department(auth.uid())
    )
  );

CREATE POLICY "Admins can manage all fee records" ON public.fee_records
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'principal'));

-- RLS policies for payment_transactions
DROP POLICY IF EXISTS "Students can view their own transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Staff can manage transactions" ON public.payment_transactions;

CREATE POLICY "Students can view their own transactions" ON public.payment_transactions
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Staff can manage transactions" ON public.payment_transactions
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'principal', 'hod', 'faculty'));

-- RLS policies for user_invitations
DROP POLICY IF EXISTS "Admins can manage invitations" ON public.user_invitations;

CREATE POLICY "Admins can manage invitations" ON public.user_invitations
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'principal'));

-- Create trigger for automatic fee record status updates
DROP TRIGGER IF EXISTS update_fee_record_status_trigger ON public.payment_transactions;
CREATE TRIGGER update_fee_record_status_trigger
  AFTER INSERT OR UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_fee_record_status();
