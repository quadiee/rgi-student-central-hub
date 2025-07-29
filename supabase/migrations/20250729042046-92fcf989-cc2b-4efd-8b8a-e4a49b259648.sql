
-- Create faculty attendance tables

-- Faculty timetable to track class schedules
CREATE TABLE public.faculty_timetable (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id UUID NOT NULL REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  period_number INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject_name TEXT NOT NULL,
  class_section TEXT NOT NULL,
  room_number TEXT,
  semester INTEGER NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2024-25',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Faculty attendance sessions (individual class periods)
CREATE TABLE public.faculty_attendance_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id UUID NOT NULL REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
  timetable_id UUID REFERENCES public.faculty_timetable(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  period_number INTEGER NOT NULL,
  subject_name TEXT NOT NULL,
  class_section TEXT NOT NULL,
  scheduled_start_time TIME NOT NULL,
  scheduled_end_time TIME NOT NULL,
  actual_start_time TIME,
  actual_end_time TIME,
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Present', 'Absent', 'Late', 'Left Early')),
  marked_by UUID REFERENCES auth.users(id),
  marking_method TEXT DEFAULT 'Manual' CHECK (marking_method IN ('Manual', 'Facial Recognition', 'Excel Import')),
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Daily faculty attendance summary
CREATE TABLE public.faculty_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id UUID NOT NULL REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  total_periods INTEGER NOT NULL DEFAULT 0,
  present_periods INTEGER NOT NULL DEFAULT 0,
  absent_periods INTEGER NOT NULL DEFAULT 0,
  late_periods INTEGER NOT NULL DEFAULT 0,
  overall_status TEXT DEFAULT 'Present' CHECK (overall_status IN ('Present', 'Absent', 'Partial', 'On Leave')),
  first_punch_time TIME,
  last_punch_time TIME,
  total_working_hours INTERVAL,
  leave_id UUID REFERENCES public.faculty_leaves(id),
  marked_by UUID REFERENCES auth.users(id),
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(faculty_id, attendance_date)
);

-- Facial recognition logs integration
CREATE TABLE public.faculty_facial_recognition_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id UUID NOT NULL REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  recognition_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  confidence_score DECIMAL(5,4),
  photo_url TEXT,
  location TEXT,
  recognition_type TEXT DEFAULT 'Entry' CHECK (recognition_type IN ('Entry', 'Exit')),
  session_id UUID REFERENCES public.faculty_attendance_sessions(id),
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Attendance imports for Excel integration
CREATE TABLE public.faculty_attendance_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_url TEXT,
  upload_date DATE NOT NULL,
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Processing' CHECK (status IN ('Processing', 'Completed', 'Failed', 'Partial')),
  error_log JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Attendance corrections/adjustments
CREATE TABLE public.faculty_attendance_corrections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attendance_session_id UUID NOT NULL REFERENCES public.faculty_attendance_sessions(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  original_status TEXT NOT NULL,
  requested_status TEXT NOT NULL,
  reason TEXT NOT NULL,
  supporting_documents TEXT[],
  request_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approval_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  admin_remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_faculty_timetable_faculty_day ON public.faculty_timetable(faculty_id, day_of_week);
CREATE INDEX idx_faculty_attendance_sessions_faculty_date ON public.faculty_attendance_sessions(faculty_id, session_date);
CREATE INDEX idx_faculty_attendance_faculty_date ON public.faculty_attendance(faculty_id, attendance_date);
CREATE INDEX idx_facial_recognition_logs_faculty_timestamp ON public.faculty_facial_recognition_logs(faculty_id, recognition_timestamp);
CREATE INDEX idx_facial_recognition_logs_device ON public.faculty_facial_recognition_logs(device_id, recognition_timestamp);

-- Enable RLS on all tables
ALTER TABLE public.faculty_timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_facial_recognition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_attendance_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_attendance_corrections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for faculty_timetable
CREATE POLICY "Faculty can view their own timetable" 
  ON public.faculty_timetable FOR SELECT 
  USING (faculty_id IN (SELECT id FROM public.faculty_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all timetables" 
  ON public.faculty_timetable FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman', 'hod')));

-- RLS Policies for faculty_attendance_sessions
CREATE POLICY "Faculty can view their own attendance sessions" 
  ON public.faculty_attendance_sessions FOR SELECT 
  USING (faculty_id IN (SELECT id FROM public.faculty_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage attendance sessions" 
  ON public.faculty_attendance_sessions FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman', 'hod')));

-- RLS Policies for faculty_attendance
CREATE POLICY "Faculty can view their own attendance" 
  ON public.faculty_attendance FOR SELECT 
  USING (faculty_id IN (SELECT id FROM public.faculty_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage faculty attendance" 
  ON public.faculty_attendance FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman', 'hod')));

-- RLS Policies for facial_recognition_logs
CREATE POLICY "Faculty can view their own recognition logs" 
  ON public.faculty_facial_recognition_logs FOR SELECT 
  USING (faculty_id IN (SELECT id FROM public.faculty_profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can insert recognition logs" 
  ON public.faculty_facial_recognition_logs FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can manage recognition logs" 
  ON public.faculty_facial_recognition_logs FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman')));

-- RLS Policies for attendance_imports
CREATE POLICY "Admins can manage attendance imports" 
  ON public.faculty_attendance_imports FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman', 'hod')));

-- RLS Policies for attendance_corrections
CREATE POLICY "Faculty can request corrections for their attendance" 
  ON public.faculty_attendance_corrections FOR INSERT 
  WITH CHECK (attendance_session_id IN (
    SELECT id FROM public.faculty_attendance_sessions 
    WHERE faculty_id IN (SELECT id FROM public.faculty_profiles WHERE user_id = auth.uid())
  ));

CREATE POLICY "Faculty can view their correction requests" 
  ON public.faculty_attendance_corrections FOR SELECT 
  USING (requested_by = auth.uid() OR attendance_session_id IN (
    SELECT id FROM public.faculty_attendance_sessions 
    WHERE faculty_id IN (SELECT id FROM public.faculty_profiles WHERE user_id = auth.uid())
  ));

CREATE POLICY "Admins can manage correction requests" 
  ON public.faculty_attendance_corrections FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'principal', 'chairman', 'hod')));

-- Create database functions for attendance processing
CREATE OR REPLACE FUNCTION public.process_facial_recognition_attendance()
RETURNS TRIGGER AS $$
DECLARE
  faculty_session_record RECORD;
BEGIN
  -- Find matching timetable session for the recognition timestamp
  SELECT fas.* INTO faculty_session_record
  FROM public.faculty_attendance_sessions fas
  WHERE fas.faculty_id = NEW.faculty_id
    AND fas.session_date = NEW.recognition_timestamp::date
    AND NEW.recognition_timestamp::time BETWEEN 
        (fas.scheduled_start_time - INTERVAL '15 minutes') AND 
        (fas.scheduled_end_time + INTERVAL '15 minutes')
  LIMIT 1;

  IF faculty_session_record.id IS NOT NULL THEN
    -- Update the attendance session based on recognition type
    IF NEW.recognition_type = 'Entry' THEN
      UPDATE public.faculty_attendance_sessions
      SET actual_start_time = NEW.recognition_timestamp::time,
          status = CASE 
            WHEN NEW.recognition_timestamp::time <= scheduled_start_time THEN 'Present'
            ELSE 'Late'
          END,
          marking_method = 'Facial Recognition',
          updated_at = now()
      WHERE id = faculty_session_record.id;
    ELSIF NEW.recognition_type = 'Exit' THEN
      UPDATE public.faculty_attendance_sessions
      SET actual_end_time = NEW.recognition_timestamp::time,
          updated_at = now()
      WHERE id = faculty_session_record.id;
    END IF;

    -- Link the recognition log to the session
    UPDATE public.faculty_facial_recognition_logs
    SET session_id = faculty_session_record.id, processed = true
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic attendance processing from facial recognition
CREATE TRIGGER process_facial_recognition_trigger
  AFTER INSERT ON public.faculty_facial_recognition_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.process_facial_recognition_attendance();

-- Function to update daily attendance summary
CREATE OR REPLACE FUNCTION public.update_daily_faculty_attendance(p_faculty_id UUID, p_date DATE)
RETURNS VOID AS $$
DECLARE
  session_stats RECORD;
  first_punch TIME;
  last_punch TIME;
  leave_record RECORD;
BEGIN
  -- Get session statistics for the day
  SELECT 
    COUNT(*) as total_periods,
    COUNT(CASE WHEN status = 'Present' THEN 1 END) as present_periods,
    COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent_periods,
    COUNT(CASE WHEN status = 'Late' THEN 1 END) as late_periods,
    MIN(actual_start_time) as first_punch_time,
    MAX(actual_end_time) as last_punch_time
  INTO session_stats
  FROM public.faculty_attendance_sessions
  WHERE faculty_id = p_faculty_id AND session_date = p_date;

  -- Check for approved leave
  SELECT * INTO leave_record
  FROM public.faculty_leaves
  WHERE faculty_id = p_faculty_id 
    AND p_date BETWEEN from_date AND to_date
    AND status = 'Approved';

  -- Insert or update daily attendance summary
  INSERT INTO public.faculty_attendance (
    faculty_id,
    attendance_date,
    total_periods,
    present_periods,
    absent_periods,
    late_periods,
    overall_status,
    first_punch_time,
    last_punch_time,
    total_working_hours,
    leave_id
  ) VALUES (
    p_faculty_id,
    p_date,
    session_stats.total_periods,
    session_stats.present_periods,
    session_stats.absent_periods,
    session_stats.late_periods,
    CASE 
      WHEN leave_record.id IS NOT NULL THEN 'On Leave'
      WHEN session_stats.present_periods = session_stats.total_periods THEN 'Present'
      WHEN session_stats.present_periods = 0 THEN 'Absent'
      ELSE 'Partial'
    END,
    session_stats.first_punch_time,
    session_stats.last_punch_time,
    CASE 
      WHEN session_stats.first_punch_time IS NOT NULL AND session_stats.last_punch_time IS NOT NULL 
      THEN session_stats.last_punch_time - session_stats.first_punch_time
      ELSE NULL
    END,
    leave_record.id
  )
  ON CONFLICT (faculty_id, attendance_date) 
  DO UPDATE SET
    total_periods = EXCLUDED.total_periods,
    present_periods = EXCLUDED.present_periods,
    absent_periods = EXCLUDED.absent_periods,
    late_periods = EXCLUDED.late_periods,
    overall_status = EXCLUDED.overall_status,
    first_punch_time = EXCLUDED.first_punch_time,
    last_punch_time = EXCLUDED.last_punch_time,
    total_working_hours = EXCLUDED.total_working_hours,
    leave_id = EXCLUDED.leave_id,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update daily attendance when session attendance changes
CREATE OR REPLACE FUNCTION public.trigger_daily_attendance_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update daily attendance for the affected date
  PERFORM public.update_daily_faculty_attendance(
    COALESCE(NEW.faculty_id, OLD.faculty_id),
    COALESCE(NEW.session_date, OLD.session_date)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_daily_attendance_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.faculty_attendance_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_daily_attendance_update();
