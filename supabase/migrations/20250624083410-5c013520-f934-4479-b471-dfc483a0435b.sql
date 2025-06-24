
-- Instead of directly inserting into profiles, let's create user invitations
-- This is the proper way to set up users in Supabase with authentication

-- First, clear any existing invitations for our sample users
DELETE FROM public.user_invitations 
WHERE email IN (
  'admin@rgce.edu.in',
  'principal@rgce.edu.in', 
  'cse.hod@rgce.edu.in',
  'ece.hod@rgce.edu.in',
  'mech.hod@rgce.edu.in',
  'arun.kumar@rgce.edu.in',
  'deepika.singh@rgce.edu.in',
  'rahul.21cse001@rgce.edu.in',
  'priya.21cse002@rgce.edu.in',
  'amit.21ece001@rgce.edu.in',
  'sneha.21mech001@rgce.edu.in'
);

-- Create user invitations for all sample users
INSERT INTO public.user_invitations (
  email,
  role,
  department,
  employee_id,
  roll_number,
  is_active,
  expires_at
) VALUES
-- Admin users
('admin@rgce.edu.in', 'admin', 'ADMIN', 'ADM001', NULL, true, now() + interval '1 year'),
('principal@rgce.edu.in', 'principal', 'ADMIN', 'PRI001', NULL, true, now() + interval '1 year'),

-- HOD users
('cse.hod@rgce.edu.in', 'hod', 'CSE', 'HOD001', NULL, true, now() + interval '1 year'),
('ece.hod@rgce.edu.in', 'hod', 'ECE', 'HOD002', NULL, true, now() + interval '1 year'),
('mech.hod@rgce.edu.in', 'hod', 'MECH', 'HOD003', NULL, true, now() + interval '1 year'),

-- Faculty users
('arun.kumar@rgce.edu.in', 'faculty', 'CSE', 'FAC001', NULL, true, now() + interval '1 year'),
('deepika.singh@rgce.edu.in', 'faculty', 'ECE', 'FAC002', NULL, true, now() + interval '1 year'),

-- Student users
('rahul.21cse001@rgce.edu.in', 'student', 'CSE', NULL, '21CSE001', true, now() + interval '1 year'),
('priya.21cse002@rgce.edu.in', 'student', 'CSE', NULL, '21CSE002', true, now() + interval '1 year'),
('amit.21ece001@rgce.edu.in', 'student', 'ECE', NULL, '21ECE001', true, now() + interval '1 year'),
('sneha.21mech001@rgce.edu.in', 'student', 'MECH', NULL, '21MECH001', true, now() + interval '1 year');

-- Create fee structures for current academic year
INSERT INTO public.fee_structures (
  academic_year,
  semester,
  fee_categories,
  total_amount,
  due_date,
  late_fee_percentage,
  installment_allowed,
  max_installments,
  is_active
) VALUES
-- CSE Department fees
(
  '2024-25',
  5,
  '[
    {"id": "1", "name": "Tuition Fee", "amount": 45000, "mandatory": true},
    {"id": "2", "name": "Lab Fee", "amount": 8000, "mandatory": true},
    {"id": "3", "name": "Library Fee", "amount": 2000, "mandatory": true},
    {"id": "4", "name": "Development Fee", "amount": 5000, "mandatory": true},
    {"id": "5", "name": "Sports Fee", "amount": 1500, "mandatory": false}
  ]'::jsonb,
  61500,
  '2024-08-15',
  5.0,
  true,
  3,
  true
),
-- ECE Department fees
(
  '2024-25',
  5,
  '[
    {"id": "1", "name": "Tuition Fee", "amount": 42000, "mandatory": true},
    {"id": "2", "name": "Lab Fee", "amount": 12000, "mandatory": true},
    {"id": "3", "name": "Library Fee", "amount": 2000, "mandatory": true},
    {"id": "4", "name": "Development Fee", "amount": 5000, "mandatory": true}
  ]'::jsonb,
  61000,
  '2024-08-15',
  5.0,
  true,
  3,
  true
),
-- MECH Department fees
(
  '2024-25',
  5,
  '[
    {"id": "1", "name": "Tuition Fee", "amount": 40000, "mandatory": true},
    {"id": "2", "name": "Workshop Fee", "amount": 15000, "mandatory": true},
    {"id": "3", "name": "Library Fee", "amount": 2000, "mandatory": true},
    {"id": "4", "name": "Development Fee", "amount": 5000, "mandatory": true}
  ]'::jsonb,
  62000,
  '2024-08-15',
  5.0,
  true,
  3,
  true
),
-- EEE Department fees
(
  '2024-25',
  5,
  '[
    {"id": "1", "name": "Tuition Fee", "amount": 41000, "mandatory": true},
    {"id": "2", "name": "Lab Fee", "amount": 10000, "mandatory": true},
    {"id": "3", "name": "Library Fee", "amount": 2000, "mandatory": true},
    {"id": "4", "name": "Development Fee", "amount": 5000, "mandatory": true}
  ]'::jsonb,
  58000,
  '2024-08-15',
  5.0,
  true,
  3,
  true
),
-- CIVIL Department fees
(
  '2024-25',
  5,
  '[
    {"id": "1", "name": "Tuition Fee", "amount": 39000, "mandatory": true},
    {"id": "2", "name": "Surveying Fee", "amount": 8000, "mandatory": true},
    {"id": "3", "name": "Library Fee", "amount": 2000, "mandatory": true},
    {"id": "4", "name": "Development Fee", "amount": 5000, "mandatory": true}
  ]'::jsonb,
  54000,
  '2024-08-15',
  5.0,
  true,
  3,
  true
),
-- IT Department fees
(
  '2024-25',
  5,
  '[
    {"id": "1", "name": "Tuition Fee", "amount": 44000, "mandatory": true},
    {"id": "2", "name": "Lab Fee", "amount": 9000, "mandatory": true},
    {"id": "3", "name": "Library Fee", "amount": 2000, "mandatory": true},
    {"id": "4", "name": "Development Fee", "amount": 5000, "mandatory": true}
  ]'::jsonb,
  60000,
  '2024-08-15',
  5.0,
  true,
  3,
  true
);
