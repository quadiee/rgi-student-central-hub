
-- Create enum types for better data integrity
CREATE TYPE public.user_role AS ENUM ('student', 'faculty', 'hod', 'principal', 'admin');
CREATE TYPE public.department AS ENUM ('CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT', 'ADMIN');
CREATE TYPE public.payment_method AS ENUM ('Online', 'Cash', 'Cheque', 'DD', 'UPI');
CREATE TYPE public.payment_status AS ENUM ('Pending', 'Success', 'Failed', 'Cancelled');
CREATE TYPE public.fee_status AS ENUM ('Paid', 'Pending', 'Overdue', 'Partial');
CREATE TYPE public.installment_status AS ENUM ('Pending', 'Paid', 'Overdue');
CREATE TYPE public.waiver_status AS ENUM ('Pending', 'Approved', 'Rejected');

-- 1. User Profiles Table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'student',
  department department NOT NULL,
  roll_number TEXT UNIQUE,
  year_section TEXT,
  employee_id TEXT,
  phone TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Fee Structures Table (Master fee configuration)
CREATE TABLE public.fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year TEXT NOT NULL,
  semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
  department department NOT NULL,
  fee_categories JSONB NOT NULL, -- Array of fee categories with amounts
  total_amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  late_fee_percentage DECIMAL(5,2) DEFAULT 5.0,
  installment_allowed BOOLEAN DEFAULT false,
  max_installments INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(academic_year, semester, department)
);

-- 3. Fee Records Table (Individual student fee assignments)
CREATE TABLE public.fee_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  fee_structure_id UUID REFERENCES public.fee_structures(id),
  academic_year TEXT NOT NULL,
  semester INTEGER NOT NULL,
  original_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  penalty_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  status fee_status DEFAULT 'Pending',
  due_date DATE NOT NULL,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Payment Transactions Table
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_record_id UUID REFERENCES public.fee_records(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method payment_method NOT NULL,
  transaction_id TEXT UNIQUE,
  status payment_status DEFAULT 'Pending',
  gateway TEXT,
  receipt_number TEXT UNIQUE NOT NULL,
  processed_by UUID REFERENCES public.profiles(id),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Fee Installments Table
CREATE TABLE public.fee_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_record_id UUID REFERENCES public.fee_records(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date TIMESTAMP WITH TIME ZONE,
  status installment_status DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(fee_record_id, installment_number)
);

-- 6. Fee Waivers Table
CREATE TABLE public.fee_waivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  fee_record_id UUID REFERENCES public.fee_records(id) ON DELETE CASCADE,
  waiver_type TEXT NOT NULL, -- 'Scholarship', 'Merit', 'Financial Aid', etc.
  waiver_percentage DECIMAL(5,2),
  waiver_amount DECIMAL(10,2),
  reason TEXT NOT NULL,
  status waiver_status DEFAULT 'Pending',
  applied_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_waivers ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Create security definer function to get user department
CREATE OR REPLACE FUNCTION public.get_user_department(user_id UUID)
RETURNS department
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT department FROM public.profiles WHERE id = user_id;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'principal'));

CREATE POLICY "HODs can view department profiles" ON public.profiles
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'hod' AND 
    department = public.get_user_department(auth.uid())
  );

-- RLS Policies for fee_structures
CREATE POLICY "Everyone can view active fee structures" ON public.fee_structures
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage fee structures" ON public.fee_structures
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'principal'));

-- RLS Policies for fee_records
CREATE POLICY "Students can view their own fee records" ON public.fee_records
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "HODs can view department fee records" ON public.fee_records
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'hod' AND 
    student_id IN (
      SELECT id FROM public.profiles 
      WHERE department = public.get_user_department(auth.uid())
    )
  );

CREATE POLICY "Admins can view all fee records" ON public.fee_records
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'principal'));

CREATE POLICY "Authorized users can manage fee records" ON public.fee_records
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'principal', 'hod'));

-- RLS Policies for payment_transactions
CREATE POLICY "Students can view their own transactions" ON public.payment_transactions
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Authorized users can view department transactions" ON public.payment_transactions
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('admin', 'principal') OR
    (public.get_user_role(auth.uid()) = 'hod' AND 
     student_id IN (
       SELECT id FROM public.profiles 
       WHERE department = public.get_user_department(auth.uid())
     ))
  );

CREATE POLICY "Authorized users can create transactions" ON public.payment_transactions
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'principal', 'hod', 'student'));

-- RLS Policies for fee_installments
CREATE POLICY "Students can view their own installments" ON public.fee_installments
  FOR SELECT USING (
    fee_record_id IN (
      SELECT id FROM public.fee_records WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "Authorized users can manage installments" ON public.fee_installments
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'principal', 'hod'));

-- RLS Policies for fee_waivers
CREATE POLICY "Students can view their own waivers" ON public.fee_waivers
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can apply for waivers" ON public.fee_waivers
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Authorized users can manage waivers" ON public.fee_waivers
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'principal', 'hod'));

-- Create indexes for better performance
CREATE INDEX idx_fee_records_student_id ON public.fee_records(student_id);
CREATE INDEX idx_fee_records_academic_year ON public.fee_records(academic_year);
CREATE INDEX idx_fee_records_status ON public.fee_records(status);
CREATE INDEX idx_payment_transactions_fee_record_id ON public.payment_transactions(fee_record_id);
CREATE INDEX idx_payment_transactions_student_id ON public.payment_transactions(student_id);
CREATE INDEX idx_profiles_department ON public.profiles(department);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Functions for automatic calculations (fixed EXTRACT syntax)
CREATE OR REPLACE FUNCTION public.calculate_penalty_amount(
  due_date DATE,
  original_amount DECIMAL(10,2),
  penalty_percentage DECIMAL(5,2)
)
RETURNS DECIMAL(10,2)
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN CURRENT_DATE > due_date 
    THEN (original_amount * penalty_percentage / 100) * (CURRENT_DATE - due_date) / 30
    ELSE 0
  END;
$$;

-- Function to update fee record status
CREATE OR REPLACE FUNCTION public.update_fee_record_status()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Create trigger for automatic status updates
CREATE TRIGGER update_fee_status_trigger
  AFTER INSERT OR UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_fee_record_status();

-- Function to generate receipt numbers
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
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

-- Function to create installments
CREATE OR REPLACE FUNCTION public.create_installments(
  p_fee_record_id UUID,
  p_total_amount DECIMAL(10,2),
  p_num_installments INTEGER,
  p_first_due_date DATE
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  installment_amount DECIMAL(10,2);
  i INTEGER;
BEGIN
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
