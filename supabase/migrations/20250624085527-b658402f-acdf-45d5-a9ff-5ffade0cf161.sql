
-- Drop and recreate function to avoid conflicts
DROP FUNCTION IF EXISTS generate_fee_records_for_students();

-- Create comprehensive fee records for all students with proper relationships
CREATE OR REPLACE FUNCTION generate_complete_fee_system()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    student_record RECORD;
    fee_structure_record RECORD;
    semester_num INTEGER;
    fee_record_id UUID;
BEGIN
    -- Clear existing fee records to start fresh
    DELETE FROM public.payment_transactions;
    DELETE FROM public.fee_records;
    
    -- Generate fee records for each student for current semester (5th semester)
    FOR student_record IN 
        SELECT id, department, roll_number, name FROM public.profiles WHERE role = 'student' AND is_active = true
    LOOP
        -- Get fee structure for 5th semester (current)
        SELECT * INTO fee_structure_record 
        FROM public.fee_structures 
        WHERE semester = 5 AND academic_year = '2024-25' AND is_active = true
        LIMIT 1;
        
        IF fee_structure_record.id IS NOT NULL THEN
            -- Create fee record with realistic amounts
            INSERT INTO public.fee_records (
                student_id,
                fee_structure_id,
                academic_year,
                semester,
                original_amount,
                discount_amount,
                penalty_amount,
                final_amount,
                paid_amount,
                due_date,
                status
            ) VALUES (
                student_record.id,
                fee_structure_record.id,
                '2024-25',
                5,
                fee_structure_record.total_amount,
                CASE WHEN random() < 0.1 THEN 2000 ELSE 0 END, -- 10% chance of scholarship
                CASE WHEN random() < 0.2 THEN 1000 ELSE 0 END, -- 20% chance of late fee
                fee_structure_record.total_amount - CASE WHEN random() < 0.1 THEN 2000 ELSE 0 END + CASE WHEN random() < 0.2 THEN 1000 ELSE 0 END,
                CASE 
                    WHEN random() < 0.3 THEN fee_structure_record.total_amount -- 30% fully paid
                    WHEN random() < 0.5 THEN fee_structure_record.total_amount * 0.6 -- 20% partial payment
                    ELSE 0 -- 50% unpaid
                END,
                fee_structure_record.due_date,
                CASE 
                    WHEN random() < 0.3 THEN 'Paid'
                    WHEN random() < 0.5 THEN 'Partial'
                    WHEN fee_structure_record.due_date < CURRENT_DATE THEN 'Overdue'
                    ELSE 'Pending'
                END
            ) RETURNING id INTO fee_record_id;
            
            -- Create payment transactions for paid/partial records
            IF EXISTS (SELECT 1 FROM public.fee_records WHERE id = fee_record_id AND paid_amount > 0) THEN
                INSERT INTO public.payment_transactions (
                    fee_record_id,
                    student_id,
                    amount,
                    payment_method,
                    transaction_id,
                    status,
                    receipt_number,
                    processed_by,
                    processed_at
                ) 
                SELECT 
                    fee_record_id,
                    student_record.id,
                    fr.paid_amount,
                    (ARRAY['Online', 'Cash', 'UPI', 'Cheque'])[floor(random() * 4 + 1)]::payment_method,
                    'TXN' || extract(epoch from now())::bigint || floor(random() * 1000),
                    'Success'::payment_status,
                    'RCP-' || to_char(current_date, 'YYYYMMDD') || '-' || lpad(row_number() OVER()::text, 4, '0'),
                    (SELECT id FROM public.profiles WHERE role IN ('admin', 'principal') LIMIT 1),
                    now() - interval '5 days'
                FROM public.fee_records fr WHERE fr.id = fee_record_id AND fr.paid_amount > 0;
                
                -- Update last payment date
                UPDATE public.fee_records 
                SET last_payment_date = now() - interval '5 days'
                WHERE id = fee_record_id;
            END IF;
        END IF;
    END LOOP;
END;
$$;

-- Execute the function to generate complete fee system
SELECT generate_complete_fee_system();

-- Add CSV upload configuration table for admin fee management
CREATE TABLE IF NOT EXISTS public.fee_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year TEXT NOT NULL,
    semester INTEGER NOT NULL,
    department department NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    csv_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(academic_year, semester, department)
);

-- Enable RLS on fee_configurations
ALTER TABLE public.fee_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage fee configurations" ON public.fee_configurations
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'principal'));

-- Create function to process CSV fee upload
CREATE OR REPLACE FUNCTION process_fee_csv_upload(
    p_academic_year TEXT,
    p_semester INTEGER,
    p_department department,
    p_csv_data JSONB,
    p_uploaded_by UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    student_data JSONB;
    processed_count INTEGER := 0;
BEGIN
    -- Insert or update fee configuration
    INSERT INTO public.fee_configurations (
        academic_year, semester, department, uploaded_by, csv_data
    ) VALUES (
        p_academic_year, p_semester, p_department, p_uploaded_by, p_csv_data
    ) ON CONFLICT (academic_year, semester, department) 
    DO UPDATE SET 
        csv_data = EXCLUDED.csv_data,
        uploaded_by = EXCLUDED.uploaded_by,
        uploaded_at = now();
    
    -- Process each student in CSV data
    FOR student_data IN SELECT * FROM jsonb_array_elements(p_csv_data)
    LOOP
        -- Update or create fee records based on CSV data
        INSERT INTO public.fee_records (
            student_id,
            academic_year,
            semester,
            original_amount,
            final_amount,
            due_date,
            status
        ) 
        SELECT 
            p.id,
            p_academic_year,
            p_semester,
            (student_data->>'fee_amount')::NUMERIC,
            (student_data->>'fee_amount')::NUMERIC,
            (student_data->>'due_date')::DATE,
            'Pending'
        FROM public.profiles p 
        WHERE p.roll_number = student_data->>'roll_number'
        ON CONFLICT (student_id, academic_year, semester) 
        DO UPDATE SET 
            original_amount = EXCLUDED.original_amount,
            final_amount = EXCLUDED.final_amount,
            due_date = EXCLUDED.due_date;
            
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
