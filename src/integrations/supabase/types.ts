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
      coupon_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          category_id: string | null
          click_count: number
          code: string
          created_at: string
          description: string
          destination_url: string
          expiration_date: string | null
          id: string
          is_active: boolean
          offer_title: string
          partner_logo: string
          partner_name: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          click_count?: number
          code: string
          created_at?: string
          description?: string
          destination_url: string
          expiration_date?: string | null
          id?: string
          is_active?: boolean
          offer_title: string
          partner_logo?: string
          partner_name: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          click_count?: number
          code?: string
          created_at?: string
          description?: string
          destination_url?: string
          expiration_date?: string | null
          id?: string
          is_active?: boolean
          offer_title?: string
          partner_logo?: string
          partner_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupons_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "coupon_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string
          id: string
          is_published: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          is_published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      home_config: {
        Row: {
          banners: Json
          id: string
          step_cards: Json
          updated_at: string
          welcome_card: Json
        }
        Insert: {
          banners?: Json
          id?: string
          step_cards?: Json
          updated_at?: string
          welcome_card?: Json
        }
        Update: {
          banners?: Json
          id?: string
          step_cards?: Json
          updated_at?: string
          welcome_card?: Json
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string
          id: string
          is_completed: boolean
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          is_completed?: boolean
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          is_completed?: boolean
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          bunny_video_id: string
          created_at: string
          description: string | null
          duration: number
          id: string
          is_free: boolean
          module_id: string
          sort_order: number
          title: string
        }
        Insert: {
          bunny_video_id?: string
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          is_free?: boolean
          module_id: string
          sort_order?: number
          title: string
        }
        Update: {
          bunny_video_id?: string
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          is_free?: boolean
          module_id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      market_analyses: {
        Row: {
          created_at: string
          date: string
          dollar_price: number
          dollar_variation: number
          euro_price: number
          euro_variation: number
          full_analysis: string
          id: string
          image_url: string | null
          recommendation: string
          resistances: number[]
          summary: string
          supports: number[]
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          date: string
          dollar_price: number
          dollar_variation?: number
          euro_price: number
          euro_variation?: number
          full_analysis: string
          id?: string
          image_url?: string | null
          recommendation: string
          resistances?: number[]
          summary: string
          supports?: number[]
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          dollar_price?: number
          dollar_variation?: number
          euro_price?: number
          euro_variation?: number
          full_analysis?: string
          id?: string
          image_url?: string | null
          recommendation?: string
          resistances?: number[]
          summary?: string
          supports?: number[]
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_href: string | null
          action_label: string | null
          created_at: string
          icon: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_href?: string | null
          action_label?: string | null
          created_at?: string
          icon?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_href?: string | null
          action_label?: string | null
          created_at?: string
          icon?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      planner_transactions: {
        Row: {
          amount: number
          created_at: string
          date: string
          goal_id: string | null
          id: string
          location: string
          rate: number
          total_paid: number
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          goal_id?: string | null
          id?: string
          location?: string
          rate: number
          total_paid: number
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          goal_id?: string | null
          id?: string
          location?: string
          rate?: number
          total_paid?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planner_transactions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "trip_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          currency: string
          description: string
          features: string[]
          id: string
          interval: string
          interval_label: string
          is_active: boolean
          name: string
          popular: boolean
          price_cents: number
          savings_percent: number | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string
          features?: string[]
          id?: string
          interval: string
          interval_label?: string
          is_active?: boolean
          name: string
          popular?: boolean
          price_cents?: number
          savings_percent?: number | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string
          features?: string[]
          id?: string
          interval?: string
          interval_label?: string
          is_active?: boolean
          name?: string
          popular?: boolean
          price_cents?: number
          savings_percent?: number | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_plan_slug: string | null
          email: string
          id: string
          pending_downgrade_date: string | null
          pending_downgrade_to: string | null
          previous_plan_slug: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_plan_slug?: string | null
          email: string
          id?: string
          pending_downgrade_date?: string | null
          pending_downgrade_to?: string | null
          previous_plan_slug?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_plan_slug?: string | null
          email?: string
          id?: string
          pending_downgrade_date?: string | null
          pending_downgrade_to?: string | null
          previous_plan_slug?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trip_goals: {
        Row: {
          created_at: string
          currency: string
          id: string
          target_amount: number
          trip_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          target_amount: number
          trip_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          target_amount?: number
          trip_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      subscribers_safe: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_plan_slug: string | null
          email: string | null
          id: string | null
          pending_downgrade_date: string | null
          pending_downgrade_to: string | null
          previous_plan_slug: string | null
          subscribed: boolean | null
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_plan_slug?: string | null
          email?: string | null
          id?: string | null
          pending_downgrade_date?: string | null
          pending_downgrade_to?: string | null
          previous_plan_slug?: string | null
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_plan_slug?: string | null
          email?: string | null
          id?: string | null
          pending_downgrade_date?: string | null
          pending_downgrade_to?: string | null
          previous_plan_slug?: string | null
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_coupon_click: {
        Args: { coupon_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "free" | "premium" | "gestor" | "admin"
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
      app_role: ["free", "premium", "gestor", "admin"],
    },
  },
} as const
