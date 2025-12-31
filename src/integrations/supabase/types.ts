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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      driver_documents: {
        Row: {
          created_at: string | null
          document_type: string
          document_url: string
          driver_id: string | null
          expiry_date: string | null
          id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          document_url: string
          driver_id?: string | null
          expiry_date?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          document_url?: string
          driver_id?: string | null
          expiry_date?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_documents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          availability: string | null
          cancellations: number | null
          created_at: string | null
          id: string
          id_verification_url: string | null
          license_expiry: string | null
          license_number: string | null
          organization_id: string | null
          police_clearance_url: string | null
          profile_picture_url: string | null
          rating: number | null
          status: string | null
          total_rides: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          availability?: string | null
          cancellations?: number | null
          created_at?: string | null
          id?: string
          id_verification_url?: string | null
          license_expiry?: string | null
          license_number?: string | null
          organization_id?: string | null
          police_clearance_url?: string | null
          profile_picture_url?: string | null
          rating?: number | null
          status?: string | null
          total_rides?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          availability?: string | null
          cancellations?: number | null
          created_at?: string | null
          id?: string
          id_verification_url?: string | null
          license_expiry?: string | null
          license_number?: string | null
          organization_id?: string | null
          police_clearance_url?: string | null
          profile_picture_url?: string | null
          rating?: number | null
          status?: string | null
          total_rides?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      fare_rates: {
        Row: {
          base_fare: number
          created_at: string | null
          id: string
          organization_id: string | null
          per_km: number
          per_min: number
          period: string
          valid_from: string
          valid_to: string
          vehicle_category: string | null
        }
        Insert: {
          base_fare: number
          created_at?: string | null
          id?: string
          organization_id?: string | null
          per_km: number
          per_min: number
          period: string
          valid_from: string
          valid_to: string
          vehicle_category?: string | null
        }
        Update: {
          base_fare?: number
          created_at?: string | null
          id?: string
          organization_id?: string | null
          per_km?: number
          per_min?: number
          period?: string
          valid_from?: string
          valid_to?: string
          vehicle_category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fare_rates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          operational_hours_end: string | null
          operational_hours_start: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          operational_hours_end?: string | null
          operational_hours_start?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          operational_hours_end?: string | null
          operational_hours_start?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_first_login: boolean | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_first_login?: boolean | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_first_login?: boolean | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rides: {
        Row: {
          completed_at: string | null
          created_at: string | null
          driver_id: string | null
          dropoff_address: string
          dropoff_lat: number | null
          dropoff_lng: number | null
          estimated_distance: number | null
          estimated_duration: number | null
          estimated_price: number | null
          final_price: number | null
          id: string
          notes: string | null
          organization_id: string | null
          payment_method: string | null
          payment_status: string | null
          pickup_address: string
          pickup_lat: number | null
          pickup_lng: number | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          vehicle_id: string | null
          vehicle_type: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          driver_id?: string | null
          dropoff_address: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          estimated_distance?: number | null
          estimated_duration?: number | null
          estimated_price?: number | null
          final_price?: number | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_address: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
          vehicle_type?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          driver_id?: string | null
          dropoff_address?: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          estimated_distance?: number | null
          estimated_duration?: number | null
          estimated_price?: number | null
          final_price?: number | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_address?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_addresses: {
        Row: {
          address: string
          created_at: string | null
          id: string
          is_favorite: boolean | null
          label: string
          lat: number | null
          lng: number | null
          user_id: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          label: string
          lat?: number | null
          lng?: number | null
          user_id?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          label?: string
          lat?: number | null
          lng?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string
          id: string
          priority: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_images: {
        Row: {
          created_at: string | null
          id: string
          image_type: string | null
          image_url: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_type?: string | null
          image_url: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_type?: string | null
          image_url?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_images_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          category: string | null
          color: string | null
          created_at: string | null
          driver_id: string | null
          id: string
          inspection_url: string | null
          insurance_url: string | null
          license_plate: string
          make: string
          model: string
          organization_id: string | null
          registration_url: string | null
          seats: number | null
          status: string | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          inspection_url?: string | null
          insurance_url?: string | null
          license_plate: string
          make: string
          model: string
          organization_id?: string | null
          registration_url?: string | null
          seats?: number | null
          status?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          inspection_url?: string | null
          insurance_url?: string | null
          license_plate?: string
          make?: string
          model?: string
          organization_id?: string | null
          registration_url?: string | null
          seats?: number | null
          status?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "dispatcher"
        | "support"
        | "driver"
        | "client"
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
      app_role: [
        "super_admin",
        "admin",
        "dispatcher",
        "support",
        "driver",
        "client",
      ],
    },
  },
} as const
