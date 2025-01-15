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
      authorized_admins: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      authorized_employees: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      driver_preferences: {
        Row: {
          created_at: string
          custom_preferences: string[] | null
          id: string
          pets_allowed: boolean
          smoking_allowed: boolean
          user_id: string | null
        }
        Insert: {
          created_at?: string
          custom_preferences?: string[] | null
          id?: string
          pets_allowed?: boolean
          smoking_allowed?: boolean
          user_id?: string | null
        }
        Update: {
          created_at?: string
          custom_preferences?: string[] | null
          id?: string
          pets_allowed?: boolean
          smoking_allowed?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "problematic_rides"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "driver_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "problematic_rides"
            referencedColumns: ["passenger_id"]
          },
          {
            foreignKeyName: "driver_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_reviews: {
        Row: {
          comment: string | null
          created_at: string
          driver_id: string
          id: string
          is_positive: boolean | null
          rating: number
          reviewer_id: string
          status: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          driver_id: string
          id?: string
          is_positive?: boolean | null
          rating: number
          reviewer_id: string
          status?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          driver_id?: string
          id?: string
          is_positive?: boolean | null
          rating?: number
          reviewer_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_reviews_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "problematic_rides"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "driver_reviews_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "problematic_rides"
            referencedColumns: ["passenger_id"]
          },
          {
            foreignKeyName: "driver_reviews_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "problematic_rides"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "driver_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "problematic_rides"
            referencedColumns: ["passenger_id"]
          },
          {
            foreignKeyName: "driver_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          birth_date: string | null
          created_at: string
          credits: number
          first_name: string | null
          id: string
          last_name: string | null
          name: string | null
          phone: string | null
          photo: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          username: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          credits?: number
          first_name?: string | null
          id: string
          last_name?: string | null
          name?: string | null
          phone?: string | null
          photo?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          username?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          credits?: number
          first_name?: string | null
          id?: string
          last_name?: string | null
          name?: string | null
          phone?: string | null
          photo?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          username?: string | null
        }
        Relationships: []
      }
      ride_bookings: {
        Row: {
          created_at: string
          id: string
          passenger_id: string
          ride_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          passenger_id: string
          ride_id: string
        }
        Update: {
          created_at?: string
          id?: string
          passenger_id?: string
          ride_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_bookings_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "problematic_rides"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "ride_bookings_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "problematic_rides"
            referencedColumns: ["passenger_id"]
          },
          {
            foreignKeyName: "ride_bookings_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_bookings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "problematic_rides"
            referencedColumns: ["ride_id"]
          },
          {
            foreignKeyName: "ride_bookings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          arrival_city: string
          arrival_time: string
          created_at: string
          departure_city: string
          departure_date: string
          departure_time: string | null
          description: string | null
          driver_preferences: string[] | null
          id: string
          is_electric_car: boolean
          price: number
          seats_available: number
          status: string
          user_id: string
          vehicle_brand: string | null
          vehicle_model: string | null
        }
        Insert: {
          arrival_city: string
          arrival_time?: string
          created_at?: string
          departure_city: string
          departure_date: string
          departure_time?: string | null
          description?: string | null
          driver_preferences?: string[] | null
          id?: string
          is_electric_car?: boolean
          price: number
          seats_available: number
          status?: string
          user_id: string
          vehicle_brand?: string | null
          vehicle_model?: string | null
        }
        Update: {
          arrival_city?: string
          arrival_time?: string
          created_at?: string
          departure_city?: string
          departure_date?: string
          departure_time?: string | null
          description?: string | null
          driver_preferences?: string[] | null
          id?: string
          is_electric_car?: boolean
          price?: number
          seats_available?: number
          status?: string
          user_id?: string
          vehicle_brand?: string | null
          vehicle_model?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "problematic_rides"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "rides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "problematic_rides"
            referencedColumns: ["passenger_id"]
          },
          {
            foreignKeyName: "rides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suspended_users: {
        Row: {
          id: string
          reason: string | null
          suspended_at: string
          suspended_by: string | null
        }
        Insert: {
          id: string
          reason?: string | null
          suspended_at?: string
          suspended_by?: string | null
        }
        Update: {
          id?: string
          reason?: string | null
          suspended_at?: string
          suspended_by?: string | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          brand: string
          brand_id: string | null
          color: string
          created_at: string
          energy_type: string | null
          first_registration_date: string
          id: string
          license_plate: string
          model: string
          seats: number
          user_id: string | null
        }
        Insert: {
          brand: string
          brand_id?: string | null
          color: string
          created_at?: string
          energy_type?: string | null
          first_registration_date: string
          id?: string
          license_plate: string
          model: string
          seats: number
          user_id?: string | null
        }
        Update: {
          brand?: string
          brand_id?: string | null
          color?: string
          created_at?: string
          energy_type?: string | null
          first_registration_date?: string
          id?: string
          license_plate?: string
          model?: string
          seats?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "problematic_rides"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "problematic_rides"
            referencedColumns: ["passenger_id"]
          },
          {
            foreignKeyName: "vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      problematic_rides: {
        Row: {
          arrival_city: string | null
          arrival_time: string | null
          departure_city: string | null
          departure_date: string | null
          driver_email: string | null
          driver_id: string | null
          driver_name: string | null
          is_positive: boolean | null
          passenger_email: string | null
          passenger_id: string | null
          passenger_name: string | null
          review_comment: string | null
          ride_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_platform_credits_per_day: {
        Args: {
          start_date: string
          end_date: string
        }
        Returns: {
          date: string
          credits: number
        }[]
      }
      get_rides_per_day: {
        Args: {
          start_date: string
          end_date: string
        }
        Returns: {
          date: string
          count: number
        }[]
      }
    }
    Enums: {
      user_role: "driver" | "passenger" | "both" | "employee" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
