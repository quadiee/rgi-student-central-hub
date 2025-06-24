
-- Recreate views without SECURITY DEFINER property
-- Drop existing views first
DROP VIEW IF EXISTS public.student_fee_summary;
DROP VIEW IF EXISTS public.hod_department_summary;
DROP VIEW IF EXISTS public.principal_institution_summary;

-- Recreate student fee summary view without SECURITY DEFINER
CREATE VIEW public.student_fee_summary AS
SELECT 
    p.id as student_id,
    p.name,
    p.roll_number,
    p.department_id,
    d.name as department_name,
    COUNT(fr.id) as total_fee_records,
    COALESCE(SUM(fr.final_amount), 0) as total_fees,
    COALESCE(SUM(fr.paid_amount), 0) as total_paid,
    COALESCE(SUM(fr.final_amount) - SUM(fr.paid_amount), 0) as pending_amount,
    CASE 
        WHEN COUNT(fr.id) = 0 THEN 'No Fees'
        WHEN SUM(fr.final_amount) = SUM(fr.paid_amount) THEN 'Fully Paid'
        WHEN SUM(fr.paid_amount) > 0 THEN 'Partially Paid'
        ELSE 'Unpaid'
    END as payment_status
FROM public.profiles p
LEFT JOIN public.departments d ON p.department_id = d.id
LEFT JOIN public.fee_records fr ON p.id = fr.student_id
WHERE p.role = 'student' AND p.is_active = true
GROUP BY p.id, p.name, p.roll_number, p.department_id, d.name;

-- Recreate HOD department summary view without SECURITY DEFINER
CREATE VIEW public.hod_department_summary AS
SELECT 
    d.id as department_id,
    d.name as department_name,
    d.code as department_code,
    COUNT(DISTINCT p.id) as total_students,
    COUNT(DISTINCT fr.id) as total_fee_records,
    COALESCE(SUM(fr.final_amount), 0) as total_department_fees,
    COALESCE(SUM(fr.paid_amount), 0) as total_collected,
    COALESCE(SUM(fr.final_amount) - SUM(fr.paid_amount), 0) as total_pending,
    ROUND(
        CASE 
            WHEN SUM(fr.final_amount) > 0 
            THEN (SUM(fr.paid_amount) * 100.0 / SUM(fr.final_amount))
            ELSE 0 
        END, 2
    ) as collection_percentage
FROM public.departments d
LEFT JOIN public.profiles p ON d.id = p.department_id AND p.role = 'student' AND p.is_active = true
LEFT JOIN public.fee_records fr ON p.id = fr.student_id
WHERE d.is_active = true
GROUP BY d.id, d.name, d.code;

-- Recreate principal institution summary view without SECURITY DEFINER
CREATE VIEW public.principal_institution_summary AS
SELECT 
    COUNT(DISTINCT d.id) as total_departments,
    COUNT(DISTINCT p.id) as total_students,
    COUNT(DISTINCT fr.id) as total_fee_records,
    COALESCE(SUM(fr.final_amount), 0) as total_institution_fees,
    COALESCE(SUM(fr.paid_amount), 0) as total_collected,
    COALESCE(SUM(fr.final_amount) - SUM(fr.paid_amount), 0) as total_pending,
    ROUND(
        CASE 
            WHEN SUM(fr.final_amount) > 0 
            THEN (SUM(fr.paid_amount) * 100.0 / SUM(fr.final_amount))
            ELSE 0 
        END, 2
    ) as overall_collection_percentage,
    COUNT(DISTINCT CASE WHEN fr.status = 'Overdue' THEN fr.id END) as overdue_records
FROM public.departments d
LEFT JOIN public.profiles p ON d.id = p.department_id AND p.role = 'student' AND p.is_active = true
LEFT JOIN public.fee_records fr ON p.id = fr.student_id
WHERE d.is_active = true;
