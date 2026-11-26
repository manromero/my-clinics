export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      activity: {
        Row: {
          activity_date: string;
          applied_irpf: number;
          applied_percentage: number;
          calculation_mode: string;
          clinic_id: number;
          description: string | null;
          direct_amount: number | null;
          gross: number | null;
          id: number;
          net: number | null;
          owner_id: string;
          price: number;
        };
        Insert: {
          activity_date: string;
          applied_irpf: number;
          applied_percentage: number;
          calculation_mode: string;
          clinic_id: number;
          description?: string | null;
          direct_amount?: number | null;
          gross?: number | null;
          id?: never;
          net?: number | null;
          owner_id: string;
          price: number;
        };
        Update: {
          activity_date?: string;
          applied_irpf?: number;
          applied_percentage?: number;
          calculation_mode?: string;
          clinic_id?: number;
          description?: string | null;
          direct_amount?: number | null;
          gross?: number | null;
          id?: never;
          net?: number | null;
          owner_id?: string;
          price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "activity_clinic_owner_fkey";
            columns: ["owner_id", "clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["owner_id", "id"];
          },
        ];
      };
      clinic_templates: {
        Row: {
          clinic_id: number;
          owner_id: string;
          template_id: string;
        };
        Insert: {
          clinic_id: number;
          owner_id: string;
          template_id: string;
        };
        Update: {
          clinic_id?: number;
          owner_id?: string;
          template_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clinic_template_owner";
            columns: ["owner_id", "clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["owner_id", "id"];
          },
          {
            foreignKeyName: "clinic_template_request_owner";
            columns: ["owner_id", "template_id"];
            isOneToOne: false;
            referencedRelation: "template_save_requests";
            referencedColumns: ["owner_id", "id"];
          },
        ];
      };
      clinics: {
        Row: {
          active: boolean;
          id: number;
          name: string;
          owner_id: string | null;
          percentage: number;
          template_revision: number;
        };
        Insert: {
          active?: boolean;
          id?: never;
          name: string;
          owner_id?: string | null;
          percentage: number;
          template_revision?: number;
        };
        Update: {
          active?: boolean;
          id?: never;
          name?: string;
          owner_id?: string | null;
          percentage?: number;
          template_revision?: number;
        };
        Relationships: [];
      };
      template_save_requests: {
        Row: {
          byte_count: number | null;
          created_at: string;
          expected_bytes: number | null;
          expected_sha256: string | null;
          expires_at: string;
          id: string;
          lease_id: string | null;
          lease_until: string | null;
          mode: string;
          original_filename: string | null;
          outcome: Json | null;
          owner_id: string;
          payload: Json;
          quarantine_cleaned_at: string | null;
          retired_at: string | null;
          sha256: string | null;
          state: string;
          validator_version: string | null;
        };
        Insert: {
          byte_count?: number | null;
          created_at?: string;
          expected_bytes?: number | null;
          expected_sha256?: string | null;
          expires_at?: string;
          id: string;
          lease_id?: string | null;
          lease_until?: string | null;
          mode: string;
          original_filename?: string | null;
          outcome?: Json | null;
          owner_id: string;
          payload: Json;
          quarantine_cleaned_at?: string | null;
          retired_at?: string | null;
          sha256?: string | null;
          state: string;
          validator_version?: string | null;
        };
        Update: {
          byte_count?: number | null;
          created_at?: string;
          expected_bytes?: number | null;
          expected_sha256?: string | null;
          expires_at?: string;
          id?: string;
          lease_id?: string | null;
          lease_until?: string | null;
          mode?: string;
          original_filename?: string | null;
          outcome?: Json | null;
          owner_id?: string;
          payload?: Json;
          quarantine_cleaned_at?: string | null;
          retired_at?: string | null;
          sha256?: string | null;
          state?: string;
          validator_version?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      activity_clinic_percentage: {
        Args: { clinic: number; owner: string };
        Returns: number;
      };
      activity_period_totals: {
        Args: { p_clinic_id?: string; p_end: string; p_start: string };
        Returns: {
          clinics: Json;
          gross: string;
          net: string;
          price: string;
          row_count: string;
        }[];
      };
      begin_template_save: {
        Args: {
          p_active: boolean;
          p_bytes: number;
          p_clinic: string;
          p_filename: string;
          p_id: string;
          p_mode: string;
          p_name: string;
          p_owner: string;
          p_percentage: number;
          p_revision: string;
          p_sha256: string;
        };
        Returns: Json;
      };
      cancel_template_save: {
        Args: { p_id: string; p_owner: string };
        Returns: Json;
      };
      claim_template_cleanup: { Args: { p_id: string }; Returns: Json };
      claim_template_validation: {
        Args: { p_id: string; p_owner: string };
        Returns: Json;
      };
      clinic_name_key: { Args: { value: string }; Returns: string };
      commit_template_save: {
        Args: { p_id: string; p_owner: string };
        Returns: Json;
      };
      create_activity: {
        Args: {
          p_activity_date: string;
          p_calculation_mode: string;
          p_clinic_id: string;
          p_description: string;
          p_direct_amount: string;
          p_price: string;
        };
        Returns: string;
      };
      delete_activity: { Args: { p_id: string }; Returns: string };
      delete_clinic: { Args: { p_id: string }; Returns: string };
      finish_template_cleanup: {
        Args: { p_id: string; p_lease: string };
        Returns: undefined;
      };
      finish_template_validation: {
        Args: {
          p_bytes: number;
          p_id: string;
          p_lease: string;
          p_owner: string;
          p_sha256: string;
          p_validator: string;
        };
        Returns: Json;
      };
      list_template_cleanup: { Args: never; Returns: Json };
      parse_activity_amount: { Args: { amount: string }; Returns: number };
      read_clinic_template: {
        Args: { p_clinic: string; p_owner: string; p_template: string };
        Returns: Json;
      };
      template_quarantine_cleanup: {
        Args: { p_finished?: boolean; p_id: string };
        Returns: Json;
      };
      template_request: {
        Args: { p_id: string; p_owner: string };
        Returns: Json;
      };
      template_upload_allowed: {
        Args: { object_name: string };
        Returns: boolean;
      };
      update_activity: {
        Args: {
          p_activity_date: string;
          p_calculation_mode: string;
          p_clinic_id: string;
          p_description: string;
          p_direct_amount: string;
          p_id: string;
          p_price: string;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
