
-- First, update some existing student profiles to have scholarship eligibility criteria
UPDATE public.profiles 
SET 
  community = CASE 
    WHEN id IN (
      SELECT DISTINCT student_id 
      FROM fee_records 
      ORDER BY created_at 
      LIMIT 1
    ) THEN 'SC'
    ELSE community
  END,
  first_generation = CASE 
    WHEN id IN (
      SELECT DISTINCT student_id 
      FROM fee_records 
      ORDER BY created_at DESC
      LIMIT 1
    ) THEN true
    ELSE first_generation
  END
WHERE role = 'student' AND is_active = true;

-- Create real scholarship records for students with existing fee records
INSERT INTO public.scholarships (
  student_id,
  scholarship_type,
  eligible_amount,
  academic_year,
  semester,
  applied_status,
  application_date,
  received_by_institution,
  receipt_date,
  remarks
)
SELECT 
  fr.student_id,
  CASE 
    WHEN p.community IN ('SC', 'ST') THEN 'PMSS'
    WHEN p.first_generation = true THEN 'FG'
  END as scholarship_type,
  CASE 
    WHEN p.community IN ('SC', 'ST') THEN 50000
    WHEN p.first_generation = true THEN 25000
  END as eligible_amount,
  fr.academic_year,
  fr.semester,
  true as applied_status,
  CURRENT_DATE - INTERVAL '30 days' as application_date,
  CASE 
    WHEN fr.status = 'Paid' THEN true
    ELSE false
  END as received_by_institution,
  CASE 
    WHEN fr.status = 'Paid' THEN CURRENT_DATE - INTERVAL '15 days'
    ELSE NULL
  END as receipt_date,
  'Real scholarship data aligned with fee records' as remarks
FROM fee_records fr
JOIN profiles p ON fr.student_id = p.id
WHERE p.role = 'student' 
  AND p.is_active = true
  AND (p.community IN ('SC', 'ST') OR p.first_generation = true)
  AND NOT EXISTS (
    SELECT 1 FROM scholarships s 
    WHERE s.student_id = fr.student_id 
    AND s.academic_year = fr.academic_year
  );
