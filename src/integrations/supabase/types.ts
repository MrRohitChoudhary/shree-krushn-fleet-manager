export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          attendance_date: string
          created_at: string
          driver_id: string
          id: string
          remarks: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attendance_date: string
          created_at?: string
          driver_id: string
          id?: string
          remarks?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attendance_date?: string
          created_at?: string
          driver_id?: string
          id?: string
          remarks?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          aadhaar_number: string | null
          address: string | null
          assigned_vehicle_id: string | null
          created_at: string
          daily_salary: number | null
          driver_code: string
          full_name: string
          id: string
          joining_date: string | null
          license_number: string | null
          mobile: string | null
          monthly_salary: number
          photo_url: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          aadhaar_number?: string | null
          address?: string | null
          assigned_vehicle_id?: string | null
          created_at?: string
          daily_salary?: number | null
          driver_code?: string
          full_name: string
          id?: string
          joining_date?: string | null
          license_number?: string | null
          mobile?: string | null
          monthly_salary?: number
          photo_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          aadhaar_number?: string | null
          address?: string | null
          assigned_vehicle_id?: string | null
          created_at?: string
          daily_salary?: number | null
          driver_code?: string
          full_name?: string
          id?: string
          joining_date?: string | null
          license_number?: string | null
          mobile?: string | null
          monthly_salary?: number
          photo_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_assigned_vehicle_id_fkey"
            columns: ["assigned_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_entries: {
        Row: {
          cng_quantity: number
          created_at: string
          driver_id: string | null
          entry_date: string
          fuel_cost: number
          fuel_type: string
          id: string
          odometer: number | null
          petrol_quantity: number
          remarks: string | null
          station_name: string | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          cng_quantity?: number
          created_at?: string
          driver_id?: string | null
          entry_date?: string
          fuel_cost?: number
          fuel_type?: string
          id?: string
          odometer?: number | null
          petrol_quantity?: number
          remarks?: string | null
          station_name?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          cng_quantity?: number
          created_at?: string
          driver_id?: string | null
          entry_date?: string
          fuel_cost?: number
          fuel_type?: string
          id?: string
          odometer?: number | null
          petrol_quantity?: number
          remarks?: string | null
          station_name?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fuel_entries_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_entries_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      salary: {
        Row: {
          advance_given: number
          created_at: string
          driver_id: string
          id: string
          monthly_salary: number
          remarks: string | null
          salary_month: string
          salary_paid: number
          updated_at: string
        }
        Insert: {
          advance_given?: number
          created_at?: string
          driver_id: string
          id?: string
          monthly_salary?: number
          remarks?: string | null
          salary_month: string
          salary_paid?: number
          updated_at?: string
        }
        Update: {
          advance_given?: number
          created_at?: string
          driver_id?: string
          id?: string
          monthly_salary?: number
          remarks?: string | null
          salary_month?: string
          salary_paid?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          brand: string | null
          created_at: string
          fuel_type: string
          id: string
          model: string | null
          purchase_date: string | null
          remarks: string | null
          status: string
          updated_at: string
          vehicle_number: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          fuel_type?: string
          id?: string
          model?: string | null
          purchase_date?: string | null
          remarks?: string | null
          status?: string
          updated_at?: string
          vehicle_number: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          fuel_type?: string
          id?: string
          model?: string | null
          purchase_date?: string | null
          remarks?: string | null
          status?: string
          updated_at?: string
          vehicle_number?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_driver_id: { Args: never; Returns: string }
      current_driver_vehicle_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_owner: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "owner" | "driver"
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
      app_role: ["owner", "driver"],
    },
  },
} as const
