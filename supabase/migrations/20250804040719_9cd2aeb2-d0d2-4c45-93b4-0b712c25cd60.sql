
-- Create student attendance tables
CREATE TABLE public.student_timetable (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
  period_number INTEGER NOT NULL,
  start_time TIME WITHOUT TIME ZONE NOT NULL,
  end_time TIME WITHOUT TIME ZONE NOT NULL,
  subject_name TEXT NOT NULL,
  faculty_id UUID REFERENCES public.faculty_profiles(id),
  class_section TEXT NOT NULL,
  room_number TEXT,
  semester INTEGER NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2024-25',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create student attendance sessions table (period-wise tracking)
CREATE TABLE public.student_attendance_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) NOT NULL,
  timetable_id UUID REFERENCES public.student_timetable(id),
  session_date DATE NOT NULL,
  period_number INTEGER NOT NULL,
  subject_name TEXT NOT NULL,
  faculty_id UUID REFERENCES public.faculty_profiles(id),
  class_section TEXT NOT NULL,
  scheduled_start_time TIME WITHOUT TIME ZONE NOT NULL,
  scheduled_end_time TIME WITHOUT TIME ZONE NOT NULL,
  actual_start_time TIME WITHOUT TIME ZONE,
  actual_end_time TIME WITHOUT TIME ZONE,
  status TEXT NOT NULL DEFAULT 'Scheduled', -- 'Present', 'Absent', 'Late', 'Excused'
  marking_method TEXT DEFAULT 'Manual', -- 'Manual', 'Biometric', 'Excel Import'
  marked_by UUID REFERENCES public.profiles(id),
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create student daily attendance summary table
CREATE TABLE public.student_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) NOT NULL,
  attendance_date DATE NOT NULL,
  total_periods INTEGER NOT NULL DEFAULT 0,
  present_periods INTEGER NOT NULL DEFAULT 0,
  absent_periods INTEGER NOT NULL DEFAULT 0,
  late_periods INTEGER NOT NULL DEFAULT 0,
  excused_periods INTEGER NOT NULL DEFAULT 0,
  overall_status TEXT DEFAULT 'Present', -- 'Present', 'Absent', 'Partial', 'On Leave'
  attendance_percentage NUMERIC(5,2),
  leave_id UUID, -- Reference to student leaves if implemented
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, attendance_date)
);

-- Create student attendance corrections table
CREATE TABLE public.student_attendance_corrections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attendance_session_id UUID REFERENCES public.student_attendance_sessions(id) NOT NULL,
  student_id UUID REFERENCES public.profiles(id) NOT NULL,
  requested_by UUID REFERENCES public.profiles(id) NOT NULL,
  approved_by UUID REFERENCES public.profiles(id),
  request_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approval_date TIMESTAMP WITH TIME ZONE,
  original_status TEXT NOT NULL,
  requested_status TEXT NOT NULL,
  reason TEXT NOT NULL,
  supporting_documents TEXT[],
  status TEXT DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
  admin_remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for all tables
ALTER TABLE public.student_timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance_corrections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_timetable
CREATE POLICY "Students can view their own timetable" ON public.student_timetable
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Admins can manage all timetables" ON public.student_timetable
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman', 'hod', 'faculty')
    )
  );

-- RLS Policies for student_attendance_sessions  
CREATE POLICY "Students can view their own attendance sessions" ON public.student_attendance_sessions
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Admins can manage attendance sessions" ON public.student_attendance_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman', 'hod', 'faculty')
    )
  );

-- RLS Policies for student_attendance
CREATE POLICY "Students can view their own attendance" ON public.student_attendance
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Admins can manage student attendance" ON public.student_attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman', 'hod', 'faculty')
    )
  );

-- RLS Policies for student_attendance_corrections
CREATE POLICY "Students can request corrections for their attendance" ON public.student_attendance_corrections
  FOR INSERT WITH CHECK (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman', 'hod', 'faculty')
    )
  );

CREATE POLICY "Students can view their correction requests" ON public.student_attendance_corrections
  FOR SELECT USING (
    student_id = auth.uid() OR
    requested_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman', 'hod', 'faculty')
    )
  );

CREATE POLICY "Admins can manage correction requests" ON public.student_attendance_corrections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman', 'hod', 'faculty')
    )
  );

-- Database Functions for Student Attendance

