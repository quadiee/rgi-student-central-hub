
-- Add faculty role to user_role enum if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role' AND typcategory = 'E') THEN
        CREATE TYPE user_role AS ENUM ('student', 'faculty', 'hod', 'principal', 'admin', 'chairman');
    ELSE
        -- Add faculty to existing enum if not present
        BEGIN
            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'faculty';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    END IF;
END $$;

-- Create faculty_profiles table for extended faculty information
CREATE TABLE IF NOT EXISTS public.faculty_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    employee_code TEXT UNIQUE NOT NULL,
    designation TEXT NOT NULL,
    joining_date DATE NOT NULL,
    confirmation_date DATE,
    retirement_date DATE,
    salary_grade TEXT,
    pf_number TEXT,
    aadhar_number TEXT,
    pan_number TEXT,
    bank_account_number TEXT,
    bank_name TEXT,
    bank_branch TEXT,
    ifsc_code TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relation TEXT,
    current_address TEXT,
    permanent_address TEXT,
    marital_status TEXT,
    spouse_name TEXT,
    children_count INTEGER DEFAULT 0,
    medical_conditions TEXT,
    blood_group TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id)
);

-- Create faculty_qualifications table
CREATE TABLE IF NOT EXISTS public.faculty_qualifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE NOT NULL,
    degree_type TEXT NOT NULL, -- UG, PG, PhD, etc.
    degree_name TEXT NOT NULL,
    specialization TEXT,
    institution_name TEXT NOT NULL,
    university_name TEXT,
    year_of_passing INTEGER NOT NULL,
    percentage NUMERIC(5,2),
    grade TEXT,
    is_highest BOOLEAN DEFAULT false,
    certificate_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create faculty_experience table
CREATE TABLE IF NOT EXISTS public.faculty_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE NOT NULL,
    organization_name TEXT NOT NULL,
    designation TEXT NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE,
    is_current BOOLEAN DEFAULT false,
    experience_type TEXT NOT NULL, -- Teaching, Industry, Research
    responsibilities TEXT,
    achievements TEXT,
    salary NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create faculty_specializations table
CREATE TABLE IF NOT EXISTS public.faculty_specializations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE NOT NULL,
    specialization_area TEXT NOT NULL,
    proficiency_level TEXT NOT NULL, -- Beginner, Intermediate, Advanced, Expert
    years_of_experience INTEGER,
    certifications TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create faculty_courses table
CREATE TABLE IF NOT EXISTS public.faculty_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE NOT NULL,
    course_code TEXT NOT NULL,
    course_name TEXT NOT NULL,
    course_type TEXT NOT NULL, -- Theory, Lab, Project
    semester INTEGER NOT NULL,
    academic_year TEXT NOT NULL,
    department_id UUID REFERENCES public.departments(id),
    credits INTEGER,
    hours_per_week INTEGER,
    student_count INTEGER,
    is_active BOOLEAN DEFAULT true,
    assigned_date DATE DEFAULT CURRENT_DATE,
    assigned_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create faculty_research table
CREATE TABLE IF NOT EXISTS public.faculty_research (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE NOT NULL,
    research_type TEXT NOT NULL, -- Publication, Project, Patent, Conference
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL, -- Ongoing, Completed, Published
    start_date DATE,
    completion_date DATE,
    journal_name TEXT,
    conference_name TEXT,
    publication_date DATE,
    doi TEXT,
    funding_amount NUMERIC(12,2),
    funding_agency TEXT,
    collaborators TEXT[],
    keywords TEXT[],
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create faculty_leaves table
CREATE TABLE IF NOT EXISTS public.faculty_leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE NOT NULL,
    leave_type TEXT NOT NULL, -- Casual, Medical, Maternity, Study, etc.
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected
    applied_date DATE DEFAULT CURRENT_DATE,
    approved_by UUID REFERENCES public.profiles(id),
    approval_date DATE,
    approval_remarks TEXT,
    substitute_faculty_id UUID REFERENCES public.faculty_profiles(id),
    documents_url TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create faculty_evaluations table
CREATE TABLE IF NOT EXISTS public.faculty_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE NOT NULL,
    evaluation_type TEXT NOT NULL, -- Annual, Student Feedback, Peer Review
    academic_year TEXT NOT NULL,
    semester INTEGER,
    overall_rating NUMERIC(3,2),
    teaching_rating NUMERIC(3,2),
    research_rating NUMERIC(3,2),
    service_rating NUMERIC(3,2),
    student_feedback_score NUMERIC(3,2),
    peer_review_score NUMERIC(3,2),
    self_assessment_score NUMERIC(3,2),
    strengths TEXT,
    areas_for_improvement TEXT,
    goals_next_year TEXT,
    evaluated_by UUID REFERENCES public.profiles(id),
    evaluation_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Draft', -- Draft, Submitted, Reviewed, Finalized
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create faculty_development table
CREATE TABLE IF NOT EXISTS public.faculty_development (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE NOT NULL,
    program_type TEXT NOT NULL, -- Workshop, Conference, Training, Certification
    program_name TEXT NOT NULL,
    organizing_body TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    duration_hours INTEGER,
    location TEXT,
    certificate_received BOOLEAN DEFAULT false,
    certificate_url TEXT,
    skills_gained TEXT[],
    cost NUMERIC(10,2),
    funding_source TEXT,
    feedback_rating NUMERIC(3,2),
    feedback_comments TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.faculty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_development ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for faculty_profiles
CREATE POLICY "Faculty can view their own profile" ON public.faculty_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all faculty profiles" ON public.faculty_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman')
        )
    );

