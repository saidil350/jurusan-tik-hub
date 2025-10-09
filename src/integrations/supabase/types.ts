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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      infokus: {
        Row: {
          created_at: string
          id: string
          keterangan: string | null
          merk: string | null
          nama_infokus: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          keterangan?: string | null
          merk?: string | null
          nama_infokus: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          keterangan?: string | null
          merk?: string | null
          nama_infokus?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      jadwal_dosen: {
        Row: {
          created_at: string
          dosen_id: string
          hari: string
          id: string
          jam_mulai: string
          jam_selesai: string
          mata_kuliah: string
          ruang_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosen_id: string
          hari: string
          id?: string
          jam_mulai: string
          jam_selesai: string
          mata_kuliah: string
          ruang_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosen_id?: string
          hari?: string
          id?: string
          jam_mulai?: string
          jam_selesai?: string
          mata_kuliah?: string
          ruang_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jadwal_dosen_dosen_id_fkey"
            columns: ["dosen_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jadwal_dosen_ruang_id_fkey"
            columns: ["ruang_id"]
            isOneToOne: false
            referencedRelation: "ruang"
            referencedColumns: ["id"]
          },
        ]
      }
      peminjaman: {
        Row: {
          catatan_admin: string | null
          created_at: string
          id: string
          item_id: string
          jenis_barang: Database["public"]["Enums"]["item_type"]
          keperluan: string
          status: Database["public"]["Enums"]["peminjaman_status"]
          updated_at: string
          user_id: string
          waktu_kembali: string
          waktu_pinjam: string
        }
        Insert: {
          catatan_admin?: string | null
          created_at?: string
          id?: string
          item_id: string
          jenis_barang: Database["public"]["Enums"]["item_type"]
          keperluan: string
          status?: Database["public"]["Enums"]["peminjaman_status"]
          updated_at?: string
          user_id: string
          waktu_kembali: string
          waktu_pinjam: string
        }
        Update: {
          catatan_admin?: string | null
          created_at?: string
          id?: string
          item_id?: string
          jenis_barang?: Database["public"]["Enums"]["item_type"]
          keperluan?: string
          status?: Database["public"]["Enums"]["peminjaman_status"]
          updated_at?: string
          user_id?: string
          waktu_kembali?: string
          waktu_pinjam?: string
        }
        Relationships: [
          {
            foreignKeyName: "peminjaman_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_access_log: {
        Row: {
          access_time: string
          access_type: string
          accessed_by_user_id: string
          accessed_profile_id: string
          id: string
        }
        Insert: {
          access_time?: string
          access_type: string
          accessed_by_user_id: string
          accessed_profile_id: string
          id?: string
        }
        Update: {
          access_time?: string
          access_type?: string
          accessed_by_user_id?: string
          accessed_profile_id?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          nim_nip: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          nim_nip?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          nim_nip?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      ruang: {
        Row: {
          created_at: string
          id: string
          keterangan: string | null
          lokasi: string | null
          nama_ruang: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          keterangan?: string | null
          lokasi?: string | null
          nama_ruang: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          keterangan?: string | null
          lokasi?: string | null
          nama_ruang?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_profiles_rls_enabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      item_type: "kunci_ruang" | "infokus"
      peminjaman_status:
        | "pending"
        | "disetujui"
        | "ditolak"
        | "selesai"
        | "dibatalkan"
      user_role: "mahasiswa" | "dosen" | "admin"
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
      item_type: ["kunci_ruang", "infokus"],
      peminjaman_status: [
        "pending",
        "disetujui",
        "ditolak",
        "selesai",
        "dibatalkan",
      ],
      user_role: ["mahasiswa", "dosen", "admin"],
    },
  },
} as const
