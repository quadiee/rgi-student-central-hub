
-- Add scholarship_id column to fee_records table to link scholarships
ALTER TABLE public.fee_records 
ADD COLUMN scholarship_id uuid REFERENCES public.scholarships(id);

-- Create index for better performance
CREATE INDEX idx_fee_records_scholarship_id ON public.fee_records(scholarship_id);

-- Create a function to automatically apply scholarships to fee records
CREATE OR REPLACE FUNCTION public.apply_scholarship_to_fee_record(
  p_fee_record_id uuid,
  p_scholarship_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  scholarship_amount numeric;
  original_fee numeric;
  new_final_amount numeric;
BEGIN
  -- Get scholarship amount
  SELECT eligible_amount INTO scholarship_amount
  FROM scholarships
  WHERE id = p_scholarship_id;
  
  -- Get original fee amount
  SELECT original_amount INTO original_fee
  FROM fee_records
  WHERE id = p_fee_record_id;
  
  -- Calculate new final amount (can't be negative)
  new_final_amount := GREATEST(0, original_fee - COALESCE(scholarship_amount, 0));
  
  -- Update fee record
  UPDATE fee_records
  SET 
    scholarship_id = p_scholarship_id,
    discount_amount = LEAST(original_fee, COALESCE(scholarship_amount, 0)),
    final_amount = new_final_amount,
    paid_amount = CASE 
      WHEN new_final_amount = 0 THEN original_fee 
      ELSE COALESCE(paid_amount, 0)
    END,
    status = CASE 
      WHEN new_final_amount = 0 THEN 'Paid'::fee_status
      WHEN new_final_amount > 0 AND COALESCE(paid_amount, 0) >= new_final_amount THEN 'Paid'::fee_status
      WHEN new_final_amount > 0 AND COALESCE(paid_amount, 0) > 0 THEN 'Partial'::fee_status
      ELSE status
    END,
    updated_at = now()
  WHERE id = p_fee_record_id;
  
  -- Create a payment transaction record for scholarship amount if fee is fully covered
  IF new_final_amount = 0 AND scholarship_amount > 0 THEN
    INSERT INTO payment_transactions (
      fee_record_id,
      student_id,
      amount,
      payment_method,
      transaction_id,
      status,
      receipt_number,
      processed_by,
      processed_at,
      gateway
    )
    SELECT 
      p_fee_record_id,
      fr.student_id,
      LEAST(fr.original_amount, scholarship_amount),
      'Scholarship'::payment_method,
      'SCH-' || p_scholarship_id::text,
      'Success'::payment_status,
      'SCH-RCP-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0'),
      fr.student_id,
      now(),
      'Scholarship Gateway'
    FROM fee_records fr
    WHERE fr.id = p_fee_record_id;
  END IF;
END;
$$;

-- Create function to automatically match and apply scholarships
CREATE OR REPLACE FUNCTION public.auto_apply_scholarships()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rec RECORD;
BEGIN
  -- Match scholarships with fee records based on student and academic year
  FOR rec IN
    SELECT 
      fr.id as fee_record_id,
      s.id as scholarship_id,
      fr.student_id,
      fr.academic_year,
      fr.semester
    FROM fee_records fr
    JOIN scholarships s ON fr.student_id = s.student_id 
      AND fr.academic_year = s.academic_year
    WHERE fr.scholarship_id IS NULL
      AND s.received_by_institution = true
      AND fr.status != 'Paid'
  LOOP
    PERFORM apply_scholarship_to_fee_record(rec.fee_record_id, rec.scholarship_id);
  END LOOP;
END;
$$;

-- Add new payment method enum value for scholarships
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'Scholarship' 
    AND enumtypid = 'payment_method'::regtype
  ) THEN
    ALTER TYPE payment_method ADD VALUE 'Scholarship';
  END IF;
END $$;
