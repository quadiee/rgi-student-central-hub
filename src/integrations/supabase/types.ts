export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      fee_records: {
        Row: {
          academic_year: string
          created_at: string | null
          discount_amount: number | null
          due_date: string
          fee_structure_id: string | null
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
            foreignKeyName: "fee_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          academic_year: string
          created_at: string | null
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
            foreignKeyName: "fee_waivers_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          failure_reason: string | null
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
          failure_reason?: string | null
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
          failure_reason?: string | null
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
            foreignKeyName: "payment_transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          employee_id: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          roll_number: string | null
          updated_at: string | null
          year_section: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          employee_id?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          roll_number?: string | null
          updated_at?: string | null
          year_section?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          employee_id?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          roll_number?: string | null
          updated_at?: string | null
          year_section?: string | null
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          email: string
          employee_id: string | null
          expires_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          roll_number: string | null
          used_at: string | null
        }
        Insert: {
          email: string
          employee_id?: string | null
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          roll_number?: string | null
          used_at?: string | null
        }
        Update: {
          email?: string
          employee_id?: string | null
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          roll_number?: string | null
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
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      create_installments: {
        Args: {
          p_fee_record_id: string
          p_total_amount: number
          p_num_installments: number
          p_first_due_date: string
        }
        Returns: undefined
      }
      generate_receipt_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      mark_invitation_used: {
        Args: { invitation_email: string }
        Returns: undefined
      }
    }
    Enums: {
      department: "CSE" | "ECE" | "MECH" | "CIVIL" | "EEE" | "IT" | "ADMIN"
      fee_status: "Paid" | "Pending" | "Overdue" | "Partial"
      installment_status: "Pending" | "Paid" | "Overdue"
      payment_method: "Online" | "Cash" | "Cheque" | "DD" | "UPI"
      payment_status: "Pending" | "Success" | "Failed" | "Cancelled"
      user_role: "student" | "faculty" | "hod" | "principal" | "admin"
      waiver_status: "Pending" | "Approved" | "Rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
      user_role: ["student", "faculty", "hod", "principal", "admin"],
      waiver_status: ["Pending", "Approved", "Rejected"],
    },
  },
} as const
