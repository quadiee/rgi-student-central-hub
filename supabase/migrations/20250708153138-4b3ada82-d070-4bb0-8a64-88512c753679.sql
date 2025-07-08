
-- Phase 1: Database Population & Sample Data
-- First, let's create comprehensive sample data for all components

-- Insert departments if they don't exist
INSERT INTO public.departments (id, name, code, description, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Computer Science Engineering', 'CSE', 'Computer Science and Engineering Department', true),
('550e8400-e29b-41d4-a716-446655440002', 'Electronics & Communication Engineering', 'ECE', 'Electronics and Communication Engineering Department', true),
('550e8400-e29b-41d4-a716-446655440003', 'Mechanical Engineering', 'MECH', 'Mechanical Engineering Department', true),
('550e8400-e29b-41d4-a716-446655440004', 'Civil Engineering', 'CIVIL', 'Civil Engineering Department', true),
('550e8400-e29b-41d4-a716-446655440005', 'Electrical Engineering', 'EEE', 'Electrical and Electronics Engineering Department', true),
('550e8400-e29b-41d4-a716-446655440006', 'Information Technology', 'IT', 'Information Technology Department', true),
('550e8400-e29b-41d4-a716-446655440007', 'Administration', 'ADMIN', 'Administrative Department', true)
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Create fee types if they don't exist
INSERT INTO public.fee_types (id, name, description, is_mandatory, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Semester Fee', 'Regular semester tuition fee', true, true),
('660e8400-e29b-41d4-a716-446655440002', 'Lab Fee', 'Laboratory usage and equipment fee', true, true),
('660e8400-e29b-41d4-a716-446655440003', 'Library Fee', 'Library access and book fee', true, true),
('660e8400-e29b-41d4-a716-446655440004', 'Development Fee', 'Infrastructure development fee', true, true),
('660e8400-e29b-41d4-a716-446655440005', 'Sports Fee', 'Sports facilities and activities fee', false, true),
('660e8400-e29b-41d4-a716-446655440006', 'Hostel Fee', 'Hostel accommodation fee', false, true),
('660e8400-e29b-41d4-a716-446655440007', 'Transport Fee', 'College transport service fee', false, true),
('660e8400-e29b-41d4-a716-446655440008', 'Exam Fee', 'Examination and evaluation fee', true, true)
ON CONFLICT (name) DO UPDATE SET 
  description = EXCLUDED.description,
  is_mandatory = EXCLUDED.is_mandatory,
  is_active = EXCLUDED.is_active;

-- Create comprehensive sample user invitations for immediate testing
INSERT INTO public.user_invitations (
  email, role, department, employee_id, roll_number, is_active, expires_at
) VALUES
-- Admin and management
('admin@rgce.edu.in', 'admin', 'ADMIN', 'ADM001', NULL, true, now() + interval '1 year'),
('principal@rgce.edu.in', 'principal', 'ADMIN', 'PRI001', NULL, true, now() + interval '1 year'),
('chairman@rgce.edu.in', 'chairman', 'ADMIN', 'CHM001', NULL, true, now() + interval '1 year'),

-- HODs for each department
('cse.hod@rgce.edu.in', 'hod', 'CSE', 'HOD001', NULL, true, now() + interval '1 year'),
('ece.hod@rgce.edu.in', 'hod', 'ECE', 'HOD002', NULL, true, now() + interval '1 year'),
('mech.hod@rgce.edu.in', 'hod', 'MECH', 'HOD003', NULL, true, now() + interval '1 year'),
('civil.hod@rgce.edu.in', 'hod', 'CIVIL', 'HOD004', NULL, true, now() + interval '1 year'),
('eee.hod@rgce.edu.in', 'hod', 'EEE', 'HOD005', NULL, true, now() + interval '1 year'),
('it.hod@rgce.edu.in', 'hod', 'IT', 'HOD006', NULL, true, now() + interval '1 year'),

-- Sample faculty members
('faculty.cse1@rgce.edu.in', 'faculty', 'CSE', 'FAC001', NULL, true, now() + interval '1 year'),
('faculty.cse2@rgce.edu.in', 'faculty', 'CSE', 'FAC002', NULL, true, now() + interval '1 year'),
('faculty.ece1@rgce.edu.in', 'faculty', 'ECE', 'FAC003', NULL, true, now() + interval '1 year'),
('faculty.mech1@rgce.edu.in', 'faculty', 'MECH', 'FAC004', NULL, true, now() + interval '1 year'),

-- Sample students for each department and year
-- CSE Students
('student.21cse001@rgce.edu.in', 'student', 'CSE', NULL, '21CSE001', true, now() + interval '1 year'),
('student.21cse002@rgce.edu.in', 'student', 'CSE', NULL, '21CSE002', true, now() + interval '1 year'),
('student.21cse003@rgce.edu.in', 'student', 'CSE', NULL, '21CSE003', true, now() + interval '1 year'),
('student.22cse001@rgce.edu.in', 'student', 'CSE', NULL, '22CSE001', true, now() + interval '1 year'),
('student.22cse002@rgce.edu.in', 'student', 'CSE', NULL, '22CSE002', true, now() + interval '1 year'),
('student.23cse001@rgce.edu.in', 'student', 'CSE', NULL, '23CSE001', true, now() + interval '1 year'),
('student.24cse001@rgce.edu.in', 'student', 'CSE', NULL, '24CSE001', true, now() + interval '1 year'),

-- ECE Students
('student.21ece001@rgce.edu.in', 'student', 'ECE', NULL, '21ECE001', true, now() + interval '1 year'),
('student.21ece002@rgce.edu.in', 'student', 'ECE', NULL, '21ECE002', true, now() + interval '1 year'),
('student.22ece001@rgce.edu.in', 'student', 'ECE', NULL, '22ECE001', true, now() + interval '1 year'),
('student.23ece001@rgce.edu.in', 'student', 'ECE', NULL, '23ECE001', true, now() + interval '1 year'),
('student.24ece001@rgce.edu.in', 'student', 'ECE', NULL, '24ECE001', true, now() + interval '1 year'),

-- MECH Students
('student.21mech001@rgce.edu.in', 'student', 'MECH', NULL, '21MECH001', true, now() + interval '1 year'),
('student.21mech002@rgce.edu.in', 'student', 'MECH', NULL, '21MECH002', true, now() + interval '1 year'),
('student.22mech001@rgce.edu.in', 'student', 'MECH', NULL, '22MECH001', true, now() + interval '1 year'),
('student.23mech001@rgce.edu.in', 'student', 'MECH', NULL, '23MECH001', true, now() + interval '1 year'),

-- CIVIL Students
('student.21civil001@rgce.edu.in', 'student', 'CIVIL', NULL, '21CIVIL001', true, now() + interval '1 year'),
('student.22civil001@rgce.edu.in', 'student', 'CIVIL', NULL, '22CIVIL001', true, now() + interval '1 year'),
('student.23civil001@rgce.edu.in', 'student', 'CIVIL', NULL, '23CIVIL001', true, now() + interval '1 year'),

-- EEE Students
('student.21eee001@rgce.edu.in', 'student', 'EEE', NULL, '21EEE001', true, now() + interval '1 year'),
('student.22eee001@rgce.edu.in', 'student', 'EEE', NULL, '22EEE001', true, now() + interval '1 year'),

-- IT Students
('student.21it001@rgce.edu.in', 'student', 'IT', NULL, '21IT001', true, now() + interval '1 year'),
('student.22it001@rgce.edu.in', 'student', 'IT', NULL, '22IT001', true, now() + interval '1 year')

ON CONFLICT (email) DO UPDATE SET 
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  employee_id = EXCLUDED.employee_id,
  roll_number = EXCLUDED.roll_number,
  is_active = true,
  expires_at = now() + interval '1 year';

-- Create enhanced fee structures for current academic year
INSERT INTO public.fee_structures (
  id,
  academic_year,
  semester,
  department_id,
  fee_categories,
  total_amount,
  due_date,
  late_fee_percentage,
  installment_allowed,
  max_installments,
  is_active
) VALUES
-- CSE Department fee structures
('770e8400-e29b-41d4-a716-446655440001', '2024-25', 5, '550e8400-e29b-41d4-a716-446655440001', 
 '[
   {"id": "1", "name": "Tuition Fee", "amount": 45000, "mandatory": true},
   {"id": "2", "name": "Lab Fee", "amount": 8000, "mandatory": true},
   {"id": "3", "name": "Library Fee", "amount": 2000, "mandatory": true},
   {"id": "4", "name": "Development Fee", "amount": 5000, "mandatory": true},
   {"id": "5", "name": "Sports Fee", "amount": 1500, "mandatory": false}
 ]'::jsonb, 61500, '2024-12-31', 5.0, true, 3, true),

-- ECE Department fee structures
('770e8400-e29b-41d4-a716-446655440002', '2024-25', 5, '550e8400-e29b-41d4-a716-446655440002',
 '[
   {"id": "1", "name": "Tuition Fee", "amount": 42000, "mandatory": true},
   {"id": "2", "name": "Lab Fee", "amount": 12000, "mandatory": true},
   {"id": "3", "name": "Library Fee", "amount": 2000, "mandatory": true},
   {"id": "4", "name": "Development Fee", "amount": 5000, "mandatory": true}
 ]'::jsonb, 61000, '2024-12-31', 5.0, true, 3, true),

-- MECH Department fee structures
('770e8400-e29b-41d4-a716-446655440003', '2024-25', 5, '550e8400-e29b-41d4-a716-446655440003',
 '[
   {"id": "1", "name": "Tuition Fee", "amount": 40000, "mandatory": true},
   {"id": "2", "name": "Workshop Fee", "amount": 15000, "mandatory": true},
   {"id": "3", "name": "Library Fee", "amount": 2000, "mandatory": true},
   {"id": "4", "name": "Development Fee", "amount": 5000, "mandatory": true}
 ]'::jsonb, 62000, '2024-12-31', 5.0, true, 3, true),

-- CIVIL Department fee structures
('770e8400-e29b-41d4-a716-446655440004', '2024-25', 5, '550e8400-e29b-41d4-a716-446655440004',
 '[
   {"id": "1", "name": "Tuition Fee", "amount": 39000, "mandatory": true},
   {"id": "2", "name": "Surveying Fee", "amount": 8000, "mandatory": true},
   {"id": "3", "name": "Library Fee", "amount": 2000, "mandatory": true},
   {"id": "4", "name": "Development Fee", "amount": 5000, "mandatory": true}
 ]'::jsonb, 54000, '2024-12-31', 5.0, true, 3, true),

-- EEE Department fee structures
('770e8400-e29b-41d4-a716-446655440005', '2024-25', 5, '550e8400-e29b-41d4-a716-446655440005',
 '[
   {"id": "1", "name": "Tuition Fee", "amount": 41000, "mandatory": true},
   {"id": "2", "name": "Lab Fee", "amount": 10000, "mandatory": true},
   {"id": "3", "name": "Library Fee", "amount": 2000, "mandatory": true},
   {"id": "4", "name": "Development Fee", "amount": 5000, "mandatory": true}
 ]'::jsonb, 58000, '2024-12-31', 5.0, true, 3, true),

-- IT Department fee structures
('770e8400-e29b-41d4-a716-446655440006', '2024-25', 5, '550e8400-e29b-41d4-a716-446655440006',
 '[
   {"id": "1", "name": "Tuition Fee", "amount": 44000, "mandatory": true},
   {"id": "2", "name": "Lab Fee", "amount": 9000, "mandatory": true},
   {"id": "3", "name": "Library Fee", "amount": 2000, "mandatory": true},
   {"id": "4", "name": "Development Fee", "amount": 5000, "mandatory": true}
 ]'::jsonb, 60000, '2024-12-31', 5.0, true, 3, true)

ON CONFLICT (id) DO UPDATE SET 
  fee_categories = EXCLUDED.fee_categories,
  total_amount = EXCLUDED.total_amount,
  due_date = EXCLUDED.due_date,
  is_active = EXCLUDED.is_active;

-- Create function to generate sample fee records and payments
CREATE OR REPLACE FUNCTION public.generate_comprehensive_sample_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    student_record RECORD;
    fee_structure_record RECORD;
    fee_record_id UUID;
    payment_amount NUMERIC;
    payment_status payment_status;
    payment_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Clear existing sample data
    DELETE FROM public.payment_transactions WHERE student_id IN (
        SELECT id FROM public.profiles WHERE email LIKE '%@rgce.edu.in'
    );
    
    DELETE FROM public.fee_records WHERE student_id IN (
        SELECT id FROM public.profiles WHERE email LIKE '%@rgce.edu.in'
    );
    
    -- Generate fee records for all students
    FOR student_record IN 
        SELECT p.id, p.department_id, p.roll_number, p.name, d.code as dept_code
        FROM public.profiles p
        LEFT JOIN public.departments d ON p.department_id = d.id
        WHERE p.role = 'student' AND p.email LIKE '%@rgce.edu.in'
    LOOP
        -- Get fee structure for current semester
        SELECT * INTO fee_structure_record 
        FROM public.fee_structures 
        WHERE department_id = student_record.department_id 
          AND semester = 5 
          AND academic_year = '2024-25' 
          AND is_active = true
        LIMIT 1;
        
        IF fee_structure_record.id IS NOT NULL THEN
            -- Determine payment status and amounts based on student distribution
            CASE 
                WHEN random() < 0.4 THEN -- 40% fully paid
                    payment_amount := fee_structure_record.total_amount;
                    payment_status := 'Paid';
                WHEN random() < 0.7 THEN -- 30% partially paid
                    payment_amount := fee_structure_record.total_amount * (0.3 + random() * 0.6);
                    payment_status := 'Partial';
                WHEN random() < 0.9 THEN -- 20% pending
                    payment_amount := 0;
                    payment_status := 'Pending';
                ELSE -- 10% overdue
                    payment_amount := 0;
                    payment_status := 'Overdue';
            END CASE;
            
            -- Create fee record
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
                status,
                fee_type_id
            ) VALUES (
                student_record.id,
                fee_structure_record.id,
                '2024-25',
                5,
                fee_structure_record.total_amount,
                CASE WHEN random() < 0.1 THEN 2000 ELSE 0 END, -- 10% get scholarship
                CASE WHEN payment_status = 'Overdue' THEN 1000 ELSE 0 END,
                fee_structure_record.total_amount - CASE WHEN random() < 0.1 THEN 2000 ELSE 0 END + CASE WHEN payment_status = 'Overdue' THEN 1000 ELSE 0 END,
                payment_amount,
                CASE 
                    WHEN payment_status = 'Overdue' THEN '2024-11-30'::date
                    ELSE fee_structure_record.due_date
                END,
                payment_status::fee_status,
                '660e8400-e29b-41d4-a716-446655440001' -- Semester Fee
            ) RETURNING id INTO fee_record_id;
            
            -- Create payment transaction if there's a payment
            IF payment_amount > 0 THEN
                payment_date := now() - interval '5 days' - (random() * interval '30 days');
                
                INSERT INTO public.payment_transactions (
                    fee_record_id,
                    student_id,
                    amount,
                    payment_method,
                    transaction_id,
                    status,
                    receipt_number,
                    processed_at,
                    created_at
                ) VALUES (
                    fee_record_id,
                    student_record.id,
                    payment_amount,
                    (ARRAY['Online', 'Cash', 'UPI', 'Cheque'])[floor(random() * 4 + 1)]::payment_method,
                    'TXN' || extract(epoch from payment_date)::bigint || floor(random() * 1000),
                    'Success'::payment_status,
                    'RCP-' || to_char(payment_date, 'YYYYMMDD') || '-' || lpad(floor(random() * 9999)::text, 4, '0'),
                    payment_date,
                    payment_date
                );
                
                -- Update fee record with payment date
                UPDATE public.fee_records 
                SET last_payment_date = payment_date
                WHERE id = fee_record_id;
            END IF;
        END IF;
    END LOOP;
    
    -- Generate some previous semester data
    FOR student_record IN 
        SELECT p.id, p.department_id, p.roll_number, p.name
        FROM public.profiles p
        WHERE p.role = 'student' AND p.email LIKE '%@rgce.edu.in'
        LIMIT 15 -- Generate for subset of students
    LOOP
        -- Create fee record for semester 4
        INSERT INTO public.fee_records (
            student_id,
            academic_year,
            semester,
            original_amount,
            final_amount,
            paid_amount,
            due_date,
            status,
            fee_type_id,
            last_payment_date,
            created_at
        ) VALUES (
            student_record.id,
            '2024-25',
            4,
            55000,
            55000,
            55000, -- All previous semester fees are paid
            '2024-08-15',
            'Paid'::fee_status,
            '660e8400-e29b-41d4-a716-446655440001',
            '2024-08-10'::timestamp with time zone,
            '2024-07-01'::timestamp with time zone
        );
    END LOOP;
    
END;
$function$;

-- Execute the sample data generation
SELECT public.generate_comprehensive_sample_data();

-- Create enhanced analytics functions
CREATE OR REPLACE FUNCTION public.get_real_time_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    result json;
    total_students integer;
    total_fee_records integer;
    total_fees numeric;
    total_collected numeric;
    collection_rate numeric;
    pending_fees numeric;
    overdue_count integer;
BEGIN
    -- Get comprehensive statistics
    SELECT 
        COUNT(DISTINCT CASE WHEN p.role = 'student' THEN p.id END),
        COUNT(fr.id),
        COALESCE(SUM(fr.final_amount), 0),
        COALESCE(SUM(fr.paid_amount), 0),
        COUNT(CASE WHEN fr.status = 'Overdue' THEN 1 END)
    INTO total_students, total_fee_records, total_fees, total_collected, overdue_count
    FROM public.profiles p
    LEFT JOIN public.fee_records fr ON p.id = fr.student_id
    WHERE p.is_active = true;
    
    pending_fees := total_fees - total_collected;
    collection_rate := CASE 
        WHEN total_fees > 0 THEN ROUND((total_collected / total_fees) * 100, 2)
        ELSE 0 
    END;
    
    result := json_build_object(
        'total_students', total_students,
        'total_fee_records', total_fee_records,
        'total_fees', total_fees,
        'total_collected', total_collected,
        'pending_fees', pending_fees,
        'collection_rate', collection_rate,
        'overdue_count', overdue_count,
        'last_updated', now()
    );
    
    RETURN result;
END;
$function$;

-- Create function for department-wise analytics
CREATE OR REPLACE FUNCTION public.get_department_dashboard_data()
RETURNS TABLE(
    department_id uuid,
    department_name text,
    department_code text,
    total_students bigint,
    total_fees numeric,
    collected_fees numeric,
    pending_fees numeric,
    collection_percentage numeric,
    overdue_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        d.id as department_id,
        d.name as department_name,
        d.code as department_code,
        COUNT(DISTINCT CASE WHEN p.role = 'student' THEN p.id END) as total_students,
        COALESCE(SUM(fr.final_amount), 0) as total_fees,
        COALESCE(SUM(fr.paid_amount), 0) as collected_fees,
        COALESCE(SUM(fr.final_amount - COALESCE(fr.paid_amount, 0)), 0) as pending_fees,
        CASE 
            WHEN SUM(fr.final_amount) > 0 
            THEN ROUND((SUM(COALESCE(fr.paid_amount, 0)) / SUM(fr.final_amount)) * 100, 2)
            ELSE 0 
        END as collection_percentage,
        COUNT(CASE WHEN fr.status = 'Overdue' THEN 1 END) as overdue_count
    FROM public.departments d
    LEFT JOIN public.profiles p ON d.id = p.department_id AND p.is_active = true
    LEFT JOIN public.fee_records fr ON p.id = fr.student_id
    WHERE d.is_active = true
    GROUP BY d.id, d.name, d.code
    ORDER BY d.name;
END;
$function$;
