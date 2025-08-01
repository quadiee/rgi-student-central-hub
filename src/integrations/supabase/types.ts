export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_sessions: {
        Row: {
          admin_user_id: string
          created_at: string | null
          id: string
          impersonated_role: string | null
          impersonated_user_id: string | null
          is_active: boolean | null
          session_start: string | null
        }
        Insert: {
          admin_user_id: string
          created_at?: string | null
          id?: string
          impersonated_role?: string | null
          impersonated_user_id?: string | null
          is_active?: boolean | null
          session_start?: string | null
        }
        Update: {
          admin_user_id?: string
          created_at?: string | null
          id?: string
          impersonated_role?: string | null
          impersonated_user_id?: string | null
          is_active?: boolean | null
          session_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_sessions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "admin_sessions_impersonated_user_id_fkey"
            columns: ["impersonated_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_sessions_impersonated_user_id_fkey"
            columns: ["impersonated_user_id"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["student_id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          hod_id: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          hod_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          hod_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_hod_id_fkey"
            columns: ["hod_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_hod_id_fkey"
            columns: ["hod_id"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["student_id"]
          },
        ]
      }
      faculty_attendance: {
        Row: {
          absent_periods: number
          attendance_date: string
          created_at: string | null
          faculty_id: string
          first_punch_time: string | null
          id: string
          last_punch_time: string | null
          late_periods: number
          leave_id: string | null
          marked_by: string | null
          overall_status: string | null
          present_periods: number
          remarks: string | null
          total_periods: number
          total_working_hours: unknown | null
          updated_at: string | null
        }
        Insert: {
          absent_periods?: number
          attendance_date: string
          created_at?: string | null
          faculty_id: string
          first_punch_time?: string | null
          id?: string
          last_punch_time?: string | null
          late_periods?: number
          leave_id?: string | null
          marked_by?: string | null
          overall_status?: string | null
          present_periods?: number
          remarks?: string | null
          total_periods?: number
          total_working_hours?: unknown | null
          updated_at?: string | null
        }
        Update: {
          absent_periods?: number
          attendance_date?: string
          created_at?: string | null
          faculty_id?: string
          first_punch_time?: string | null
          id?: string
          last_punch_time?: string | null
          late_periods?: number
          leave_id?: string | null
          marked_by?: string | null
          overall_status?: string | null
          present_periods?: number
          remarks?: string | null
          total_periods?: number
          total_working_hours?: unknown | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_attendance_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_attendance_leave_id_fkey"
            columns: ["leave_id"]
            isOneToOne: false
            referencedRelation: "faculty_leaves"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_attendance_corrections: {
        Row: {
          admin_remarks: string | null
          approval_date: string | null
          approved_by: string | null
          attendance_session_id: string
          created_at: string | null
          id: string
          original_status: string
          reason: string
          request_date: string | null
          requested_by: string
          requested_status: string
          status: string | null
          supporting_documents: string[] | null
        }
        Insert: {
          admin_remarks?: string | null
          approval_date?: string | null
          approved_by?: string | null
          attendance_session_id: string
          created_at?: string | null
          id?: string
          original_status: string
          reason: string
          request_date?: string | null
          requested_by: string
          requested_status: string
          status?: string | null
          supporting_documents?: string[] | null
        }
        Update: {
          admin_remarks?: string | null
          approval_date?: string | null
          approved_by?: string | null
          attendance_session_id?: string
          created_at?: string | null
          id?: string
          original_status?: string
          reason?: string
          request_date?: string | null
          requested_by?: string
          requested_status?: string
          status?: string | null
          supporting_documents?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_attendance_corrections_attendance_session_id_fkey"
            columns: ["attendance_session_id"]
            isOneToOne: false
            referencedRelation: "faculty_attendance_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_attendance_imports: {
        Row: {
          created_at: string | null
          error_log: Json | null
          failed_records: number | null
          file_name: string
          file_url: string | null
          id: string
          processed_records: number | null
          status: string | null
          total_records: number | null
          upload_date: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          error_log?: Json | null
          failed_records?: number | null
          file_name: string
          file_url?: string | null
          id?: string
          processed_records?: number | null
          status?: string | null
          total_records?: number | null
          upload_date: string
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          error_log?: Json | null
          failed_records?: number | null
          file_name?: string
          file_url?: string | null
          id?: string
          processed_records?: number | null
          status?: string | null
          total_records?: number | null
          upload_date?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      faculty_attendance_sessions: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          class_section: string
          created_at: string | null
          faculty_id: string
          id: string
          marked_by: string | null
          marking_method: string | null
          period_number: number
          remarks: string | null
          scheduled_end_time: string
          scheduled_start_time: string
          session_date: string
          status: string
          subject_name: string
          timetable_id: string | null
          updated_at: string | null
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          class_section: string
          created_at?: string | null
          faculty_id: string
          id?: string
          marked_by?: string | null
          marking_method?: string | null
          period_number: number
          remarks?: string | null
          scheduled_end_time: string
          scheduled_start_time: string
          session_date: string
          status?: string
          subject_name: string
          timetable_id?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          class_section?: string
          created_at?: string | null
          faculty_id?: string
          id?: string
          marked_by?: string | null
          marking_method?: string | null
          period_number?: number
          remarks?: string | null
          scheduled_end_time?: string
          scheduled_start_time?: string
          session_date?: string
          status?: string
          subject_name?: string
          timetable_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_attendance_sessions_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_attendance_sessions_timetable_id_fkey"
            columns: ["timetable_id"]
            isOneToOne: false
            referencedRelation: "faculty_timetable"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_courses: {
        Row: {
          academic_year: string
          assigned_by: string | null
          assigned_date: string | null
          course_code: string
          course_name: string
          course_type: string
          created_at: string | null
          credits: number | null
          department_id: string | null
          faculty_id: string
          hours_per_week: number | null
          id: string
          is_active: boolean | null
          semester: number
          student_count: number | null
        }
        Insert: {
          academic_year: string
          assigned_by?: string | null
          assigned_date?: string | null
          course_code: string
          course_name: string
          course_type: string
          created_at?: string | null
          credits?: number | null
          department_id?: string | null
          faculty_id: string
          hours_per_week?: number | null
          id?: string
          is_active?: boolean | null
          semester: number
          student_count?: number | null
        }
        Update: {
          academic_year?: string
          assigned_by?: string | null
          assigned_date?: string | null
          course_code?: string
          course_name?: string
          course_type?: string
          created_at?: string | null
          credits?: number | null
          department_id?: string | null
          faculty_id?: string
          hours_per_week?: number | null
          id?: string
          is_active?: boolean | null
          semester?: number
          student_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_courses_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_courses_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "faculty_courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "department_fee_analytics"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "faculty_courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "hod_department_summary"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "faculty_courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "scholarship_summary"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "faculty_courses_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_development: {
        Row: {
          certificate_received: boolean | null
          certificate_url: string | null
          cost: number | null
          created_at: string | null
          duration_hours: number | null
          end_date: string | null
          faculty_id: string
          feedback_comments: string | null
          feedback_rating: number | null
          funding_source: string | null
          id: string
          location: string | null
          organizing_body: string | null
          program_name: string
          program_type: string
          skills_gained: string[] | null
          start_date: string
        }
        Insert: {
          certificate_received?: boolean | null
          certificate_url?: string | null
          cost?: number | null
          created_at?: string | null
          duration_hours?: number | null
          end_date?: string | null
          faculty_id: string
          feedback_comments?: string | null
          feedback_rating?: number | null
          funding_source?: string | null
          id?: string
          location?: string | null
          organizing_body?: string | null
          program_name: string
          program_type: string
          skills_gained?: string[] | null
          start_date: string
        }
        Update: {
          certificate_received?: boolean | null
          certificate_url?: string | null
          cost?: number | null
          created_at?: string | null
          duration_hours?: number | null
          end_date?: string | null
          faculty_id?: string
          feedback_comments?: string | null
          feedback_rating?: number | null
          funding_source?: string | null
          id?: string
          location?: string | null
          organizing_body?: string | null
          program_name?: string
          program_type?: string
          skills_gained?: string[] | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "faculty_development_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_evaluations: {
        Row: {
          academic_year: string
          areas_for_improvement: string | null
          created_at: string | null
          evaluated_by: string | null
          evaluation_date: string | null
          evaluation_type: string
          faculty_id: string
          goals_next_year: string | null
          id: string
          overall_rating: number | null
          peer_review_score: number | null
          research_rating: number | null
          self_assessment_score: number | null
          semester: number | null
          service_rating: number | null
          status: string | null
          strengths: string | null
          student_feedback_score: number | null
          teaching_rating: number | null
        }
        Insert: {
          academic_year: string
          areas_for_improvement?: string | null
          created_at?: string | null
          evaluated_by?: string | null
          evaluation_date?: string | null
          evaluation_type: string
          faculty_id: string
          goals_next_year?: string | null
          id?: string
          overall_rating?: number | null
          peer_review_score?: number | null
          research_rating?: number | null
          self_assessment_score?: number | null
          semester?: number | null
          service_rating?: number | null
          status?: string | null
          strengths?: string | null
          student_feedback_score?: number | null
          teaching_rating?: number | null
        }
        Update: {
          academic_year?: string
          areas_for_improvement?: string | null
          created_at?: string | null
          evaluated_by?: string | null
          evaluation_date?: string | null
          evaluation_type?: string
          faculty_id?: string
          goals_next_year?: string | null
          id?: string
          overall_rating?: number | null
          peer_review_score?: number | null
          research_rating?: number | null
          self_assessment_score?: number | null
          semester?: number | null
          service_rating?: number | null
          status?: string | null
          strengths?: string | null
          student_feedback_score?: number | null
          teaching_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_evaluations_evaluated_by_fkey"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_evaluations_evaluated_by_fkey"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "faculty_evaluations_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_experience: {
        Row: {
          achievements: string | null
          created_at: string | null
          designation: string
          experience_type: string
          faculty_id: string
          from_date: string
          id: string
          is_current: boolean | null
          organization_name: string
          responsibilities: string | null
          salary: number | null
          to_date: string | null
        }
        Insert: {
          achievements?: string | null
          created_at?: string | null
          designation: string
          experience_type: string
          faculty_id: string
          from_date: string
          id?: string
          is_current?: boolean | null
          organization_name: string
          responsibilities?: string | null
          salary?: number | null
          to_date?: string | null
        }
        Update: {
          achievements?: string | null
          created_at?: string | null
          designation?: string
          experience_type?: string
          faculty_id?: string
          from_date?: string
          id?: string
          is_current?: boolean | null
          organization_name?: string
          responsibilities?: string | null
          salary?: number | null
          to_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_experience_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_facial_recognition_logs: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          device_id: string
          faculty_id: string
          id: string
          location: string | null
          photo_url: string | null
          processed: boolean | null
          recognition_timestamp: string
          recognition_type: string | null
          session_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          device_id: string
          faculty_id: string
          id?: string
          location?: string | null
          photo_url?: string | null
          processed?: boolean | null
          recognition_timestamp: string
          recognition_type?: string | null
          session_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          device_id?: string
          faculty_id?: string
          id?: string
          location?: string | null
          photo_url?: string | null
          processed?: boolean | null
          recognition_timestamp?: string
          recognition_type?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_facial_recognition_logs_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_facial_recognition_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "faculty_attendance_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_leaves: {
        Row: {
          applied_date: string | null
          approval_date: string | null
          approval_remarks: string | null
          approved_by: string | null
          created_at: string | null
          documents_url: string[] | null
          faculty_id: string
          from_date: string
          id: string
          leave_type: string
          reason: string
          status: string | null
          substitute_faculty_id: string | null
          to_date: string
          total_days: number
        }
        Insert: {
          applied_date?: string | null
          approval_date?: string | null
          approval_remarks?: string | null
          approved_by?: string | null
          created_at?: string | null
          documents_url?: string[] | null
          faculty_id: string
          from_date: string
          id?: string
          leave_type: string
          reason: string
          status?: string | null
          substitute_faculty_id?: string | null
          to_date: string
          total_days: number
        }
        Update: {
          applied_date?: string | null
          approval_date?: string | null
          approval_remarks?: string | null
          approved_by?: string | null
          created_at?: string | null
          documents_url?: string[] | null
          faculty_id?: string
          from_date?: string
          id?: string
          leave_type?: string
          reason?: string
          status?: string | null
          substitute_faculty_id?: string | null
          to_date?: string
          total_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "faculty_leaves_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_leaves_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "faculty_leaves_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_leaves_substitute_faculty_id_fkey"
            columns: ["substitute_faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_profiles: {
        Row: {
          aadhar_number: string | null
          bank_account_number: string | null
          bank_branch: string | null
          bank_name: string | null
          blood_group: string | null
          children_count: number | null
          confirmation_date: string | null
          created_at: string | null
          created_by: string | null
          current_address: string | null
          designation: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          employee_code: string
          id: string
          ifsc_code: string | null
          is_active: boolean | null
          joining_date: string
          marital_status: string | null
          medical_conditions: string | null
          pan_number: string | null
          permanent_address: string | null
          pf_number: string | null
          retirement_date: string | null
          salary_grade: string | null
          spouse_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          aadhar_number?: string | null
          bank_account_number?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          blood_group?: string | null
          children_count?: number | null
          confirmation_date?: string | null
          created_at?: string | null
          created_by?: string | null
          current_address?: string | null
          designation: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          employee_code: string
          id?: string
          ifsc_code?: string | null
          is_active?: boolean | null
          joining_date: string
          marital_status?: string | null
          medical_conditions?: string | null
          pan_number?: string | null
          permanent_address?: string | null
          pf_number?: string | null
          retirement_date?: string | null
          salary_grade?: string | null
          spouse_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          aadhar_number?: string | null
          bank_account_number?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          blood_group?: string | null
          children_count?: number | null
          confirmation_date?: string | null
          created_at?: string | null
          created_by?: string | null
          current_address?: string | null
          designation?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          employee_code?: string
          id?: string
          ifsc_code?: string | null
          is_active?: boolean | null
          joining_date?: string
          marital_status?: string | null
          medical_conditions?: string | null
          pan_number?: string | null
          permanent_address?: string | null
          pf_number?: string | null
          retirement_date?: string | null
          salary_grade?: string | null
          spouse_name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "faculty_profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "faculty_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["student_id"]
          },
        ]
      }
      faculty_qualifications: {
        Row: {
          certificate_url: string | null
          created_at: string | null
          degree_name: string
          degree_type: string
          faculty_id: string
          grade: string | null
          id: string
          institution_name: string
          is_highest: boolean | null
          percentage: number | null
          specialization: string | null
          university_name: string | null
          year_of_passing: number
        }
        Insert: {
          certificate_url?: string | null
          created_at?: string | null
          degree_name: string
          degree_type: string
          faculty_id: string
          grade?: string | null
          id?: string
          institution_name: string
          is_highest?: boolean | null
          percentage?: number | null
          specialization?: string | null
          university_name?: string | null
          year_of_passing: number
        }
        Update: {
          certificate_url?: string | null
          created_at?: string | null
          degree_name?: string
          degree_type?: string
          faculty_id?: string
          grade?: string | null
          id?: string
          institution_name?: string
          is_highest?: boolean | null
          percentage?: number | null
          specialization?: string | null
          university_name?: string | null
          year_of_passing?: number
        }
        Relationships: [
          {
            foreignKeyName: "faculty_qualifications_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_research: {
        Row: {
          collaborators: string[] | null
          completion_date: string | null
          conference_name: string | null
          created_at: string | null
          description: string | null
          doi: string | null
          faculty_id: string
          file_url: string | null
          funding_agency: string | null
          funding_amount: number | null
          id: string
          journal_name: string | null
          keywords: string[] | null
          publication_date: string | null
          research_type: string
          start_date: string | null
          status: string
          title: string
        }
        Insert: {
          collaborators?: string[] | null
          completion_date?: string | null
          conference_name?: string | null
          created_at?: string | null
          description?: string | null
          doi?: string | null
          faculty_id: string
          file_url?: string | null
          funding_agency?: string | null
          funding_amount?: number | null
          id?: string
          journal_name?: string | null
          keywords?: string[] | null
          publication_date?: string | null
          research_type: string
          start_date?: string | null
          status: string
          title: string
        }
        Update: {
          collaborators?: string[] | null
          completion_date?: string | null
          conference_name?: string | null
          created_at?: string | null
          description?: string | null
          doi?: string | null
          faculty_id?: string
          file_url?: string | null
          funding_agency?: string | null
          funding_amount?: number | null
          id?: string
          journal_name?: string | null
          keywords?: string[] | null
          publication_date?: string | null
          research_type?: string
          start_date?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "faculty_research_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_specializations: {
        Row: {
          certifications: string[] | null
          created_at: string | null
          faculty_id: string
          id: string
          proficiency_level: string
          specialization_area: string
          years_of_experience: number | null
        }
        Insert: {
          certifications?: string[] | null
          created_at?: string | null
          faculty_id: string
          id?: string
          proficiency_level: string
          specialization_area: string
          years_of_experience?: number | null
        }
        Update: {
          certifications?: string[] | null
          created_at?: string | null
          faculty_id?: string
          id?: string
          proficiency_level?: string
          specialization_area?: string
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_specializations_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_timetable: {
        Row: {
          academic_year: string
          class_section: string
          created_at: string | null
          day_of_week: number
          end_time: string
          faculty_id: string
          id: string
          is_active: boolean | null
          period_number: number
          room_number: string | null
          semester: number
          start_time: string
          subject_name: string
          updated_at: string | null
        }
        Insert: {
          academic_year?: string
          class_section: string
          created_at?: string | null
          day_of_week: number
          end_time: string
          faculty_id: string
          id?: string
          is_active?: boolean | null
          period_number: number
          room_number?: string | null
          semester: number
          start_time: string
          subject_name: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          class_section?: string
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          faculty_id?: string
          id?: string
          is_active?: boolean | null
          period_number?: number
          room_number?: string | null
          semester?: number
          start_time?: string
          subject_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_timetable_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_configurations: {
        Row: {
          academic_year: string
          csv_data: Json
          department: Database["public"]["Enums"]["department"]
          id: string
          is_active: boolean | null
          semester: number
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          academic_year: string
          csv_data: Json
          department: Database["public"]["Enums"]["department"]
          id?: string
          is_active?: boolean | null
          semester: number
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          academic_year?: string
          csv_data?: Json
          department?: Database["public"]["Enums"]["department"]
          id?: string
          is_active?: boolean | null
          semester?: number
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_configurations_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_configurations_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["student_id"]
          },
        ]
      }
      fee_installments: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          fee_record_id: string | null
          id: string
          installment_number: number
          paid_date: string | null
          status: Database["public"]["Enums"]["installment_status"] | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          fee_record_id?: string | null
          id?: string
          installment_number: number
          paid_date?: string | null
          status?: Database["public"]["Enums"]["installment_status"] | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          fee_record_id?: string | null
          id?: string
          installment_number?: number
          paid_date?: string | null
          status?: Database["public"]["Enums"]["installment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_installments_fee_record_id_fkey"
            columns: ["fee_record_id"]
            isOneToOne: false
            referencedRelation: "fee_records"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_record_types: {
        Row: {
          created_at: string
          fee_record_id: string
          fee_type_id: string
          id: string
        }
        Insert: {
          created_at?: string
          fee_record_id: string
          fee_type_id: string
          id?: string
        }
        Update: {
          created_at?: string
          fee_record_id?: string
          fee_type_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_record_types_fee_record_id_fkey"
            columns: ["fee_record_id"]
            isOneToOne: false
            referencedRelation: "fee_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_record_types_fee_type_id_fkey"
            columns: ["fee_type_id"]
            isOneToOne: false
            referencedRelation: "fee_types"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_records: {
        Row: {
          academic_year: string
          created_at: string | null
          discount_amount: number | null
          due_date: string
          fee_structure_id: string | null
          fee_type_id: string | null
          final_amount: number
          id: string
          last_payment_date: string | null
          original_amount: number
          paid_amount: number | null
          penalty_amount: number | null
          scholarship_id: string | null
          semester: number
          status: Database["public"]["Enums"]["fee_status"] | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          created_at?: string | null
          discount_amount?: number | null
          due_date: string
          fee_structure_id?: string | null
          fee_type_id?: string | null
          final_amount: number
          id?: string
          last_payment_date?: string | null
          original_amount: number
          paid_amount?: number | null
          penalty_amount?: number | null
          scholarship_id?: string | null
          semester: number
          status?: Database["public"]["Enums"]["fee_status"] | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          created_at?: string | null
          discount_amount?: number | null
          due_date?: string
          fee_structure_id?: string | null
          fee_type_id?: string | null
          final_amount?: number
          id?: string
          last_payment_date?: string | null
          original_amount?: number
          paid_amount?: number | null
          penalty_amount?: number | null
          scholarship_id?: string | null
          semester?: number
          status?: Database["public"]["Enums"]["fee_status"] | null
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_records_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_records_fee_type_id_fkey"
            columns: ["fee_type_id"]
            isOneToOne: false
            referencedRelation: "fee_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_records_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["student_id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          academic_year: string
          created_at: string | null
          department_id: string | null
          due_date: string
          fee_categories: Json
          id: string
          installment_allowed: boolean | null
          is_active: boolean | null
          late_fee_percentage: number | null
          max_installments: number | null
          semester: number
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          created_at?: string | null
          department_id?: string | null
          due_date: string
          fee_categories: Json
          id?: string
          installment_allowed?: boolean | null
          is_active?: boolean | null
          late_fee_percentage?: number | null
          max_installments?: number | null
          semester: number
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          created_at?: string | null
          department_id?: string | null
          due_date?: string
          fee_categories?: Json
          id?: string
          installment_allowed?: boolean | null
          is_active?: boolean | null
          late_fee_percentage?: number | null
          max_installments?: number | null
          semester?: number
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "department_fee_analytics"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "fee_structures_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structures_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "hod_department_summary"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "fee_structures_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "scholarship_summary"
            referencedColumns: ["department_id"]
          },
        ]
      }
      fee_templates: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          due_date: string
          fee_type_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          due_date: string
          fee_type_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          due_date?: string
          fee_type_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_templates_fee_type_id_fkey"
            columns: ["fee_type_id"]
            isOneToOne: false
            referencedRelation: "fee_types"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_mandatory: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          name?: string
        }
        Relationships: []
      }
      fee_waivers: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          fee_record_id: string | null
          id: string
          reason: string
          status: Database["public"]["Enums"]["waiver_status"] | null
          student_id: string | null
          waiver_amount: number | null
          waiver_percentage: number | null
          waiver_type: string
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          fee_record_id?: string | null
          id?: string
          reason: string
          status?: Database["public"]["Enums"]["waiver_status"] | null
          student_id?: string | null
          waiver_amount?: number | null
          waiver_percentage?: number | null
          waiver_type: string
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          fee_record_id?: string | null
          id?: string
          reason?: string
          status?: Database["public"]["Enums"]["waiver_status"] | null
          student_id?: string | null
          waiver_amount?: number | null
          waiver_percentage?: number | null
          waiver_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_waivers_applied_by_fkey"
            columns: ["applied_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_waivers_applied_by_fkey"
            columns: ["applied_by"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fee_waivers_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_waivers_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fee_waivers_fee_record_id_fkey"
            columns: ["fee_record_id"]
            isOneToOne: false
            referencedRelation: "fee_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_waivers_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_waivers_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["student_id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          failureReason: string | null
          fee_record_id: string | null
          gateway: string | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          processed_at: string | null
          processed_by: string | null
          receipt_number: string
          status: Database["public"]["Enums"]["payment_status"] | null
          student_id: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          failureReason?: string | null
          fee_record_id?: string | null
          gateway?: string | null
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          processed_at?: string | null
          processed_by?: string | null
          receipt_number: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          student_id?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          failureReason?: string | null
          fee_record_id?: string | null
          gateway?: string | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          processed_at?: string | null
          processed_by?: string | null
          receipt_number?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          student_id?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_fee_record_id_fkey"
            columns: ["fee_record_id"]
            isOneToOne: false
            referencedRelation: "fee_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "payment_transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["student_id"]
          },
        ]
      }
      permissions: {
        Row: {
          action_type: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          resource_type: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          resource_type: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          resource_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          admission_date: string | null
          blood_group: string | null
          community: string | null
          course: string | null
          created_at: string | null
          department_id: string | null
          due_amount: number | null
          email: string
          emergency_contact: string | null
          employee_id: string | null
          fee_status: string | null
          first_generation: boolean | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          name: string
          paid_amount: number | null
          phone: string | null
          profile_completed: boolean | null
          profile_photo_url: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          roll_number: string | null
          section: string | null
          semester: number | null
          total_fees: number | null
          updated_at: string | null
          year: number | null
          year_section: string | null
        }
        Insert: {
          address?: string | null
          admission_date?: string | null
          blood_group?: string | null
          community?: string | null
          course?: string | null
          created_at?: string | null
          department_id?: string | null
          due_amount?: number | null
          email: string
          emergency_contact?: string | null
          employee_id?: string | null
          fee_status?: string | null
          first_generation?: boolean | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id: string
          is_active?: boolean | null
          last_login?: string | null
          name: string
          paid_amount?: number | null
          phone?: string | null
          profile_completed?: boolean | null
          profile_photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          roll_number?: string | null
          section?: string | null
          semester?: number | null
          total_fees?: number | null
          updated_at?: string | null
          year?: number | null
          year_section?: string | null
        }
        Update: {
          address?: string | null
          admission_date?: string | null
          blood_group?: string | null
          community?: string | null
          course?: string | null
          created_at?: string | null
          department_id?: string | null
          due_amount?: number | null
          email?: string
          emergency_contact?: string | null
          employee_id?: string | null
          fee_status?: string | null
          first_generation?: boolean | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name?: string
          paid_amount?: number | null
          phone?: string | null
          profile_completed?: boolean | null
          profile_photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          roll_number?: string | null
          section?: string | null
          semester?: number | null
          total_fees?: number | null
          updated_at?: string | null
          year?: number | null
          year_section?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "department_fee_analytics"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "hod_department_summary"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "scholarship_summary"
            referencedColumns: ["department_id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string | null
          role_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id?: string | null
          role_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string | null
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      scholarships: {
        Row: {
          academic_year: string
          application_date: string | null
          applied_status: boolean | null
          created_at: string | null
          created_by: string | null
          eligible_amount: number
          id: string
          receipt_date: string | null
          received_by_institution: boolean | null
          remarks: string | null
          scholarship_type: string
          semester: number | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          application_date?: string | null
          applied_status?: boolean | null
          created_at?: string | null
          created_by?: string | null
          eligible_amount: number
          id?: string
          receipt_date?: string | null
          received_by_institution?: boolean | null
          remarks?: string | null
          scholarship_type: string
          semester?: number | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          application_date?: string | null
          applied_status?: boolean | null
          created_at?: string | null
          created_by?: string | null
          eligible_amount?: number
          id?: string
          receipt_date?: string | null
          received_by_institution?: boolean | null
          remarks?: string | null
          scholarship_type?: string
          semester?: number | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scholarships_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholarships_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "scholarships_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholarships_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["student_id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          activity_description: string
          activity_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_description: string
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_description?: string
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          department: Database["public"]["Enums"]["department"] | null
          department_id: string | null
          email: string
          email_sent: boolean | null
          email_sent_at: string | null
          employee_id: string | null
          expires_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          role: Database["public"]["Enums"]["user_role"] | null
          roll_number: string | null
          token: string | null
          used_at: string | null
        }
        Insert: {
          department?: Database["public"]["Enums"]["department"] | null
          department_id?: string | null
          email: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          employee_id?: string | null
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          roll_number?: string | null
          token?: string | null
          used_at?: string | null
        }
        Update: {
          department?: Database["public"]["Enums"]["department"] | null
          department_id?: string | null
          email?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          employee_id?: string | null
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          roll_number?: string | null
          token?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "department_fee_analytics"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "user_invitations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "hod_department_summary"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "user_invitations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "scholarship_summary"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "user_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["student_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          department_id: string | null
          id: string
          is_active: boolean | null
          role_id: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          role_id?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          role_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "user_roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "department_fee_analytics"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "user_roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "hod_department_summary"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "user_roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "scholarship_summary"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "student_fee_summary"
            referencedColumns: ["student_id"]
          },
        ]
      }
    }
    Views: {
      department_fee_analytics: {
        Row: {
          collection_percentage: number | null
          department_code: string | null
          department_id: string | null
          department_name: string | null
          overdue_records: number | null
          total_collected: number | null
          total_fee_records: number | null
          total_fees: number | null
          total_pending: number | null
          total_students: number | null
        }
        Relationships: []
      }
      hod_department_summary: {
        Row: {
          collection_percentage: number | null
          department_code: string | null
          department_id: string | null
          department_name: string | null
          total_collected: number | null
          total_department_fees: number | null
          total_fee_records: number | null
          total_pending: number | null
          total_students: number | null
        }
        Relationships: []
      }
      institution_scholarship_summary: {
        Row: {
          academic_year: string | null
          applied_scholarships: number | null
          received_scholarships: number | null
          total_eligible_amount: number | null
          total_received_amount: number | null
          total_scholarship_students: number | null
          total_scholarships: number | null
        }
        Relationships: []
      }
      principal_institution_summary: {
        Row: {
          overall_collection_percentage: number | null
          overdue_records: number | null
          total_collected: number | null
          total_departments: number | null
          total_fee_records: number | null
          total_institution_fees: number | null
          total_pending: number | null
          total_students: number | null
        }
        Relationships: []
      }
      scholarship_summary: {
        Row: {
          academic_year: string | null
          applied_scholarships: number | null
          department_code: string | null
          department_id: string | null
          department_name: string | null
          received_scholarships: number | null
          total_eligible_amount: number | null
          total_received_amount: number | null
          total_scholarship_students: number | null
          total_scholarships: number | null
        }
        Relationships: []
      }
      student_fee_summary: {
        Row: {
          department_id: string | null
          department_name: string | null
          name: string | null
          payment_status: string | null
          pending_amount: number | null
          roll_number: string | null
          student_id: string | null
          total_fee_records: number | null
          total_fees: number | null
          total_paid: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "department_fee_analytics"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "hod_department_summary"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "scholarship_summary"
            referencedColumns: ["department_id"]
          },
        ]
      }
    }
    Functions: {
      apply_scholarship_to_fee_record: {
        Args: { p_fee_record_id: string; p_scholarship_id: string }
        Returns: undefined
      }
      auto_apply_scholarships: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      bulk_update_fee_records: {
        Args: {
          p_user_id: string
          p_record_ids: string[]
          p_status?: Database["public"]["Enums"]["fee_status"]
          p_due_date?: string
        }
        Returns: Json
      }
      calculate_penalty_amount: {
        Args: {
          due_date: string
          original_amount: number
          penalty_percentage: number
        }
        Returns: number
      }
      calculate_scholarship_eligibility: {
        Args: { p_student_id: string; p_academic_year?: string }
        Returns: undefined
      }
      check_hod_department: {
        Args: { user_id: string; dept_id: string }
        Returns: boolean
      }
      check_user_role: {
        Args: { user_id: string; target_role: string }
        Returns: boolean
      }
      check_user_roles: {
        Args: { user_id: string; target_roles: string[] }
        Returns: boolean
      }
      complete_invitation_profile: {
        Args: {
          p_user_id: string
          p_invitation_id: string
          p_profile_data: Json
        }
        Returns: boolean
      }
      create_admin_invitation_if_not_exists: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      create_direct_admin: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      create_installments: {
        Args: {
          p_fee_record_id: string
          p_total_amount: number
          p_num_installments: number
          p_first_due_date: string
        }
        Returns: undefined
      }
      generate_complete_fee_system: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_fee_record_for_student: {
        Args: {
          p_student_id: string
          p_academic_year?: string
          p_semester?: number
        }
        Returns: string
      }
      generate_receipt_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_all_students_for_admin: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          name: string
          email: string
          roll_number: string
          year: number
          semester: number
          department_id: string
          department_name: string
          department_code: string
          is_active: boolean
        }[]
      }
      get_department_analytics_filtered: {
        Args: {
          p_from_date?: string
          p_to_date?: string
          p_date_filter_type?: string
          p_department_ids?: string[]
          p_status_filter?: string[]
          p_min_amount?: number
          p_max_amount?: number
        }
        Returns: {
          department_id: string
          department_name: string
          department_code: string
          total_students: number
          total_fee_records: number
          total_fees: number
          total_collected: number
          total_pending: number
          collection_percentage: number
          overdue_records: number
          avg_fee_per_student: number
          last_updated: string
        }[]
      }
      get_faculty_with_details: {
        Args: { p_user_id: string }
        Returns: {
          faculty_id: string
          user_id: string
          name: string
          email: string
          employee_code: string
          designation: string
          department_name: string
          joining_date: string
          phone: string
          is_active: boolean
        }[]
      }
      get_fee_records_with_filters: {
        Args:
          | {
              p_user_id: string
              p_department?: string
              p_year?: number
              p_fee_type?: string
              p_status?: string
              p_from_date?: string
              p_to_date?: string
              p_date_filter_type?: string
              p_min_amount?: number
              p_max_amount?: number
              p_limit?: number
              p_offset?: number
            }
          | {
              p_user_id: string
              p_department?: string
              p_year?: number
              p_fee_type?: string
              p_status?: string
              p_limit?: number
              p_offset?: number
            }
        Returns: {
          id: string
          student_id: string
          student_name: string
          roll_number: string
          department_name: string
          year: number
          semester: number
          fee_type_name: string
          academic_year: string
          original_amount: number
          final_amount: number
          paid_amount: number
          status: Database["public"]["Enums"]["fee_status"]
          due_date: string
          created_at: string
        }[]
      }
      get_fee_type_analytics_filtered: {
        Args: {
          p_from_date?: string
          p_to_date?: string
          p_date_filter_type?: string
          p_department_ids?: string[]
          p_status_filter?: string[]
          p_min_amount?: number
          p_max_amount?: number
        }
        Returns: {
          fee_type_id: string
          fee_type_name: string
          fee_type_description: string
          is_mandatory: boolean
          total_students: number
          total_fee_records: number
          total_fees: number
          total_collected: number
          total_pending: number
          collection_percentage: number
          overdue_records: number
          avg_fee_per_student: number
          last_updated: string
        }[]
      }
      get_invitation_details: {
        Args: { invitation_email: string }
        Returns: {
          id: string
          email: string
          role: Database["public"]["Enums"]["user_role"]
          department: Database["public"]["Enums"]["department"]
          roll_number: string
          employee_id: string
          invited_at: string
          expires_at: string
          used_at: string
          is_active: boolean
          is_valid: boolean
        }[]
      }
      get_students_with_filters: {
        Args: {
          p_user_id: string
          p_department_filter?: string
          p_year_filter?: number
          p_search_term?: string
        }
        Returns: {
          id: string
          name: string
          email: string
          roll_number: string
          year: number
          semester: number
          department_id: string
          department_name: string
          department_code: string
          is_active: boolean
        }[]
      }
      get_user_department: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["department"]
      }
      get_user_department_id: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      mark_invitation_used: {
        Args: { invitation_email: string }
        Returns: undefined
      }
      process_fee_csv_upload: {
        Args: {
          p_academic_year: string
          p_semester: number
          p_department: Database["public"]["Enums"]["department"]
          p_csv_data: Json
          p_uploaded_by: string
        }
        Returns: Json
      }
      process_fee_csv_upload_with_types: {
        Args: {
          p_academic_year: string
          p_semester: number
          p_department: Database["public"]["Enums"]["department"]
          p_csv_data: Json
          p_uploaded_by: string
        }
        Returns: Json
      }
      update_daily_faculty_attendance: {
        Args: { p_faculty_id: string; p_date: string }
        Returns: undefined
      }
      user_has_permission: {
        Args: {
          user_id: string
          permission_name: string
          department_id?: string
        }
        Returns: boolean
      }
      validate_invitation_token: {
        Args: { p_token: string }
        Returns: {
          id: string
          email: string
          role: Database["public"]["Enums"]["user_role"]
          department_id: string
          department_name: string
          department_code: string
          roll_number: string
          employee_id: string
          is_valid: boolean
          error_message: string
        }[]
      }
    }
    Enums: {
      department:
        | "CSE"
        | "ECE"
        | "MECH"
        | "CIVIL"
        | "EEE"
        | "IT"
        | "ADMIN"
        | "CHAIRMAN"
      fee_status: "Paid" | "Pending" | "Overdue" | "Partial"
      installment_status: "Pending" | "Paid" | "Overdue"
      payment_method:
        | "Online"
        | "Cash"
        | "Cheque"
        | "DD"
        | "UPI"
        | "Scholarship"
      payment_status: "Pending" | "Success" | "Failed" | "Cancelled"
      user_role:
        | "student"
        | "hod"
        | "principal"
        | "admin"
        | "chairman"
        | "faculty"
      waiver_status: "Pending" | "Approved" | "Rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      department: [
        "CSE",
        "ECE",
        "MECH",
        "CIVIL",
        "EEE",
        "IT",
        "ADMIN",
        "CHAIRMAN",
      ],
      fee_status: ["Paid", "Pending", "Overdue", "Partial"],
      installment_status: ["Pending", "Paid", "Overdue"],
      payment_method: ["Online", "Cash", "Cheque", "DD", "UPI", "Scholarship"],
      payment_status: ["Pending", "Success", "Failed", "Cancelled"],
      user_role: [
        "student",
        "hod",
        "principal",
        "admin",
        "chairman",
        "faculty",
      ],
      waiver_status: ["Pending", "Approved", "Rejected"],
    },
  },
} as const