CREATE POLICY "HODs can view department faculty profiles" ON public.faculty_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p1
            JOIN public.profiles p2 ON p2.id = faculty_profiles.user_id
            WHERE p1.id = auth.uid() AND p1.role = 'hod' 
            AND p1.department_id = p2.department_id
        )
    );

CREATE POLICY "Admins can manage faculty profiles" ON public.faculty_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman')
        )
    );

-- Create similar policies for other tables (simplified for brevity)
CREATE POLICY "Faculty and admins can view qualifications" ON public.faculty_qualifications
    FOR SELECT USING (
        faculty_id IN (
            SELECT id FROM public.faculty_profiles 
            WHERE user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman', 'hod')
        )
    );

CREATE POLICY "Faculty and admins can manage qualifications" ON public.faculty_qualifications
    FOR ALL USING (
        faculty_id IN (
            SELECT id FROM public.faculty_profiles 
            WHERE user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman')
        )
    );

-- Apply similar patterns for all other tables
CREATE POLICY "Faculty and admins can view experience" ON public.faculty_experience
    FOR SELECT USING (
        faculty_id IN (SELECT id FROM public.faculty_profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman', 'hod'))
    );

CREATE POLICY "Faculty and admins can manage experience" ON public.faculty_experience
    FOR ALL USING (
        faculty_id IN (SELECT id FROM public.faculty_profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman'))
    );

-- Add policies for other tables following the same pattern
CREATE POLICY "Faculty and admins can view specializations" ON public.faculty_specializations
    FOR SELECT USING (
        faculty_id IN (SELECT id FROM public.faculty_profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman', 'hod'))
    );

CREATE POLICY "Faculty and admins can manage specializations" ON public.faculty_specializations
    FOR ALL USING (
        faculty_id IN (SELECT id FROM public.faculty_profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman'))
    );

CREATE POLICY "Faculty and admins can view courses" ON public.faculty_courses
    FOR SELECT USING (
        faculty_id IN (SELECT id FROM public.faculty_profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman', 'hod'))
    );

CREATE POLICY "Admins can manage course assignments" ON public.faculty_courses
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman', 'hod'))
    );

CREATE POLICY "Faculty and admins can view research" ON public.faculty_research
    FOR SELECT USING (
        faculty_id IN (SELECT id FROM public.faculty_profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman', 'hod'))
    );

CREATE POLICY "Faculty and admins can manage research" ON public.faculty_research
    FOR ALL USING (
        faculty_id IN (SELECT id FROM public.faculty_profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman'))
    );

CREATE POLICY "Faculty can manage their leaves" ON public.faculty_leaves
    FOR ALL USING (
        faculty_id IN (SELECT id FROM public.faculty_profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman', 'hod'))
    );

CREATE POLICY "Faculty and admins can view evaluations" ON public.faculty_evaluations
    FOR SELECT USING (
        faculty_id IN (SELECT id FROM public.faculty_profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman', 'hod'))
    );

CREATE POLICY "Admins can manage evaluations" ON public.faculty_evaluations
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman', 'hod'))
    );

CREATE POLICY "Faculty and admins can view development" ON public.faculty_development
    FOR SELECT USING (
        faculty_id IN (SELECT id FROM public.faculty_profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman', 'hod'))
    );

CREATE POLICY "Faculty and admins can manage development" ON public.faculty_development
    FOR ALL USING (
        faculty_id IN (SELECT id FROM public.faculty_profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman'))
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faculty_profiles_user_id ON public.faculty_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_faculty_profiles_employee_code ON public.faculty_profiles(employee_code);
CREATE INDEX IF NOT EXISTS idx_faculty_qualifications_faculty_id ON public.faculty_qualifications(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_experience_faculty_id ON public.faculty_experience(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_courses_faculty_id ON public.faculty_courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_courses_academic_year ON public.faculty_courses(academic_year, semester);
CREATE INDEX IF NOT EXISTS idx_faculty_leaves_faculty_id ON public.faculty_leaves(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_leaves_status ON public.faculty_leaves(status);

-- Create functions for faculty management
CREATE OR REPLACE FUNCTION public.get_faculty_with_details(p_user_id UUID)
RETURNS TABLE(
    faculty_id UUID,
    user_id UUID,
    name TEXT,
    email TEXT,
    employee_code TEXT,
    designation TEXT,
    department_name TEXT,
    joining_date DATE,
    phone TEXT,
    is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Check if user has permission
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = p_user_id AND role IN ('admin', 'principal', 'chairman', 'hod')
    ) THEN
        RAISE EXCEPTION 'Access denied: insufficient privileges';
    END IF;

    RETURN QUERY
    SELECT 
        fp.id as faculty_id,
        fp.user_id,
        p.name,
        p.email,
        fp.employee_code,
        fp.designation,
        d.name as department_name,
        fp.joining_date,
        p.phone,
        fp.is_active
    FROM public.faculty_profiles fp
    JOIN public.profiles p ON fp.user_id = p.id
    LEFT JOIN public.departments d ON p.department_id = d.id
    WHERE fp.is_active = true
    ORDER BY fp.employee_code;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_faculty_with_details(UUID) TO authenticated;
