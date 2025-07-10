
-- Add community and first_generation fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN community text CHECK (community IN ('SC', 'ST', 'OBC', 'General', 'EWS')),
ADD COLUMN first_generation boolean DEFAULT false;

-- Create scholarships table to track scholarship information
CREATE TABLE public.scholarships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  scholarship_type text NOT NULL CHECK (scholarship_type IN ('PMSS', 'FG')),
  eligible_amount numeric NOT NULL,
  applied_status boolean DEFAULT false,
  application_date date,
  received_by_institution boolean DEFAULT false,
  receipt_date date,
  academic_year text NOT NULL,
  semester integer,
  remarks text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id)
);

-- Enable RLS on scholarships table
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for scholarships
CREATE POLICY "Students can view their own scholarships" 
  ON public.scholarships 
  FOR SELECT 
  USING (student_id = auth.uid());

CREATE POLICY "Admins can manage all scholarships" 
  ON public.scholarships 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'principal', 'chairman')
  ));

CREATE POLICY "HODs can manage department scholarships" 
  ON public.scholarships 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles p1
    JOIN public.profiles p2 ON p2.id = scholarships.student_id
    WHERE p1.id = auth.uid() 
    AND p1.role = 'hod' 
    AND p1.department_id = p2.department_id
  ));

-- Create function to automatically calculate scholarship eligibility
CREATE OR REPLACE FUNCTION public.calculate_scholarship_eligibility(
  p_student_id uuid,
  p_academic_year text DEFAULT '2024-25'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  student_record RECORD;
BEGIN
  -- Get student details
  SELECT community, first_generation, id, department_id
  INTO student_record
  FROM public.profiles
  WHERE id = p_student_id AND role = 'student';

  IF student_record.id IS NULL THEN
    RETURN;
  END IF;

  -- Check for PMSS eligibility (SC/ST students)
  IF student_record.community IN ('SC', 'ST') THEN
    INSERT INTO public.scholarships (
      student_id,
      scholarship_type,
      eligible_amount,
      academic_year,
      applied_status
    ) VALUES (
      p_student_id,
      'PMSS',
      50000,
      p_academic_year,
      false
    ) ON CONFLICT (student_id, scholarship_type, academic_year) DO NOTHING;
  END IF;

  -- Check for FG eligibility (First Generation students)
  IF student_record.first_generation = true THEN
    INSERT INTO public.scholarships (
      student_id,
      scholarship_type,
      eligible_amount,
      academic_year,
      applied_status
    ) VALUES (
      p_student_id,
      'FG',
      25000,
      p_academic_year,
      false
    ) ON CONFLICT (student_id, scholarship_type, academic_year) DO NOTHING;
  END IF;
END;
$$;

-- Add unique constraint to prevent duplicate scholarships
ALTER TABLE public.scholarships 
ADD CONSTRAINT unique_student_scholarship_year 
UNIQUE (student_id, scholarship_type, academic_year);

-- Create view for scholarship analytics
CREATE OR REPLACE VIEW public.scholarship_summary AS
SELECT 
  d.id as department_id,
  d.name as department_name,
  d.code as department_code,
  COUNT(DISTINCT s.student_id) as total_scholarship_students,
  COUNT(s.id) as total_scholarships,
  SUM(s.eligible_amount) as total_eligible_amount,
  SUM(CASE WHEN s.received_by_institution THEN s.eligible_amount ELSE 0 END) as total_received_amount,
  COUNT(CASE WHEN s.applied_status THEN 1 END) as applied_scholarships,
  COUNT(CASE WHEN s.received_by_institution THEN 1 END) as received_scholarships,
  s.academic_year
FROM public.departments d
LEFT JOIN public.profiles p ON d.id = p.department_id
LEFT JOIN public.scholarships s ON p.id = s.student_id
WHERE p.role = 'student' AND p.is_active = true
GROUP BY d.id, d.name, d.code, s.academic_year;

-- Create institution-level scholarship summary view
CREATE OR REPLACE VIEW public.institution_scholarship_summary AS
SELECT 
  COUNT(DISTINCT s.student_id) as total_scholarship_students,
  COUNT(s.id) as total_scholarships,
  SUM(s.eligible_amount) as total_eligible_amount,
  SUM(CASE WHEN s.received_by_institution THEN s.eligible_amount ELSE 0 END) as total_received_amount,
  COUNT(CASE WHEN s.applied_status THEN 1 END) as applied_scholarships,
  COUNT(CASE WHEN s.received_by_institution THEN 1 END) as received_scholarships,
  s.academic_year
FROM public.scholarships s
JOIN public.profiles p ON s.student_id = p.id
WHERE p.role = 'student' AND p.is_active = true
GROUP BY s.academic_year;
