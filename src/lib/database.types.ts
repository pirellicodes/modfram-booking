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
    PostgrestVersion: "13.0.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      availability: {
        Row: {
          created_at: string
          date_override: string | null
          id: string
          is_available: boolean
          slots: Json
          timezone: string | null
          updated_at: string
          user_id: string
          weekday: number | null
        }
        Insert: {
          created_at?: string
          date_override?: string | null
          id?: string
          is_available?: boolean
          slots?: Json
          timezone?: string | null
          updated_at?: string
          user_id: string
          weekday?: number | null
        }
        Update: {
          created_at?: string
          date_override?: string | null
          id?: string
          is_available?: boolean
          slots?: Json
          timezone?: string | null
          updated_at?: string
          user_id?: string
          weekday?: number | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          attendee_email: string | null
          attendee_name: string | null
          attendee_phone: string | null
          balance_due: number
          balance_paid: boolean | null
          booking_date: string
          booking_fields_responses: Json | null
          booking_time: string
          cancellation_reason: string | null
          cancelled_at: string | null
          client_email: string
          client_name: string
          client_phone: string | null
          confirmed_at: string | null
          created_at: string | null
          deposit_amount: number
          deposit_paid: boolean | null
          event_type_id: string | null
          id: number
          meeting_password: string | null
          meeting_url: string | null
          notes: string | null
          service_type_id: number | null
          status: string | null
          stripe_balance_payment_intent_id: string | null
          stripe_deposit_payment_intent_id: string | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          attendee_email?: string | null
          attendee_name?: string | null
          attendee_phone?: string | null
          balance_due: number
          balance_paid?: boolean | null
          booking_date: string
          booking_fields_responses?: Json | null
          booking_time: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          client_email: string
          client_name: string
          client_phone?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deposit_amount: number
          deposit_paid?: boolean | null
          event_type_id?: string | null
          id?: number
          meeting_password?: string | null
          meeting_url?: string | null
          notes?: string | null
          service_type_id?: number | null
          status?: string | null
          stripe_balance_payment_intent_id?: string | null
          stripe_deposit_payment_intent_id?: string | null
          total_price: number
          updated_at?: string | null
        }
        Update: {
          attendee_email?: string | null
          attendee_name?: string | null
          attendee_phone?: string | null
          balance_due?: number
          balance_paid?: boolean | null
          booking_date?: string
          booking_fields_responses?: Json | null
          booking_time?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deposit_amount?: number
          deposit_paid?: boolean | null
          event_type_id?: string | null
          id?: number
          meeting_password?: string | null
          meeting_url?: string | null
          notes?: string | null
          service_type_id?: number | null
          status?: string | null
          stripe_balance_payment_intent_id?: string | null
          stripe_deposit_payment_intent_id?: string | null
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      business_hours: {
        Row: {
          day_of_week: number
          end_time: string
          id: number
          is_active: boolean | null
          start_time: string
        }
        Insert: {
          day_of_week: number
          end_time: string
          id?: number
          is_active?: boolean | null
          start_time: string
        }
        Update: {
          day_of_week?: number
          end_time?: string
          id?: number
          is_active?: boolean | null
          start_time?: string
        }
        Relationships: []
      }
      event_types: {
        Row: {
          after_event_buffer: number | null
          before_event_buffer: number | null
          booking_fields: Json | null
          created_at: string | null
          currency: string | null
          description: string | null
          disable_guests: boolean | null
          hidden: boolean | null
          id: string
          is_active: boolean | null
          is_instant_event: boolean | null
          length_in_minutes: number
          length_in_minutes_options: number[] | null
          locations: Json | null
          metadata: Json | null
          minimum_booking_notice: number | null
          position: number | null
          price_cents: number | null
          requires_confirmation: boolean | null
          schedule_id: number | null
          slot_interval: number | null
          slug: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          after_event_buffer?: number | null
          before_event_buffer?: number | null
          booking_fields?: Json | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          disable_guests?: boolean | null
          hidden?: boolean | null
          id?: string
          is_active?: boolean | null
          is_instant_event?: boolean | null
          length_in_minutes?: number
          length_in_minutes_options?: number[] | null
          locations?: Json | null
          metadata?: Json | null
          minimum_booking_notice?: number | null
          position?: number | null
          price_cents?: number | null
          requires_confirmation?: boolean | null
          schedule_id?: number | null
          slot_interval?: number | null
          slug: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          after_event_buffer?: number | null
          before_event_buffer?: number | null
          booking_fields?: Json | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          disable_guests?: boolean | null
          hidden?: boolean | null
          id?: string
          is_active?: boolean | null
          is_instant_event?: boolean | null
          length_in_minutes?: number
          length_in_minutes_options?: number[] | null
          locations?: Json | null
          metadata?: Json | null
          minimum_booking_notice?: number | null
          position?: number | null
          price_cents?: number | null
          requires_confirmation?: boolean | null
          schedule_id?: number | null
          slot_interval?: number | null
          slug?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          booking_id: number | null
          created_at: string | null
          currency: string
          id: string
          status: string
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          booking_id?: number | null
          created_at?: string | null
          currency?: string
          id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          booking_id?: number | null
          created_at?: string | null
          currency?: string
          id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      service_types: {
        Row: {
          buffer_time_after: number | null
          buffer_time_before: number | null
          created_at: string | null
          deposit_percentage: number | null
          description: string | null
          duration: number
          id: number
          is_active: boolean | null
          location: string | null
          max_advance_booking_days: number | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          buffer_time_after?: number | null
          buffer_time_before?: number | null
          created_at?: string | null
          deposit_percentage?: number | null
          description?: string | null
          duration: number
          id?: number
          is_active?: boolean | null
          location?: string | null
          max_advance_booking_days?: number | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          buffer_time_after?: number | null
          buffer_time_before?: number | null
          created_at?: string | null
          deposit_percentage?: number | null
          description?: string | null
          duration?: number
          id?: number
          is_active?: boolean | null
          location?: string | null
          max_advance_booking_days?: number | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
