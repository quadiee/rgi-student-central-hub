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
          course: string | null
          created_at: string | null
          department_id: string | null
          due_amount: number | null
          email: string
          emergency_contact: string | null
          employee_id: string | null
          fee_status: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          name: string
          paid_amount: number | null
          phone: string | null
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
          course?: string | null
          created_at?: string | null
          department_id?: string | null
          due_amount?: number | null
          email: string
          emergency_contact?: string | null
          employee_id?: string | null
          fee_status?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id: string
          is_active?: boolean | null
          last_login?: string | null
          name: string
          paid_amount?: number | null
          phone?: string | null
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
          course?: string | null
          created_at?: string | null
          department_id?: string | null
          due_amount?: number | null
          email?: string
          emergency_contact?: string | null
          employee_id?: string | null
          fee_status?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name?: string
          paid_amount?: number | null
          phone?: string | null
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
      user_invitations: {
        Row: {
          department: Database["public"]["Enums"]["department"] | null
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
        ]
      }
    }
    Functions: {
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
      generate_receipt_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_fee_records_with_filters: {
        Args: {
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
      user_has_permission: {
        Args: {
          user_id: string
          permission_name: string
          department_id?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      department: "CSE" | "ECE" | "MECH" | "CIVIL" | "EEE" | "IT" | "ADMIN"
      fee_status: "Paid" | "Pending" | "Overdue" | "Partial"
      installment_status: "Pending" | "Paid" | "Overdue"
      payment_method: "Online" | "Cash" | "Cheque" | "DD" | "UPI"
      payment_status: "Pending" | "Success" | "Failed" | "Cancelled"
      user_role: "student" | "hod" | "principal" | "admin"
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
      department: ["CSE", "ECE", "MECH", "CIVIL", "EEE", "IT", "ADMIN"],
      fee_status: ["Paid", "Pending", "Overdue", "Partial"],
      installment_status: ["Pending", "Paid", "Overdue"],
      payment_method: ["Online", "Cash", "Cheque", "DD", "UPI"],
      payment_status: ["Pending", "Success", "Failed", "Cancelled"],
      user_role: ["student", "hod", "principal", "admin"],
      waiver_status: ["Pending", "Approved", "Rejected"],
    },
  },
} as const
