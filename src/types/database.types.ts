export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      boards: {
        Row: {
          id: string
          name: string
          state: Json
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          state: Json
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          state?: Json
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boards_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notes: {
        Row: {
          id: number
          text: string
          x: number
          y: number
          color: string
          board_id: string
          group_id: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: number
          text: string
          x: number
          y: number
          color: string
          board_id: string
          group_id?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: number
          text?: string
          x?: number
          y?: number
          color?: string
          board_id?: string
          group_id?: string | null
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_board_id_fkey"
            columns: ["board_id"]
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
  }
}