-- Function to update daily student attendance summary
CREATE OR REPLACE FUNCTION public.update_daily_student_attendance(p_student_id uuid, p_date date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_stats RECORD;
BEGIN
  -- Get session statistics for the day
  SELECT 
    COUNT(*) as total_periods,
    COUNT(CASE WHEN status = 'Present' THEN 1 END) as present_periods,
    COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent_periods,
    COUNT(CASE WHEN status = 'Late' THEN 1 END) as late_periods,
    COUNT(CASE WHEN status = 'Excused' THEN 1 END) as excused_periods
  INTO session_stats
  FROM public.student_attendance_sessions
  WHERE student_id = p_student_id AND session_date = p_date;

  -- Insert or update daily attendance summary
  INSERT INTO public.student_attendance (
    student_id,
    attendance_date,
    total_periods,
    present_periods,
    absent_periods,
    late_periods,
    excused_periods,
    overall_status,
    attendance_percentage
  ) VALUES (
    p_student_id,
    p_date,
    session_stats.total_periods,
    session_stats.present_periods,
    session_stats.absent_periods,
    session_stats.late_periods,
    session_stats.excused_periods,
    CASE 
      WHEN session_stats.present_periods + session_stats.late_periods + session_stats.excused_periods = session_stats.total_periods THEN 'Present'
      WHEN session_stats.present_periods + session_stats.late_periods + session_stats.excused_periods = 0 THEN 'Absent'
      ELSE 'Partial'
    END,
    CASE 
      WHEN session_stats.total_periods > 0 
      THEN ROUND(((session_stats.present_periods + session_stats.late_periods + session_stats.excused_periods)::numeric / session_stats.total_periods::numeric) * 100, 2)
      ELSE 0
    END
  )
  ON CONFLICT (student_id, attendance_date) 
  DO UPDATE SET
    total_periods = EXCLUDED.total_periods,
    present_periods = EXCLUDED.present_periods,
    absent_periods = EXCLUDED.absent_periods,
    late_periods = EXCLUDED.late_periods,
    excused_periods = EXCLUDED.excused_periods,
    overall_status = EXCLUDED.overall_status,
    attendance_percentage = EXCLUDED.attendance_percentage,
    updated_at = now();
END;
$$;

-- Function to get student attendance with details
CREATE OR REPLACE FUNCTION public.get_student_with_attendance_details(p_user_id uuid)
RETURNS TABLE(
  student_id uuid,
  user_id uuid,
  name text,
  email text,
  roll_number text,
  department_name text,
  year integer,
  semester integer,
  total_attendance_days bigint,
  present_days bigint,
  absent_days bigint,
  attendance_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as student_id,
    p.id as user_id,
    COALESCE(p.name, 'N/A') as name,
    COALESCE(p.email, 'N/A') as email,
    COALESCE(p.roll_number, 'N/A') as roll_number,
    COALESCE(d.name, 'Unknown Department') as department_name,
    COALESCE(p.year, 0) as year,
    COALESCE(p.semester, 0) as semester,
    COALESCE(COUNT(sa.id), 0) as total_attendance_days,
    COALESCE(COUNT(CASE WHEN sa.overall_status IN ('Present', 'Partial') THEN 1 END), 0) as present_days,
    COALESCE(COUNT(CASE WHEN sa.overall_status = 'Absent' THEN 1 END), 0) as absent_days,
    COALESCE(
      CASE 
        WHEN COUNT(sa.id) > 0 
        THEN ROUND(
          (COUNT(CASE WHEN sa.overall_status IN ('Present', 'Partial') THEN 1 END)::numeric / COUNT(sa.id)::numeric) * 100, 
          2
        )
        ELSE 0 
      END, 0
    ) as attendance_percentage
  FROM public.profiles p
  LEFT JOIN public.departments d ON p.department_id = d.id
  LEFT JOIN public.student_attendance sa ON p.id = sa.student_id
  WHERE p.role = 'student'
    AND p.is_active = true
    AND (
      -- Allow if user is admin/principal/chairman
      EXISTS (
        SELECT 1 FROM public.profiles auth_user 
        WHERE auth_user.id = p_user_id 
        AND auth_user.role IN ('admin', 'principal', 'chairman')
      )
      OR
      -- Allow if user is HOD of same department
      EXISTS (
        SELECT 1 FROM public.profiles auth_user 
        WHERE auth_user.id = p_user_id 
        AND auth_user.role = 'hod'
        AND auth_user.department_id = p.department_id
      )
      OR
      -- Allow if it's the student's own data
      p.id = p_user_id
    )
  GROUP BY p.id, p.name, p.email, p.roll_number, d.name, p.year, p.semester
  ORDER BY p.roll_number;
END;
$$;

-- Trigger to update daily attendance when sessions change
CREATE OR REPLACE FUNCTION public.trigger_student_daily_attendance_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update daily attendance for the affected date
  PERFORM public.update_daily_student_attendance(
    COALESCE(NEW.student_id, OLD.student_id),
    COALESCE(NEW.session_date, OLD.session_date)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for student attendance sessions
CREATE TRIGGER student_attendance_sessions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.student_attendance_sessions
  FOR EACH ROW EXECUTE FUNCTION public.trigger_student_daily_attendance_update();

-- Create indexes for performance
CREATE INDEX idx_student_timetable_student_id ON public.student_timetable(student_id);
CREATE INDEX idx_student_timetable_day_period ON public.student_timetable(day_of_week, period_number);
CREATE INDEX idx_student_attendance_sessions_student_date ON public.student_attendance_sessions(student_id, session_date);
CREATE INDEX idx_student_attendance_student_date ON public.student_attendance(student_id, attendance_date);
CREATE INDEX idx_student_attendance_corrections_student ON public.student_attendance_corrections(student_id);
