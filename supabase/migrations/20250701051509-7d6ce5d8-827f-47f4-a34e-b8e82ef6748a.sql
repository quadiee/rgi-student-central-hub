
-- First, let's check if there's a profile for the current user
SELECT id, email, role FROM profiles WHERE email = 'admission60@rgce.edu.in';

-- If no profile exists, create one for the admin user
INSERT INTO profiles (
  id, 
  name, 
  email, 
  role, 
  department_id, 
  is_active
) 
SELECT 
  '593508a8-4a33-4e09-92c0-1b02723cb7c2'::uuid,
  'Admin User',
  'admission60@rgce.edu.in',
  'admin'::user_role,
  (SELECT id FROM departments WHERE code = 'ADMIN' LIMIT 1),
  true
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE id = '593508a8-4a33-4e09-92c0-1b02723cb7c2'
);

-- Also ensure there's an ADMIN department if it doesn't exist
INSERT INTO departments (name, code, description, is_active)
VALUES ('Administration', 'ADMIN', 'Administrative Department', true)
ON CONFLICT (code) DO NOTHING;
