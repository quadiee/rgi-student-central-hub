
-- Add Chairman role to the user_role enum
ALTER TYPE user_role ADD VALUE 'chairman';

-- Add Chairman department to the department enum  
ALTER TYPE department ADD VALUE 'CHAIRMAN';

-- Insert Chairman department into departments table
INSERT INTO public.departments (name, code, description, is_active)
VALUES ('Chairman Office', 'CHAIRMAN', 'Chairman Office Department', true)
ON CONFLICT (code) DO NOTHING;
