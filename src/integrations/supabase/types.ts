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
      agents: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_active: boolean
          is_online: boolean
          languages: string[] | null
          last_active_at: string | null
          max_open_chats: number | null
          notes: string | null
          presence: string | null
          role: string | null
          skills: string[] | null
          status: string | null
          tenant_id: string
          timezone: string | null
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          is_online?: boolean
          languages?: string[] | null
          last_active_at?: string | null
          max_open_chats?: number | null
          notes?: string | null
          presence?: string | null
          role?: string | null
          skills?: string[] | null
          status?: string | null
          tenant_id: string
          timezone?: string | null
          updated_at?: string
          user_id: string
          weight?: number
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          is_online?: boolean
          languages?: string[] | null
          last_active_at?: string | null
          max_open_chats?: number | null
          notes?: string | null
          presence?: string | null
          role?: string | null
          skills?: string[] | null
          status?: string | null
          tenant_id?: string
          timezone?: string | null
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "agents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "agents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string | null
          tenant_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          tenant_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          tenant_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_cooldowns: {
        Row: {
          action_type:
            | Database["public"]["Enums"]["extended_action_type"]
            | null
          contact_id: string | null
          conversation_id: string | null
          cooldown_key: string
          created_at: string
          expires_at: string
          id: string
          node_id: string | null
          scope: Database["public"]["Enums"]["cooldown_scope"]
          tenant_id: string
          workflow_id: string | null
        }
        Insert: {
          action_type?:
            | Database["public"]["Enums"]["extended_action_type"]
            | null
          contact_id?: string | null
          conversation_id?: string | null
          cooldown_key: string
          created_at?: string
          expires_at: string
          id?: string
          node_id?: string | null
          scope: Database["public"]["Enums"]["cooldown_scope"]
          tenant_id: string
          workflow_id?: string | null
        }
        Update: {
          action_type?:
            | Database["public"]["Enums"]["extended_action_type"]
            | null
          contact_id?: string | null
          conversation_id?: string | null
          cooldown_key?: string
          created_at?: string
          expires_at?: string
          id?: string
          node_id?: string | null
          scope?: Database["public"]["Enums"]["cooldown_scope"]
          tenant_id?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_cooldowns_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_cooldowns_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_cooldowns_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "automation_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_cooldowns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "automation_cooldowns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_cooldowns_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_deadletters: {
        Row: {
          attempts: number
          created_at: string
          error: string | null
          error_details: Json | null
          error_type: string
          id: string
          max_attempts: number
          next_retry_at: string | null
          payload: Json
          resolved_at: string | null
          run_id: string | null
          tenant_id: string
          updated_at: string
          workflow_id: string | null
        }
        Insert: {
          attempts?: number
          created_at?: string
          error?: string | null
          error_details?: Json | null
          error_type: string
          id?: string
          max_attempts?: number
          next_retry_at?: string | null
          payload: Json
          resolved_at?: string | null
          run_id?: string | null
          tenant_id: string
          updated_at?: string
          workflow_id?: string | null
        }
        Update: {
          attempts?: number
          created_at?: string
          error?: string | null
          error_details?: Json | null
          error_type?: string
          id?: string
          max_attempts?: number
          next_retry_at?: string | null
          payload?: Json
          resolved_at?: string | null
          run_id?: string | null
          tenant_id?: string
          updated_at?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_deadletters_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "automation_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_deadletters_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "automation_deadletters_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_deadletters_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_edges: {
        Row: {
          condition: Json | null
          created_at: string
          from_node_id: string
          id: string
          label: string | null
          sort_order: number
          to_node_id: string
          workflow_id: string
        }
        Insert: {
          condition?: Json | null
          created_at?: string
          from_node_id: string
          id?: string
          label?: string | null
          sort_order?: number
          to_node_id: string
          workflow_id: string
        }
        Update: {
          condition?: Json | null
          created_at?: string
          from_node_id?: string
          id?: string
          label?: string | null
          sort_order?: number
          to_node_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_edges_from_node_id_fkey"
            columns: ["from_node_id"]
            isOneToOne: false
            referencedRelation: "automation_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_edges_to_node_id_fkey"
            columns: ["to_node_id"]
            isOneToOne: false
            referencedRelation: "automation_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_edges_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_loop_guards: {
        Row: {
          chain_depth: number
          chain_path: string[] | null
          contact_id: string | null
          conversation_id: string | null
          created_at: string
          expires_at: string
          id: string
          source_workflow_id: string | null
          target_workflow_id: string | null
          tenant_id: string
        }
        Insert: {
          chain_depth?: number
          chain_path?: string[] | null
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          expires_at: string
          id?: string
          source_workflow_id?: string | null
          target_workflow_id?: string | null
          tenant_id: string
        }
        Update: {
          chain_depth?: number
          chain_path?: string[] | null
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          source_workflow_id?: string | null
          target_workflow_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_loop_guards_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_loop_guards_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_loop_guards_source_workflow_id_fkey"
            columns: ["source_workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_loop_guards_target_workflow_id_fkey"
            columns: ["target_workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_loop_guards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "automation_loop_guards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_nodes: {
        Row: {
          config: Json
          created_at: string
          id: string
          name: string | null
          node_key: string
          position_x: number | null
          position_y: number | null
          sort_order: number
          type: Database["public"]["Enums"]["automation_node_type"]
          updated_at: string
          workflow_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          name?: string | null
          node_key: string
          position_x?: number | null
          position_y?: number | null
          sort_order?: number
          type: Database["public"]["Enums"]["automation_node_type"]
          updated_at?: string
          workflow_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          name?: string | null
          node_key?: string
          position_x?: number | null
          position_y?: number | null
          sort_order?: number
          type?: Database["public"]["Enums"]["automation_node_type"]
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_nodes_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rate_limits: {
        Row: {
          action_type:
            | Database["public"]["Enums"]["extended_action_type"]
            | null
          bucket_end: string
          bucket_start: string
          contact_id: string | null
          count: number
          created_at: string
          id: string
          limit_value: number
          node_id: string | null
          scope: Database["public"]["Enums"]["rate_limit_scope"]
          tenant_id: string
          updated_at: string
          workflow_id: string | null
        }
        Insert: {
          action_type?:
            | Database["public"]["Enums"]["extended_action_type"]
            | null
          bucket_end: string
          bucket_start: string
          contact_id?: string | null
          count?: number
          created_at?: string
          id?: string
          limit_value?: number
          node_id?: string | null
          scope: Database["public"]["Enums"]["rate_limit_scope"]
          tenant_id: string
          updated_at?: string
          workflow_id?: string | null
        }
        Update: {
          action_type?:
            | Database["public"]["Enums"]["extended_action_type"]
            | null
          bucket_end?: string
          bucket_start?: string
          contact_id?: string | null
          count?: number
          created_at?: string
          id?: string
          limit_value?: number
          node_id?: string | null
          scope?: Database["public"]["Enums"]["rate_limit_scope"]
          tenant_id?: string
          updated_at?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_rate_limits_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_rate_limits_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "automation_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_rate_limits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "automation_rate_limits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_rate_limits_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          action_config: Json
          action_type: Database["public"]["Enums"]["automation_action"]
          created_at: string
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean
          last_executed_at: string | null
          name: string
          tenant_id: string
          trigger_config: Json
          trigger_type: Database["public"]["Enums"]["automation_trigger"]
          updated_at: string
        }
        Insert: {
          action_config?: Json
          action_type: Database["public"]["Enums"]["automation_action"]
          created_at?: string
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          name: string
          tenant_id: string
          trigger_config?: Json
          trigger_type: Database["public"]["Enums"]["automation_trigger"]
          updated_at?: string
        }
        Update: {
          action_config?: Json
          action_type?: Database["public"]["Enums"]["automation_action"]
          created_at?: string
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          name?: string
          tenant_id?: string
          trigger_config?: Json
          trigger_type?: Database["public"]["Enums"]["automation_trigger"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "automation_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_runs: {
        Row: {
          contact_id: string | null
          conversation_id: string | null
          error: string | null
          error_details: Json | null
          finished_at: string | null
          id: string
          idempotency_key: string | null
          message_id: string | null
          messages_sent: number | null
          started_at: string
          status: Database["public"]["Enums"]["workflow_run_status"]
          steps_completed: number | null
          steps_total: number | null
          tenant_id: string
          trigger_payload: Json | null
          trigger_type: Database["public"]["Enums"]["extended_trigger_type"]
          workflow_id: string
        }
        Insert: {
          contact_id?: string | null
          conversation_id?: string | null
          error?: string | null
          error_details?: Json | null
          finished_at?: string | null
          id?: string
          idempotency_key?: string | null
          message_id?: string | null
          messages_sent?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["workflow_run_status"]
          steps_completed?: number | null
          steps_total?: number | null
          tenant_id: string
          trigger_payload?: Json | null
          trigger_type: Database["public"]["Enums"]["extended_trigger_type"]
          workflow_id: string
        }
        Update: {
          contact_id?: string | null
          conversation_id?: string | null
          error?: string | null
          error_details?: Json | null
          finished_at?: string | null
          id?: string
          idempotency_key?: string | null
          message_id?: string | null
          messages_sent?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["workflow_run_status"]
          steps_completed?: number | null
          steps_total?: number | null
          tenant_id?: string
          trigger_payload?: Json | null
          trigger_type?: Database["public"]["Enums"]["extended_trigger_type"]
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_runs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_runs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_runs_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "automation_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_scheduled_jobs: {
        Row: {
          attempts: number
          contact_id: string | null
          conversation_id: string | null
          created_at: string
          execute_at: string
          id: string
          last_error: string | null
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          node_id: string | null
          payload: Json
          run_id: string | null
          status: Database["public"]["Enums"]["scheduled_job_status"]
          tenant_id: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          attempts?: number
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          execute_at: string
          id?: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          node_id?: string | null
          payload?: Json
          run_id?: string | null
          status?: Database["public"]["Enums"]["scheduled_job_status"]
          tenant_id: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          attempts?: number
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          execute_at?: string
          id?: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          node_id?: string | null
          payload?: Json
          run_id?: string | null
          status?: Database["public"]["Enums"]["scheduled_job_status"]
          tenant_id?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_scheduled_jobs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_scheduled_jobs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_scheduled_jobs_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "automation_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_scheduled_jobs_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "automation_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_scheduled_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "automation_scheduled_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_scheduled_jobs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_steps: {
        Row: {
          duration_ms: number | null
          error: string | null
          error_details: Json | null
          finished_at: string | null
          id: string
          input_data: Json | null
          node_id: string
          node_name: string | null
          node_type: Database["public"]["Enums"]["automation_node_type"]
          output_data: Json | null
          run_id: string
          started_at: string
          status: Database["public"]["Enums"]["workflow_step_status"]
        }
        Insert: {
          duration_ms?: number | null
          error?: string | null
          error_details?: Json | null
          finished_at?: string | null
          id?: string
          input_data?: Json | null
          node_id: string
          node_name?: string | null
          node_type: Database["public"]["Enums"]["automation_node_type"]
          output_data?: Json | null
          run_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["workflow_step_status"]
        }
        Update: {
          duration_ms?: number | null
          error?: string | null
          error_details?: Json | null
          finished_at?: string | null
          id?: string
          input_data?: Json | null
          node_id?: string
          node_name?: string | null
          node_type?: Database["public"]["Enums"]["automation_node_type"]
          output_data?: Json | null
          run_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["workflow_step_status"]
        }
        Relationships: [
          {
            foreignKeyName: "automation_steps_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "automation_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_steps_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "automation_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_workflows: {
        Row: {
          business_hours_config: Json | null
          cooldown_seconds: number | null
          created_at: string
          created_by: string | null
          description: string | null
          enforce_opt_in_for_marketing: boolean
          id: string
          is_deleted: boolean
          max_messages_per_contact_per_day: number | null
          max_messages_per_hour: number | null
          max_runs_per_contact_per_day: number | null
          name: string
          status: Database["public"]["Enums"]["workflow_status"]
          stop_on_conversation_closed: boolean
          stop_on_customer_reply: boolean
          tenant_id: string
          timezone: string | null
          trigger_config: Json
          trigger_type: Database["public"]["Enums"]["extended_trigger_type"]
          updated_at: string
          version: number
        }
        Insert: {
          business_hours_config?: Json | null
          cooldown_seconds?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          enforce_opt_in_for_marketing?: boolean
          id?: string
          is_deleted?: boolean
          max_messages_per_contact_per_day?: number | null
          max_messages_per_hour?: number | null
          max_runs_per_contact_per_day?: number | null
          name: string
          status?: Database["public"]["Enums"]["workflow_status"]
          stop_on_conversation_closed?: boolean
          stop_on_customer_reply?: boolean
          tenant_id: string
          timezone?: string | null
          trigger_config?: Json
          trigger_type: Database["public"]["Enums"]["extended_trigger_type"]
          updated_at?: string
          version?: number
        }
        Update: {
          business_hours_config?: Json | null
          cooldown_seconds?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          enforce_opt_in_for_marketing?: boolean
          id?: string
          is_deleted?: boolean
          max_messages_per_contact_per_day?: number | null
          max_messages_per_hour?: number | null
          max_runs_per_contact_per_day?: number | null
          name?: string
          status?: Database["public"]["Enums"]["workflow_status"]
          stop_on_conversation_closed?: boolean
          stop_on_customer_reply?: boolean
          tenant_id?: string
          timezone?: string | null
          trigger_config?: Json
          trigger_type?: Database["public"]["Enums"]["extended_trigger_type"]
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "automation_workflows_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_workflows_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "automation_workflows_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_analytics: {
        Row: {
          campaign_id: string
          conversion_rate: number | null
          converted: number | null
          created_at: string
          delivered: number | null
          delivery_rate: number | null
          failed: number | null
          id: string
          queued: number | null
          read_count: number | null
          read_rate: number | null
          replied: number | null
          reply_rate: number | null
          sent: number | null
          skipped: number | null
          snapshot_hour: string
          tenant_id: string
        }
        Insert: {
          campaign_id: string
          conversion_rate?: number | null
          converted?: number | null
          created_at?: string
          delivered?: number | null
          delivery_rate?: number | null
          failed?: number | null
          id?: string
          queued?: number | null
          read_count?: number | null
          read_rate?: number | null
          replied?: number | null
          reply_rate?: number | null
          sent?: number | null
          skipped?: number | null
          snapshot_hour: string
          tenant_id: string
        }
        Update: {
          campaign_id?: string
          conversion_rate?: number | null
          converted?: number | null
          created_at?: string
          delivered?: number | null
          delivery_rate?: number | null
          failed?: number | null
          id?: string
          queued?: number | null
          read_count?: number | null
          read_rate?: number | null
          replied?: number | null
          reply_rate?: number | null
          sent?: number | null
          skipped?: number | null
          snapshot_hour?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_analytics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "campaign_analytics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_audiences: {
        Row: {
          campaign_id: string
          created_at: string
          duplicate_rows: number | null
          id: string
          invalid_rows: number | null
          original_filename: string | null
          processing_error: string | null
          processing_status: string | null
          segment_ids: string[] | null
          source: string
          storage_path: string | null
          tag_ids: string[] | null
          tenant_id: string
          total_rows: number | null
          updated_at: string
          valid_rows: number | null
        }
        Insert: {
          campaign_id: string
          created_at?: string
          duplicate_rows?: number | null
          id?: string
          invalid_rows?: number | null
          original_filename?: string | null
          processing_error?: string | null
          processing_status?: string | null
          segment_ids?: string[] | null
          source: string
          storage_path?: string | null
          tag_ids?: string[] | null
          tenant_id: string
          total_rows?: number | null
          updated_at?: string
          valid_rows?: number | null
        }
        Update: {
          campaign_id?: string
          created_at?: string
          duplicate_rows?: number | null
          id?: string
          invalid_rows?: number | null
          original_filename?: string | null
          processing_error?: string | null
          processing_status?: string | null
          segment_ids?: string[] | null
          source?: string
          storage_path?: string | null
          tag_ids?: string[] | null
          tenant_id?: string
          total_rows?: number | null
          updated_at?: string
          valid_rows?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_audiences_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_audiences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "campaign_audiences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_jobs: {
        Row: {
          attempts: number | null
          campaign_id: string
          contact_id: string
          created_at: string
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          failed_at: string | null
          header_media_url: string | null
          id: string
          locked_at: string | null
          locked_by: string | null
          max_attempts: number | null
          phone_number_id: string
          priority: number | null
          read_at: string | null
          recipient_name: string | null
          recipient_phone: string
          replied_at: string | null
          scheduled_at: string
          sent_at: string | null
          skip_reason: string | null
          status: Database["public"]["Enums"]["smeksh_job_status"]
          template_language: string
          template_name: string
          template_variables: Json | null
          tenant_id: string
          updated_at: string
          wamid: string | null
        }
        Insert: {
          attempts?: number | null
          campaign_id: string
          contact_id: string
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          failed_at?: string | null
          header_media_url?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number | null
          phone_number_id: string
          priority?: number | null
          read_at?: string | null
          recipient_name?: string | null
          recipient_phone: string
          replied_at?: string | null
          scheduled_at?: string
          sent_at?: string | null
          skip_reason?: string | null
          status?: Database["public"]["Enums"]["smeksh_job_status"]
          template_language?: string
          template_name: string
          template_variables?: Json | null
          tenant_id: string
          updated_at?: string
          wamid?: string | null
        }
        Update: {
          attempts?: number | null
          campaign_id?: string
          contact_id?: string
          created_at?: string
          delivered_at?: string | null
          error_code?: string | null
          error_message?: string | null
          failed_at?: string | null
          header_media_url?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number | null
          phone_number_id?: string
          priority?: number | null
          read_at?: string | null
          recipient_name?: string | null
          recipient_phone?: string
          replied_at?: string | null
          scheduled_at?: string
          sent_at?: string | null
          skip_reason?: string | null
          status?: Database["public"]["Enums"]["smeksh_job_status"]
          template_language?: string
          template_name?: string
          template_variables?: Json | null
          tenant_id?: string
          updated_at?: string
          wamid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_jobs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_jobs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_jobs_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "campaign_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_logs: {
        Row: {
          campaign_id: string
          contact_id: string
          created_at: string
          delivered_at: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          message_id: string | null
          read_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["message_status"]
        }
        Insert: {
          campaign_id: string
          contact_id: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          message_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"]
        }
        Update: {
          campaign_id?: string
          contact_id?: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          message_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"]
        }
        Relationships: [
          {
            foreignKeyName: "campaign_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_logs_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_templates: {
        Row: {
          audience_config: Json | null
          campaign_type:
            | Database["public"]["Enums"]["smeksh_campaign_type"]
            | null
          category: string | null
          created_at: string
          created_by: string | null
          delivery_config: Json | null
          description: string | null
          goal: Database["public"]["Enums"]["smeksh_campaign_goal"] | null
          id: string
          industry: string | null
          is_public: boolean | null
          name: string
          template_id: string | null
          template_variables: Json | null
          tenant_id: string
          updated_at: string
          use_count: number | null
        }
        Insert: {
          audience_config?: Json | null
          campaign_type?:
            | Database["public"]["Enums"]["smeksh_campaign_type"]
            | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          delivery_config?: Json | null
          description?: string | null
          goal?: Database["public"]["Enums"]["smeksh_campaign_goal"] | null
          id?: string
          industry?: string | null
          is_public?: boolean | null
          name: string
          template_id?: string | null
          template_variables?: Json | null
          tenant_id: string
          updated_at?: string
          use_count?: number | null
        }
        Update: {
          audience_config?: Json | null
          campaign_type?:
            | Database["public"]["Enums"]["smeksh_campaign_type"]
            | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          delivery_config?: Json | null
          description?: string | null
          goal?: Database["public"]["Enums"]["smeksh_campaign_goal"] | null
          id?: string
          industry?: string | null
          is_public?: boolean | null
          name?: string
          template_id?: string | null
          template_variables?: Json | null
          tenant_id?: string
          updated_at?: string
          use_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_templates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "campaign_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          ab_parent_id: string | null
          ab_split_ratio: number | null
          ab_variant: string | null
          ab_winner_metric: string | null
          audience_config: Json | null
          audience_source: string | null
          business_hours_only: boolean | null
          campaign_type:
            | Database["public"]["Enums"]["smeksh_campaign_type"]
            | null
          cancelled_at: string | null
          completed_at: string | null
          conversion_count: number | null
          conversion_tag_id: string | null
          created_at: string
          created_by: string | null
          delivered_count: number | null
          description: string | null
          error_message: string | null
          exclude_segments: string[] | null
          exclude_tags: string[] | null
          failed_count: number | null
          frequency_cap_days: number | null
          goal: Database["public"]["Enums"]["smeksh_campaign_goal"] | null
          header_media_type: string | null
          header_media_url: string | null
          id: string
          include_segments: string[] | null
          include_tags: string[] | null
          is_ab_test: boolean | null
          max_per_day: number | null
          max_per_hour: number | null
          messages_per_minute: number | null
          name: string
          paused_at: string | null
          phone_number_id: string
          processing_count: number | null
          queued_count: number | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          read_count: number | null
          replied_count: number | null
          scheduled_at: string | null
          sent_count: number | null
          skipped_count: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          target_tags: string[] | null
          template_id: string
          template_variables: Json | null
          tenant_id: string
          timezone: string | null
          total_recipients: number | null
          updated_at: string
        }
        Insert: {
          ab_parent_id?: string | null
          ab_split_ratio?: number | null
          ab_variant?: string | null
          ab_winner_metric?: string | null
          audience_config?: Json | null
          audience_source?: string | null
          business_hours_only?: boolean | null
          campaign_type?:
            | Database["public"]["Enums"]["smeksh_campaign_type"]
            | null
          cancelled_at?: string | null
          completed_at?: string | null
          conversion_count?: number | null
          conversion_tag_id?: string | null
          created_at?: string
          created_by?: string | null
          delivered_count?: number | null
          description?: string | null
          error_message?: string | null
          exclude_segments?: string[] | null
          exclude_tags?: string[] | null
          failed_count?: number | null
          frequency_cap_days?: number | null
          goal?: Database["public"]["Enums"]["smeksh_campaign_goal"] | null
          header_media_type?: string | null
          header_media_url?: string | null
          id?: string
          include_segments?: string[] | null
          include_tags?: string[] | null
          is_ab_test?: boolean | null
          max_per_day?: number | null
          max_per_hour?: number | null
          messages_per_minute?: number | null
          name: string
          paused_at?: string | null
          phone_number_id: string
          processing_count?: number | null
          queued_count?: number | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          read_count?: number | null
          replied_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          skipped_count?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_tags?: string[] | null
          template_id: string
          template_variables?: Json | null
          tenant_id: string
          timezone?: string | null
          total_recipients?: number | null
          updated_at?: string
        }
        Update: {
          ab_parent_id?: string | null
          ab_split_ratio?: number | null
          ab_variant?: string | null
          ab_winner_metric?: string | null
          audience_config?: Json | null
          audience_source?: string | null
          business_hours_only?: boolean | null
          campaign_type?:
            | Database["public"]["Enums"]["smeksh_campaign_type"]
            | null
          cancelled_at?: string | null
          completed_at?: string | null
          conversion_count?: number | null
          conversion_tag_id?: string | null
          created_at?: string
          created_by?: string | null
          delivered_count?: number | null
          description?: string | null
          error_message?: string | null
          exclude_segments?: string[] | null
          exclude_tags?: string[] | null
          failed_count?: number | null
          frequency_cap_days?: number | null
          goal?: Database["public"]["Enums"]["smeksh_campaign_goal"] | null
          header_media_type?: string | null
          header_media_url?: string | null
          id?: string
          include_segments?: string[] | null
          include_tags?: string[] | null
          is_ab_test?: boolean | null
          max_per_day?: number | null
          max_per_hour?: number | null
          messages_per_minute?: number | null
          name?: string
          paused_at?: string | null
          phone_number_id?: string
          processing_count?: number | null
          queued_count?: number | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          read_count?: number | null
          replied_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          skipped_count?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_tags?: string[] | null
          template_id?: string
          template_variables?: Json | null
          tenant_id?: string
          timezone?: string | null
          total_recipients?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_ab_parent_id_fkey"
            columns: ["ab_parent_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_conversion_tag_id_fkey"
            columns: ["conversion_tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_attributes: {
        Row: {
          contact_id: string
          key: string
          tenant_id: string
          updated_at: string
          value: string | null
        }
        Insert: {
          contact_id: string
          key: string
          tenant_id: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          contact_id?: string
          key?: string
          tenant_id?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_attributes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_attributes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "contact_attributes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_inbox_summary: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          claimed_at: string | null
          claimed_by: string | null
          contact_id: string
          is_unreplied: boolean
          last_inbound_at: string | null
          last_message_at: string | null
          last_outbound_at: string | null
          last_replied_at: string | null
          last_replied_by: string | null
          lead_state: string
          open_conversation_id: string | null
          phone_number_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          contact_id: string
          is_unreplied?: boolean
          last_inbound_at?: string | null
          last_message_at?: string | null
          last_outbound_at?: string | null
          last_replied_at?: string | null
          last_replied_by?: string | null
          lead_state?: string
          open_conversation_id?: string | null
          phone_number_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          contact_id?: string
          is_unreplied?: boolean
          last_inbound_at?: string | null
          last_message_at?: string | null
          last_outbound_at?: string | null
          last_replied_at?: string | null
          last_replied_by?: string | null
          lead_state?: string
          open_conversation_id?: string | null
          phone_number_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_inbox_summary_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_inbox_summary_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_inbox_summary_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_inbox_summary_last_replied_by_fkey"
            columns: ["last_replied_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_inbox_summary_open_conversation_id_fkey"
            columns: ["open_conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_inbox_summary_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "contact_inbox_summary_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_tags: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          tag_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          tag_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_tags_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_timeline: {
        Row: {
          actor_id: string | null
          actor_type: string | null
          contact_id: string
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          tenant_id: string
        }
        Insert: {
          actor_id?: string | null
          actor_type?: string | null
          contact_id: string
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          tenant_id: string
        }
        Update: {
          actor_id?: string | null
          actor_type?: string | null
          contact_id?: string
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_timeline_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_timeline_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_timeline_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "contact_timeline_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          ai_intent_detected: string | null
          assigned_agent_id: string | null
          automation_flow: string | null
          blocked_by_user: boolean | null
          bot_handled: boolean | null
          campaign_source: string | null
          closed: boolean | null
          closed_reason: string | null
          closure_time: string | null
          country: string | null
          created_at: string
          data_deletion_requested: boolean | null
          deal_stage: string | null
          entry_point: string | null
          first_message: string | null
          first_message_time: string | null
          first_name: string | null
          followup_due: string | null
          id: string
          intervened: boolean | null
          intervened_at: string | null
          intervened_by: string | null
          language: string | null
          last_active_date: string | null
          last_seen: string | null
          lead_status: string | null
          mau_status: string | null
          name: string | null
          next_best_action: string | null
          notes: string | null
          opt_in_source: string | null
          opt_in_status: boolean | null
          opt_in_timestamp: string | null
          opt_out: boolean | null
          opt_out_timestamp: string | null
          pricing_category: string | null
          priority_level: string | null
          profile_picture_url: string | null
          referrer_url: string | null
          request_time: string | null
          request_type: string | null
          segment: string | null
          sentiment_score: number | null
          sla_timer: string | null
          source: string | null
          tenant_id: string
          timezone: string | null
          updated_at: string
          wa_id: string
          whatsapp_quality_rating: string | null
        }
        Insert: {
          ai_intent_detected?: string | null
          assigned_agent_id?: string | null
          automation_flow?: string | null
          blocked_by_user?: boolean | null
          bot_handled?: boolean | null
          campaign_source?: string | null
          closed?: boolean | null
          closed_reason?: string | null
          closure_time?: string | null
          country?: string | null
          created_at?: string
          data_deletion_requested?: boolean | null
          deal_stage?: string | null
          entry_point?: string | null
          first_message?: string | null
          first_message_time?: string | null
          first_name?: string | null
          followup_due?: string | null
          id?: string
          intervened?: boolean | null
          intervened_at?: string | null
          intervened_by?: string | null
          language?: string | null
          last_active_date?: string | null
          last_seen?: string | null
          lead_status?: string | null
          mau_status?: string | null
          name?: string | null
          next_best_action?: string | null
          notes?: string | null
          opt_in_source?: string | null
          opt_in_status?: boolean | null
          opt_in_timestamp?: string | null
          opt_out?: boolean | null
          opt_out_timestamp?: string | null
          pricing_category?: string | null
          priority_level?: string | null
          profile_picture_url?: string | null
          referrer_url?: string | null
          request_time?: string | null
          request_type?: string | null
          segment?: string | null
          sentiment_score?: number | null
          sla_timer?: string | null
          source?: string | null
          tenant_id: string
          timezone?: string | null
          updated_at?: string
          wa_id: string
          whatsapp_quality_rating?: string | null
        }
        Update: {
          ai_intent_detected?: string | null
          assigned_agent_id?: string | null
          automation_flow?: string | null
          blocked_by_user?: boolean | null
          bot_handled?: boolean | null
          campaign_source?: string | null
          closed?: boolean | null
          closed_reason?: string | null
          closure_time?: string | null
          country?: string | null
          created_at?: string
          data_deletion_requested?: boolean | null
          deal_stage?: string | null
          entry_point?: string | null
          first_message?: string | null
          first_message_time?: string | null
          first_name?: string | null
          followup_due?: string | null
          id?: string
          intervened?: boolean | null
          intervened_at?: string | null
          intervened_by?: string | null
          language?: string | null
          last_active_date?: string | null
          last_seen?: string | null
          lead_status?: string | null
          mau_status?: string | null
          name?: string | null
          next_best_action?: string | null
          notes?: string | null
          opt_in_source?: string | null
          opt_in_status?: boolean | null
          opt_in_timestamp?: string | null
          opt_out?: boolean | null
          opt_out_timestamp?: string | null
          pricing_category?: string | null
          priority_level?: string | null
          profile_picture_url?: string | null
          referrer_url?: string | null
          request_time?: string | null
          request_type?: string | null
          segment?: string | null
          sentiment_score?: number | null
          sla_timer?: string | null
          source?: string | null
          tenant_id?: string
          timezone?: string | null
          updated_at?: string
          wa_id?: string
          whatsapp_quality_rating?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_intervened_by_fkey"
            columns: ["intervened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "contacts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_notes: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_notes_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "conversation_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          claimed_at: string | null
          claimed_by: string | null
          contact_id: string
          created_at: string
          first_response_at: string | null
          id: string
          intervened_at: string | null
          intervened_by: string | null
          is_intervened: boolean | null
          last_inbound_at: string | null
          last_message_at: string | null
          last_message_id: string | null
          last_message_preview: string | null
          last_opened_at: string | null
          last_opened_by: string | null
          locked_at: string | null
          locked_by: string | null
          phone_number_id: string | null
          priority: string | null
          sla_breached: boolean | null
          sla_first_response_due: string | null
          source: string | null
          status: Database["public"]["Enums"]["conversation_status"]
          tenant_id: string
          unread_count: number
          updated_at: string
          version: number
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          contact_id: string
          created_at?: string
          first_response_at?: string | null
          id?: string
          intervened_at?: string | null
          intervened_by?: string | null
          is_intervened?: boolean | null
          last_inbound_at?: string | null
          last_message_at?: string | null
          last_message_id?: string | null
          last_message_preview?: string | null
          last_opened_at?: string | null
          last_opened_by?: string | null
          locked_at?: string | null
          locked_by?: string | null
          phone_number_id?: string | null
          priority?: string | null
          sla_breached?: boolean | null
          sla_first_response_due?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["conversation_status"]
          tenant_id: string
          unread_count?: number
          updated_at?: string
          version?: number
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          contact_id?: string
          created_at?: string
          first_response_at?: string | null
          id?: string
          intervened_at?: string | null
          intervened_by?: string | null
          is_intervened?: boolean | null
          last_inbound_at?: string | null
          last_message_at?: string | null
          last_message_id?: string | null
          last_message_preview?: string | null
          last_opened_at?: string | null
          last_opened_by?: string | null
          locked_at?: string | null
          locked_by?: string | null
          phone_number_id?: string | null
          priority?: string | null
          sla_breached?: boolean | null
          sla_first_response_due?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["conversation_status"]
          tenant_id?: string
          unread_count?: number
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "conversations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_intervened_by_fkey"
            columns: ["intervened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_last_opened_by_fkey"
            columns: ["last_opened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_locked_by_fkey"
            columns: ["locked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      event_action_mappings: {
        Row: {
          action_config: Json
          action_type: string
          conditions: Json | null
          created_at: string | null
          event_type: string
          id: string
          is_active: boolean | null
          priority: number | null
          tenant_id: string
          tenant_integration_id: string
          updated_at: string | null
        }
        Insert: {
          action_config: Json
          action_type: string
          conditions?: Json | null
          created_at?: string | null
          event_type: string
          id?: string
          is_active?: boolean | null
          priority?: number | null
          tenant_id: string
          tenant_integration_id: string
          updated_at?: string | null
        }
        Update: {
          action_config?: Json
          action_type?: string
          conditions?: Json | null
          created_at?: string | null
          event_type?: string
          id?: string
          is_active?: boolean | null
          priority?: number | null
          tenant_id?: string
          tenant_integration_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_action_mappings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "event_action_mappings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_action_mappings_tenant_integration_id_fkey"
            columns: ["tenant_integration_id"]
            isOneToOne: false
            referencedRelation: "tenant_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_diagnostics: {
        Row: {
          code: string
          created_at: string
          flow_id: string
          id: string
          message: string
          meta: Json
          node_key: string | null
          severity: string
          tenant_id: string
        }
        Insert: {
          code: string
          created_at?: string
          flow_id: string
          id?: string
          message: string
          meta?: Json
          node_key?: string | null
          severity: string
          tenant_id: string
        }
        Update: {
          code?: string
          created_at?: string
          flow_id?: string
          id?: string
          message?: string
          meta?: Json
          node_key?: string | null
          severity?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_diagnostics_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_diagnostics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "flow_diagnostics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_edges: {
        Row: {
          config: Json
          created_at: string
          edge_key: string
          flow_id: string
          id: string
          label: string | null
          source_handle: string | null
          source_node_key: string
          target_handle: string | null
          target_node_key: string
          tenant_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          edge_key: string
          flow_id: string
          id?: string
          label?: string | null
          source_handle?: string | null
          source_node_key: string
          target_handle?: string | null
          target_node_key: string
          tenant_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          edge_key?: string
          flow_id?: string
          id?: string
          label?: string | null
          source_handle?: string | null
          source_node_key?: string
          target_handle?: string | null
          target_node_key?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_edges_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_edges_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "flow_edges_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_events: {
        Row: {
          created_at: string
          event_type: string
          flow_id: string | null
          id: string
          meta: Json
          node_key: string | null
          session_id: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          flow_id?: string | null
          id?: string
          meta?: Json
          node_key?: string | null
          session_id?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          flow_id?: string | null
          id?: string
          meta?: Json
          node_key?: string | null
          session_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_events_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "flow_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "flow_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_nodes: {
        Row: {
          chapter: string | null
          config: Json
          created_at: string
          flow_id: string
          id: string
          label: string | null
          node_key: string
          node_type: string
          position_x: number
          position_y: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          chapter?: string | null
          config?: Json
          created_at?: string
          flow_id: string
          id?: string
          label?: string | null
          node_key: string
          node_type: string
          position_x?: number
          position_y?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          chapter?: string | null
          config?: Json
          created_at?: string
          flow_id?: string
          id?: string
          label?: string | null
          node_key?: string
          node_type?: string
          position_x?: number
          position_y?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_nodes_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_nodes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "flow_nodes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_sessions: {
        Row: {
          contact_id: string | null
          context: Json
          conversation_id: string | null
          current_node_key: string | null
          ended_at: string | null
          flow_id: string
          id: string
          phone_number_id: string | null
          started_at: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          contact_id?: string | null
          context?: Json
          conversation_id?: string | null
          current_node_key?: string | null
          ended_at?: string | null
          flow_id: string
          id?: string
          phone_number_id?: string | null
          started_at?: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          contact_id?: string | null
          context?: Json
          conversation_id?: string | null
          current_node_key?: string | null
          ended_at?: string | null
          flow_id?: string
          id?: string
          phone_number_id?: string | null
          started_at?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_sessions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_sessions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_sessions_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_sessions_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "flow_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_templates: {
        Row: {
          category: string
          created_at: string
          expected_uplift: string | null
          goal: string | null
          id: string
          is_pro: boolean
          preview_json: Json
          subtitle: string | null
          tags: string[]
          template_key: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          expected_uplift?: string | null
          goal?: string | null
          id?: string
          is_pro?: boolean
          preview_json?: Json
          subtitle?: string | null
          tags?: string[]
          template_key: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          expected_uplift?: string | null
          goal?: string | null
          id?: string
          is_pro?: boolean
          preview_json?: Json
          subtitle?: string | null
          tags?: string[]
          template_key?: string
          title?: string
        }
        Relationships: []
      }
      flow_triggers: {
        Row: {
          config: Json
          created_at: string
          flow_id: string
          id: string
          is_enabled: boolean
          phone_number_id: string | null
          priority: number
          tenant_id: string
          trigger_type: Database["public"]["Enums"]["flow_trigger_type"]
        }
        Insert: {
          config?: Json
          created_at?: string
          flow_id: string
          id?: string
          is_enabled?: boolean
          phone_number_id?: string | null
          priority?: number
          tenant_id: string
          trigger_type: Database["public"]["Enums"]["flow_trigger_type"]
        }
        Update: {
          config?: Json
          created_at?: string
          flow_id?: string
          id?: string
          is_enabled?: boolean
          phone_number_id?: string | null
          priority?: number
          tenant_id?: string
          trigger_type?: Database["public"]["Enums"]["flow_trigger_type"]
        }
        Relationships: [
          {
            foreignKeyName: "flow_triggers_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_triggers_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_triggers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "flow_triggers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_versions: {
        Row: {
          created_at: string
          created_by: string
          edges_json: Json
          flow_id: string
          id: string
          nodes_json: Json
          published_at: string | null
          status: Database["public"]["Enums"]["flow_version_status"]
          tenant_id: string
          triggers_json: Json
          version_number: number
        }
        Insert: {
          created_at?: string
          created_by: string
          edges_json?: Json
          flow_id: string
          id?: string
          nodes_json?: Json
          published_at?: string | null
          status?: Database["public"]["Enums"]["flow_version_status"]
          tenant_id: string
          triggers_json?: Json
          version_number: number
        }
        Update: {
          created_at?: string
          created_by?: string
          edges_json?: Json
          flow_id?: string
          id?: string
          nodes_json?: Json
          published_at?: string | null
          status?: Database["public"]["Enums"]["flow_version_status"]
          tenant_id?: string
          triggers_json?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "flow_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_versions_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_versions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "flow_versions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      flows: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          emoji: string | null
          folder: string | null
          health_score: number
          id: string
          is_pro: boolean
          name: string
          phone_number_id: string | null
          status: Database["public"]["Enums"]["flow_status"]
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          emoji?: string | null
          folder?: string | null
          health_score?: number
          id?: string
          is_pro?: boolean
          name: string
          phone_number_id?: string | null
          status?: Database["public"]["Enums"]["flow_status"]
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          emoji?: string | null
          folder?: string | null
          health_score?: number
          id?: string
          is_pro?: boolean
          name?: string
          phone_number_id?: string | null
          status?: Database["public"]["Enums"]["flow_status"]
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flows_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flows_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flows_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "flows_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flows_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      form_rule_logs: {
        Row: {
          contact_id: string | null
          conversation_id: string | null
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          rule_id: string
          skip_reason: string | null
          status: string
          tenant_id: string
          trigger_data: Json | null
        }
        Insert: {
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          rule_id: string
          skip_reason?: string | null
          status: string
          tenant_id: string
          trigger_data?: Json | null
        }
        Update: {
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          rule_id?: string
          skip_reason?: string | null
          status?: string
          tenant_id?: string
          trigger_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "form_rule_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_rule_logs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_rule_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "form_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_rule_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "form_rule_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      form_rules: {
        Row: {
          business_hours_only: boolean | null
          conditions: Json | null
          cooldown_minutes: number | null
          created_at: string
          created_by: string | null
          description: string | null
          execution_count: number | null
          form_id: string | null
          form_language: string | null
          form_template_name: string | null
          form_variables: Json | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          max_sends_per_contact_per_day: number | null
          name: string
          priority: number | null
          require_opt_in: boolean | null
          tenant_id: string
          trigger_config: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          business_hours_only?: boolean | null
          conditions?: Json | null
          cooldown_minutes?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          form_id?: string | null
          form_language?: string | null
          form_template_name?: string | null
          form_variables?: Json | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          max_sends_per_contact_per_day?: number | null
          name: string
          priority?: number | null
          require_opt_in?: boolean | null
          tenant_id: string
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
        }
        Update: {
          business_hours_only?: boolean | null
          conditions?: Json | null
          cooldown_minutes?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          form_id?: string | null
          form_language?: string | null
          form_template_name?: string | null
          form_variables?: Json | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          max_sends_per_contact_per_day?: number | null
          name?: string
          priority?: number | null
          require_opt_in?: boolean | null
          tenant_id?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_rules_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "form_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      guide_examples: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          guide_id: string
          id: string
          is_good_example: boolean | null
          language: string | null
          sort_order: number | null
          title: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          guide_id: string
          id?: string
          is_good_example?: boolean | null
          language?: string | null
          sort_order?: number | null
          title: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          guide_id?: string
          id?: string
          is_good_example?: boolean | null
          language?: string | null
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_examples_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_relations: {
        Row: {
          created_at: string
          guide_id: string
          id: string
          related_guide_id: string
          relation_type: string | null
        }
        Insert: {
          created_at?: string
          guide_id: string
          id?: string
          related_guide_id: string
          relation_type?: string | null
        }
        Update: {
          created_at?: string
          guide_id?: string
          id?: string
          related_guide_id?: string
          relation_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guide_relations_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guide_relations_related_guide_id_fkey"
            columns: ["related_guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_sections: {
        Row: {
          content: string
          created_at: string
          guide_id: string
          id: string
          section_type: string
          sort_order: number | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          guide_id: string
          id?: string
          section_type: string
          sort_order?: number | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          guide_id?: string
          id?: string
          section_type?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_sections_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
        ]
      }
      guides: {
        Row: {
          category_id: string | null
          content: string
          created_at: string
          created_by: string | null
          difficulty: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          reading_time_minutes: number | null
          sidebar_key: string | null
          slug: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          difficulty?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          reading_time_minutes?: number | null
          sidebar_key?: string | null
          slug: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          difficulty?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          reading_time_minutes?: number | null
          sidebar_key?: string | null
          slug?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guides_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "guide_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_catalog: {
        Row: {
          auth_type: string
          category: string
          config_schema: Json | null
          created_at: string | null
          description: string | null
          documentation_url: string | null
          id: string
          is_active: boolean | null
          is_pro_only: boolean | null
          key: string
          logo_url: string | null
          name: string
          setup_time_minutes: number | null
          supported_events: Json | null
          updated_at: string | null
        }
        Insert: {
          auth_type?: string
          category: string
          config_schema?: Json | null
          created_at?: string | null
          description?: string | null
          documentation_url?: string | null
          id?: string
          is_active?: boolean | null
          is_pro_only?: boolean | null
          key: string
          logo_url?: string | null
          name: string
          setup_time_minutes?: number | null
          supported_events?: Json | null
          updated_at?: string | null
        }
        Update: {
          auth_type?: string
          category?: string
          config_schema?: Json | null
          created_at?: string | null
          description?: string | null
          documentation_url?: string | null
          id?: string
          is_active?: boolean | null
          is_pro_only?: boolean | null
          key?: string
          logo_url?: string | null
          name?: string
          setup_time_minutes?: number | null
          supported_events?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      integration_events: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_id: string | null
          event_type: string
          id: string
          next_retry_at: string | null
          payload: Json
          processed_at: string | null
          processing_started_at: string | null
          retry_count: number | null
          status: string
          tenant_id: string
          tenant_integration_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_id?: string | null
          event_type: string
          id?: string
          next_retry_at?: string | null
          payload: Json
          processed_at?: string | null
          processing_started_at?: string | null
          retry_count?: number | null
          status?: string
          tenant_id: string
          tenant_integration_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_id?: string | null
          event_type?: string
          id?: string
          next_retry_at?: string | null
          payload?: Json
          processed_at?: string | null
          processing_started_at?: string | null
          retry_count?: number | null
          status?: string
          tenant_id?: string
          tenant_integration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "integration_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_events_tenant_integration_id_fkey"
            columns: ["tenant_integration_id"]
            isOneToOne: false
            referencedRelation: "tenant_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      member_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          phone_number_ids: string[] | null
          role_id: string | null
          team_ids: string[] | null
          tenant_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          phone_number_ids?: string[] | null
          role_id?: string | null
          team_ids?: string[] | null
          tenant_id: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          phone_number_ids?: string[] | null
          role_id?: string | null
          team_ids?: string[] | null
          tenant_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_invites_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_invites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "member_invites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      member_performance: {
        Row: {
          assigned_chats: number | null
          avg_resolution_time_seconds: number | null
          avg_response_time_seconds: number | null
          created_at: string
          csat_score: number | null
          date: string
          id: string
          messages_sent: number | null
          resolved_chats: number | null
          sla_breaches: number | null
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_chats?: number | null
          avg_resolution_time_seconds?: number | null
          avg_response_time_seconds?: number | null
          created_at?: string
          csat_score?: number | null
          date: string
          id?: string
          messages_sent?: number | null
          resolved_chats?: number | null
          sla_breaches?: number | null
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_chats?: number | null
          avg_resolution_time_seconds?: number | null
          avg_response_time_seconds?: number | null
          created_at?: string
          csat_score?: number | null
          date?: string
          id?: string
          messages_sent?: number | null
          resolved_chats?: number | null
          sla_breaches?: number | null
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_performance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "member_performance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_performance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          context_message_id: string | null
          conversation_id: string
          created_at: string
          delivered_at: string | null
          direction: Database["public"]["Enums"]["message_direction"]
          error_code: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          media_bucket: string | null
          media_filename: string | null
          media_mime_type: string | null
          media_path: string | null
          media_size_bytes: number | null
          media_url: string | null
          metadata: Json | null
          raw: Json | null
          read_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["message_status"]
          tenant_id: string
          text: string | null
          type: Database["public"]["Enums"]["message_type"]
          updated_at: string
          wamid: string | null
        }
        Insert: {
          context_message_id?: string | null
          conversation_id: string
          created_at?: string
          delivered_at?: string | null
          direction: Database["public"]["Enums"]["message_direction"]
          error_code?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          media_bucket?: string | null
          media_filename?: string | null
          media_mime_type?: string | null
          media_path?: string | null
          media_size_bytes?: number | null
          media_url?: string | null
          metadata?: Json | null
          raw?: Json | null
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          tenant_id: string
          text?: string | null
          type?: Database["public"]["Enums"]["message_type"]
          updated_at?: string
          wamid?: string | null
        }
        Update: {
          context_message_id?: string | null
          conversation_id?: string
          created_at?: string
          delivered_at?: string | null
          direction?: Database["public"]["Enums"]["message_direction"]
          error_code?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          media_bucket?: string | null
          media_filename?: string | null
          media_mime_type?: string | null
          media_path?: string | null
          media_size_bytes?: number | null
          media_url?: string | null
          metadata?: Json | null
          raw?: Json | null
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          tenant_id?: string
          text?: string | null
          type?: Database["public"]["Enums"]["message_type"]
          updated_at?: string
          wamid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string
          description: string | null
          id: string
          key: string
          name: string
          sort_order: number | null
        }
        Insert: {
          category: string
          description?: string | null
          id?: string
          key: string
          name: string
          sort_order?: number | null
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          key?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      phone_numbers: {
        Row: {
          created_at: string
          display_number: string
          id: string
          is_default: boolean | null
          last_webhook_at: string | null
          messaging_limit: string | null
          phone_number_id: string
          quality_rating: Database["public"]["Enums"]["quality_rating"]
          status: Database["public"]["Enums"]["phone_status"]
          tenant_id: string
          updated_at: string
          verified_name: string | null
          waba_account_id: string
          webhook_health: string | null
        }
        Insert: {
          created_at?: string
          display_number: string
          id?: string
          is_default?: boolean | null
          last_webhook_at?: string | null
          messaging_limit?: string | null
          phone_number_id: string
          quality_rating?: Database["public"]["Enums"]["quality_rating"]
          status?: Database["public"]["Enums"]["phone_status"]
          tenant_id: string
          updated_at?: string
          verified_name?: string | null
          waba_account_id: string
          webhook_health?: string | null
        }
        Update: {
          created_at?: string
          display_number?: string
          id?: string
          is_default?: boolean | null
          last_webhook_at?: string | null
          messaging_limit?: string | null
          phone_number_id?: string
          quality_rating?: Database["public"]["Enums"]["quality_rating"]
          status?: Database["public"]["Enums"]["phone_status"]
          tenant_id?: string
          updated_at?: string
          verified_name?: string | null
          waba_account_id?: string
          webhook_health?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phone_numbers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "phone_numbers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phone_numbers_waba_account_id_fkey"
            columns: ["waba_account_id"]
            isOneToOne: false
            referencedRelation: "waba_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phone_numbers_waba_account_id_fkey"
            columns: ["waba_account_id"]
            isOneToOne: false
            referencedRelation: "waba_accounts_public"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          limits_json: Json
          name: string
          price_monthly: number
          price_yearly: number | null
          sort_order: number | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          limits_json?: Json
          name: string
          price_monthly?: number
          price_yearly?: number | null
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          limits_json?: Json
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      platform_admins: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean
          notes: string | null
          role: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          role?: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          role?: Database["public"]["Enums"]["platform_role"]
          user_id?: string
        }
        Relationships: []
      }
      platform_audit_logs: {
        Row: {
          action: string
          actor_role: string
          actor_user_id: string
          after_data: Json | null
          before_data: Json | null
          created_at: string
          id: string
          ip: string | null
          note: string | null
          target_id: string | null
          target_table: string | null
          user_agent: string | null
          workspace_id: string | null
        }
        Insert: {
          action: string
          actor_role: string
          actor_user_id: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          ip?: string | null
          note?: string | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
          workspace_id?: string | null
        }
        Update: {
          action?: string
          actor_role?: string
          actor_user_id?: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          ip?: string | null
          note?: string | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      platform_billing_events: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          event_type: string
          id: string
          occurred_at: string
          payload: Json | null
          provider: string
          provider_event_id: string | null
          status: string
          workspace_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string | null
          currency?: string
          event_type: string
          id?: string
          occurred_at?: string
          payload?: Json | null
          provider: string
          provider_event_id?: string | null
          status?: string
          workspace_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          event_type?: string
          id?: string
          occurred_at?: string
          payload?: Json | null
          provider?: string
          provider_event_id?: string | null
          status?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_billing_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "platform_billing_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_incident_events: {
        Row: {
          actor_user_id: string | null
          created_at: string
          description: string
          event_type: string
          id: string
          incident_id: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          description: string
          event_type: string
          id?: string
          incident_id: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          incident_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_incident_events_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "platform_incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_incidents: {
        Row: {
          actions_taken: string | null
          affected_systems: string[] | null
          created_at: string
          declared_by: string | null
          description: string | null
          id: string
          resolved_at: string | null
          resolved_by: string | null
          root_cause: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          actions_taken?: string | null
          affected_systems?: string[] | null
          created_at?: string
          declared_by?: string | null
          description?: string | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          root_cause?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          actions_taken?: string | null
          affected_systems?: string[] | null
          created_at?: string
          declared_by?: string | null
          description?: string | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          root_cause?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_invoices: {
        Row: {
          amount: number
          billed_to: Json
          created_at: string | null
          currency: string
          id: string
          invoice_number: string
          line_items: Json
          pdf_path: string | null
          period_end: string | null
          period_start: string | null
          provider: string
          provider_invoice_id: string | null
          status: string
          workspace_id: string
        }
        Insert: {
          amount: number
          billed_to?: Json
          created_at?: string | null
          currency?: string
          id?: string
          invoice_number: string
          line_items?: Json
          pdf_path?: string | null
          period_end?: string | null
          period_start?: string | null
          provider: string
          provider_invoice_id?: string | null
          status?: string
          workspace_id: string
        }
        Update: {
          amount?: number
          billed_to?: Json
          created_at?: string | null
          currency?: string
          id?: string
          invoice_number?: string
          line_items?: Json
          pdf_path?: string | null
          period_end?: string | null
          period_start?: string | null
          provider?: string
          provider_invoice_id?: string | null
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_invoices_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "platform_invoices_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_payments: {
        Row: {
          amount: number
          billing_cycle: string | null
          created_at: string | null
          currency: string
          id: string
          metadata: Json | null
          plan_id: string | null
          provider: string
          provider_invoice_id: string | null
          provider_order_id: string | null
          provider_payment_id: string | null
          provider_subscription_id: string | null
          status: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          amount: number
          billing_cycle?: string | null
          created_at?: string | null
          currency?: string
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          provider: string
          provider_invoice_id?: string | null
          provider_order_id?: string | null
          provider_payment_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          amount?: number
          billing_cycle?: string | null
          created_at?: string | null
          currency?: string
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          provider?: string
          provider_invoice_id?: string | null
          provider_order_id?: string | null
          provider_payment_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "platform_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_payments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "platform_payments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_plans: {
        Row: {
          addons: Json
          badge: string | null
          created_at: string | null
          features: Json
          highlight: boolean | null
          id: string
          is_active: boolean | null
          is_custom: boolean | null
          limits: Json
          name: string
          price_monthly: number
          price_yearly: number | null
          restrictions: Json | null
          sort_order: number | null
          tagline: string | null
        }
        Insert: {
          addons?: Json
          badge?: string | null
          created_at?: string | null
          features?: Json
          highlight?: boolean | null
          id: string
          is_active?: boolean | null
          is_custom?: boolean | null
          limits?: Json
          name: string
          price_monthly?: number
          price_yearly?: number | null
          restrictions?: Json | null
          sort_order?: number | null
          tagline?: string | null
        }
        Update: {
          addons?: Json
          badge?: string | null
          created_at?: string | null
          features?: Json
          highlight?: boolean | null
          id?: string
          is_active?: boolean | null
          is_custom?: boolean | null
          limits?: Json
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          restrictions?: Json | null
          sort_order?: number | null
          tagline?: string | null
        }
        Relationships: []
      }
      platform_risk_events: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string | null
          id: string
          ip: string | null
          meta: Json | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string | null
          id?: string
          ip?: string | null
          meta?: Json | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string | null
          id?: string
          ip?: string | null
          meta?: Json | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          industry: string | null
          onboarding_step: string | null
          primary_goal: string | null
          team_size: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          industry?: string | null
          onboarding_step?: string | null
          primary_goal?: string | null
          team_size?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          industry?: string | null
          onboarding_step?: string | null
          primary_goal?: string | null
          team_size?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rate_limit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          tenant_id: string
        }
        Insert: {
          action?: string
          created_at?: string
          id?: string
          tenant_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_limit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "rate_limit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role_id?: string
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
          base_role: string
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          base_role?: string
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          base_role?: string
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      round_robin_state: {
        Row: {
          cursor: number
          team_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          cursor?: number
          team_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          cursor?: number
          team_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "round_robin_state_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "smeksh_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round_robin_state_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round_robin_state_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "round_robin_state_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      routing_rules: {
        Row: {
          assign_to_team_id: string | null
          assign_to_user_id: string | null
          condition_config: Json
          condition_type: string
          created_at: string
          description: string | null
          fallback_strategy: string | null
          id: string
          is_active: boolean
          name: string
          priority: number
          strategy: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          assign_to_team_id?: string | null
          assign_to_user_id?: string | null
          condition_config?: Json
          condition_type: string
          created_at?: string
          description?: string | null
          fallback_strategy?: string | null
          id?: string
          is_active?: boolean
          name: string
          priority?: number
          strategy?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          assign_to_team_id?: string | null
          assign_to_user_id?: string | null
          condition_config?: Json
          condition_type?: string
          created_at?: string
          description?: string | null
          fallback_strategy?: string | null
          id?: string
          is_active?: boolean
          name?: string
          priority?: number
          strategy?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "routing_rules_assign_to_team_id_fkey"
            columns: ["assign_to_team_id"]
            isOneToOne: false
            referencedRelation: "smeksh_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routing_rules_assign_to_team_id_fkey"
            columns: ["assign_to_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routing_rules_assign_to_user_id_fkey"
            columns: ["assign_to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routing_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "routing_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_meta: {
        Row: {
          canonical_url: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          keywords: string | null
          locale: string
          og_description: string | null
          og_image: string | null
          og_title: string | null
          og_type: string
          page_id: string
          robots: string
          schema_jsonld: Json | null
          title: string
          twitter_card: string
          twitter_description: string | null
          twitter_image: string | null
          twitter_title: string | null
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          keywords?: string | null
          locale?: string
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string
          page_id: string
          robots?: string
          schema_jsonld?: Json | null
          title: string
          twitter_card?: string
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          keywords?: string | null
          locale?: string
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string
          page_id?: string
          robots?: string
          schema_jsonld?: Json | null
          title?: string
          twitter_card?: string
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "seo_meta_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "seo_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_pages: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          page_key: string
          page_name: string
          route_path: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          page_key: string
          page_name: string
          route_path: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          page_key?: string
          page_name?: string
          route_path?: string
          updated_at?: string
        }
        Relationships: []
      }
      sla_settings: {
        Row: {
          after_hours_auto_reply: boolean
          created_at: string
          escalate_on_breach: boolean
          escalate_to_team_lead: boolean
          first_response_minutes: number
          follow_up_minutes: number
          id: string
          is_active: boolean
          name: string
          resolution_hours: number | null
          team_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          after_hours_auto_reply?: boolean
          created_at?: string
          escalate_on_breach?: boolean
          escalate_to_team_lead?: boolean
          first_response_minutes?: number
          follow_up_minutes?: number
          id?: string
          is_active?: boolean
          name: string
          resolution_hours?: number | null
          team_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          after_hours_auto_reply?: boolean
          created_at?: string
          escalate_on_breach?: boolean
          escalate_to_team_lead?: boolean
          first_response_minutes?: number
          follow_up_minutes?: number
          id?: string
          is_active?: boolean
          name?: string
          resolution_hours?: number | null
          team_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_settings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "smeksh_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_settings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "sla_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_campaign_ab_tests: {
        Row: {
          campaign_id: string
          created_at: string
          ended_at: string | null
          id: string
          split_ratio_a: number
          split_ratio_b: number
          started_at: string | null
          status: Database["public"]["Enums"]["smeksh_ab_status"]
          template_a_components: Json
          template_a_language: string
          template_a_name: string
          template_b_components: Json
          template_b_language: string
          template_b_name: string
          tenant_id: string
          updated_at: string
          variable_map_a: Json
          variable_map_b: Json
          winner_metric: Database["public"]["Enums"]["smeksh_winner_metric"]
          winner_variant: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          split_ratio_a?: number
          split_ratio_b?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["smeksh_ab_status"]
          template_a_components?: Json
          template_a_language?: string
          template_a_name?: string
          template_b_components?: Json
          template_b_language?: string
          template_b_name?: string
          tenant_id: string
          updated_at?: string
          variable_map_a?: Json
          variable_map_b?: Json
          winner_metric?: Database["public"]["Enums"]["smeksh_winner_metric"]
          winner_variant?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          split_ratio_a?: number
          split_ratio_b?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["smeksh_ab_status"]
          template_a_components?: Json
          template_a_language?: string
          template_a_name?: string
          template_b_components?: Json
          template_b_language?: string
          template_b_name?: string
          tenant_id?: string
          updated_at?: string
          variable_map_a?: Json
          variable_map_b?: Json
          winner_metric?: Database["public"]["Enums"]["smeksh_winner_metric"]
          winner_variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_campaign_ab_tests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "smeksh_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_campaign_ab_tests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_campaign_ab_tests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_campaign_audiences: {
        Row: {
          campaign_id: string
          created_at: string
          csv_storage_path: string | null
          deduped_count: number
          estimated_count: number
          exclude_tags: string[] | null
          excluded_frequencycap_count: number
          excluded_optout_count: number
          filter_tree: Json
          id: string
          include_tags: string[] | null
          invalid_count: number
          segment_id: string | null
          source: Database["public"]["Enums"]["smeksh_audience_source"]
          tenant_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          csv_storage_path?: string | null
          deduped_count?: number
          estimated_count?: number
          exclude_tags?: string[] | null
          excluded_frequencycap_count?: number
          excluded_optout_count?: number
          filter_tree?: Json
          id?: string
          include_tags?: string[] | null
          invalid_count?: number
          segment_id?: string | null
          source: Database["public"]["Enums"]["smeksh_audience_source"]
          tenant_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          csv_storage_path?: string | null
          deduped_count?: number
          estimated_count?: number
          exclude_tags?: string[] | null
          excluded_frequencycap_count?: number
          excluded_optout_count?: number
          filter_tree?: Json
          id?: string
          include_tags?: string[] | null
          invalid_count?: number
          segment_id?: string | null
          source?: Database["public"]["Enums"]["smeksh_audience_source"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_campaign_audiences_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "smeksh_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_campaign_audiences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_campaign_audiences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_campaign_events: {
        Row: {
          campaign_id: string
          contact_id: string | null
          created_at: string
          details: Json
          event_type: Database["public"]["Enums"]["smeksh_event_type"]
          id: string
          job_id: string | null
          occurred_at: string
          tenant_id: string
          wa_message_id: string | null
        }
        Insert: {
          campaign_id: string
          contact_id?: string | null
          created_at?: string
          details?: Json
          event_type: Database["public"]["Enums"]["smeksh_event_type"]
          id?: string
          job_id?: string | null
          occurred_at?: string
          tenant_id: string
          wa_message_id?: string | null
        }
        Update: {
          campaign_id?: string
          contact_id?: string | null
          created_at?: string
          details?: Json
          event_type?: Database["public"]["Enums"]["smeksh_event_type"]
          id?: string
          job_id?: string | null
          occurred_at?: string
          tenant_id?: string
          wa_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_campaign_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "smeksh_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_campaign_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_campaign_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "smeksh_campaign_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_campaign_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_campaign_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_campaign_jobs: {
        Row: {
          ab_variant: string | null
          attempts: number
          campaign_id: string
          contact_id: string | null
          created_at: string
          error_code: string | null
          error_message: string | null
          execute_at: string
          id: string
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          next_retry_at: string | null
          phone_e164: string
          rendered_payload: Json
          status: Database["public"]["Enums"]["smeksh_job_status"]
          tenant_id: string
          updated_at: string
          wa_message_id: string | null
        }
        Insert: {
          ab_variant?: string | null
          attempts?: number
          campaign_id: string
          contact_id?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          execute_at?: string
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          next_retry_at?: string | null
          phone_e164: string
          rendered_payload?: Json
          status?: Database["public"]["Enums"]["smeksh_job_status"]
          tenant_id: string
          updated_at?: string
          wa_message_id?: string | null
        }
        Update: {
          ab_variant?: string | null
          attempts?: number
          campaign_id?: string
          contact_id?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          execute_at?: string
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          next_retry_at?: string | null
          phone_e164?: string
          rendered_payload?: Json
          status?: Database["public"]["Enums"]["smeksh_job_status"]
          tenant_id?: string
          updated_at?: string
          wa_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_campaign_jobs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "smeksh_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_campaign_jobs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_campaign_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_campaign_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_campaign_reports: {
        Row: {
          campaign_id: string
          created_at: string
          created_by: string | null
          error: string | null
          id: string
          report_type: string
          status: Database["public"]["Enums"]["smeksh_report_status"]
          storage_bucket: string
          storage_path: string | null
          summary: Json
          tenant_id: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          report_type?: string
          status?: Database["public"]["Enums"]["smeksh_report_status"]
          storage_bucket?: string
          storage_path?: string | null
          summary?: Json
          tenant_id: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          report_type?: string
          status?: Database["public"]["Enums"]["smeksh_report_status"]
          storage_bucket?: string
          storage_path?: string | null
          summary?: Json
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_campaign_reports_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "smeksh_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_campaign_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_campaign_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_campaigns: {
        Row: {
          audience_estimated: number
          business_hours_only: boolean
          campaign_type: Database["public"]["Enums"]["smeksh_campaign_type"]
          cancelled_count: number
          created_at: string
          created_by: string | null
          delivered_count: number
          description: string | null
          enforce_opt_in: boolean
          exclude_recently_messaged_hours: number | null
          failed_count: number
          frequency_cap_days: number | null
          id: string
          max_per_day: number | null
          name: string
          phone_number_id: string | null
          queued_count: number
          quiet_hours: Json | null
          read_count: number
          replied_count: number
          require_opt_in_for_marketing: boolean
          scheduled_at: string | null
          send_mode: string
          sent_count: number
          skipped_count: number
          status: Database["public"]["Enums"]["smeksh_campaign_status"]
          template_category: string | null
          template_components: Json
          template_language: string
          template_name: string
          tenant_id: string
          throttle_per_hour: number | null
          throttle_per_minute: number
          timezone: string | null
          updated_at: string
          variable_map: Json
          waba_id: string | null
        }
        Insert: {
          audience_estimated?: number
          business_hours_only?: boolean
          campaign_type?: Database["public"]["Enums"]["smeksh_campaign_type"]
          cancelled_count?: number
          created_at?: string
          created_by?: string | null
          delivered_count?: number
          description?: string | null
          enforce_opt_in?: boolean
          exclude_recently_messaged_hours?: number | null
          failed_count?: number
          frequency_cap_days?: number | null
          id?: string
          max_per_day?: number | null
          name: string
          phone_number_id?: string | null
          queued_count?: number
          quiet_hours?: Json | null
          read_count?: number
          replied_count?: number
          require_opt_in_for_marketing?: boolean
          scheduled_at?: string | null
          send_mode?: string
          sent_count?: number
          skipped_count?: number
          status?: Database["public"]["Enums"]["smeksh_campaign_status"]
          template_category?: string | null
          template_components?: Json
          template_language?: string
          template_name?: string
          tenant_id: string
          throttle_per_hour?: number | null
          throttle_per_minute?: number
          timezone?: string | null
          updated_at?: string
          variable_map?: Json
          waba_id?: string | null
        }
        Update: {
          audience_estimated?: number
          business_hours_only?: boolean
          campaign_type?: Database["public"]["Enums"]["smeksh_campaign_type"]
          cancelled_count?: number
          created_at?: string
          created_by?: string | null
          delivered_count?: number
          description?: string | null
          enforce_opt_in?: boolean
          exclude_recently_messaged_hours?: number | null
          failed_count?: number
          frequency_cap_days?: number | null
          id?: string
          max_per_day?: number | null
          name?: string
          phone_number_id?: string | null
          queued_count?: number
          quiet_hours?: Json | null
          read_count?: number
          replied_count?: number
          require_opt_in_for_marketing?: boolean
          scheduled_at?: string | null
          send_mode?: string
          sent_count?: number
          skipped_count?: number
          status?: Database["public"]["Enums"]["smeksh_campaign_status"]
          template_category?: string | null
          template_components?: Json
          template_language?: string
          template_name?: string
          tenant_id?: string
          throttle_per_hour?: number | null
          throttle_per_minute?: number
          timezone?: string | null
          updated_at?: string
          variable_map?: Json
          waba_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_contact_attributes: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          is_indexed: boolean
          key: string
          label: string | null
          options: Json | null
          type: Database["public"]["Enums"]["smeksh_attribute_type"]
          updated_at: string
          value_bool: boolean | null
          value_date: string | null
          value_datetime: string | null
          value_json: Json | null
          value_number: number | null
          value_text: string | null
          workspace_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          is_indexed?: boolean
          key: string
          label?: string | null
          options?: Json | null
          type?: Database["public"]["Enums"]["smeksh_attribute_type"]
          updated_at?: string
          value_bool?: boolean | null
          value_date?: string | null
          value_datetime?: string | null
          value_json?: Json | null
          value_number?: number | null
          value_text?: string | null
          workspace_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          is_indexed?: boolean
          key?: string
          label?: string | null
          options?: Json | null
          type?: Database["public"]["Enums"]["smeksh_attribute_type"]
          updated_at?: string
          value_bool?: boolean | null
          value_date?: string | null
          value_datetime?: string | null
          value_json?: Json | null
          value_number?: number | null
          value_text?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_contact_attributes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "smeksh_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_contact_attributes_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_contact_attributes_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_contact_tags: {
        Row: {
          applied_at: string
          applied_by: string | null
          applied_source: string | null
          contact_id: string
          id: string
          tag_id: string
          workspace_id: string
        }
        Insert: {
          applied_at?: string
          applied_by?: string | null
          applied_source?: string | null
          contact_id: string
          id?: string
          tag_id: string
          workspace_id: string
        }
        Update: {
          applied_at?: string
          applied_by?: string | null
          applied_source?: string | null
          contact_id?: string
          id?: string
          tag_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_contact_tags_applied_by_fkey"
            columns: ["applied_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_contact_tags_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "smeksh_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_contact_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_contact_tags_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_contact_tags_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_contacts: {
        Row: {
          ai_intent_detected: string | null
          assigned_team_id: string | null
          assigned_to: string | null
          blocked_by_user: boolean
          campaign_source: string | null
          closed: boolean
          closed_reason: string | null
          closure_time: string | null
          contact_name: string | null
          country_code: string | null
          created_at: string
          data_deletion_requested: boolean
          data_deletion_requested_at: string | null
          deal_stage: Database["public"]["Enums"]["smeksh_deal_stage"]
          email: string | null
          entry_point: string | null
          first_message: string | null
          first_message_at: string | null
          first_name: string | null
          followup_due: string | null
          id: string
          intervened: boolean
          intervened_at: string | null
          intervened_by: string | null
          intervention_reason: string | null
          language: string | null
          last_active_date: string | null
          last_inbound_at: string | null
          last_message_at: string | null
          last_name: string | null
          last_outbound_at: string | null
          lead_status: Database["public"]["Enums"]["smeksh_lead_status"]
          mau_status: Database["public"]["Enums"]["smeksh_mau_status"]
          next_best_action: string | null
          notes: string | null
          opt_in_source:
            | Database["public"]["Enums"]["smeksh_optin_source"]
            | null
          opt_in_status: boolean
          opt_in_timestamp: string | null
          opt_out: boolean
          opt_out_timestamp: string | null
          phone_e164: string
          pricing_category: string | null
          profile_picture_url: string | null
          referrer_url: string | null
          request_time: string | null
          request_type: string | null
          requested: boolean
          sentiment_score: string | null
          sla_timer_seconds: number | null
          source: string | null
          status: Database["public"]["Enums"]["smeksh_contact_status"]
          timezone: string | null
          updated_at: string
          wa_id: string | null
          whatsapp_conversation_status:
            | Database["public"]["Enums"]["smeksh_conversation_status"]
            | null
          whatsapp_quality_rating: string | null
          workspace_id: string
        }
        Insert: {
          ai_intent_detected?: string | null
          assigned_team_id?: string | null
          assigned_to?: string | null
          blocked_by_user?: boolean
          campaign_source?: string | null
          closed?: boolean
          closed_reason?: string | null
          closure_time?: string | null
          contact_name?: string | null
          country_code?: string | null
          created_at?: string
          data_deletion_requested?: boolean
          data_deletion_requested_at?: string | null
          deal_stage?: Database["public"]["Enums"]["smeksh_deal_stage"]
          email?: string | null
          entry_point?: string | null
          first_message?: string | null
          first_message_at?: string | null
          first_name?: string | null
          followup_due?: string | null
          id?: string
          intervened?: boolean
          intervened_at?: string | null
          intervened_by?: string | null
          intervention_reason?: string | null
          language?: string | null
          last_active_date?: string | null
          last_inbound_at?: string | null
          last_message_at?: string | null
          last_name?: string | null
          last_outbound_at?: string | null
          lead_status?: Database["public"]["Enums"]["smeksh_lead_status"]
          mau_status?: Database["public"]["Enums"]["smeksh_mau_status"]
          next_best_action?: string | null
          notes?: string | null
          opt_in_source?:
            | Database["public"]["Enums"]["smeksh_optin_source"]
            | null
          opt_in_status?: boolean
          opt_in_timestamp?: string | null
          opt_out?: boolean
          opt_out_timestamp?: string | null
          phone_e164: string
          pricing_category?: string | null
          profile_picture_url?: string | null
          referrer_url?: string | null
          request_time?: string | null
          request_type?: string | null
          requested?: boolean
          sentiment_score?: string | null
          sla_timer_seconds?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["smeksh_contact_status"]
          timezone?: string | null
          updated_at?: string
          wa_id?: string | null
          whatsapp_conversation_status?:
            | Database["public"]["Enums"]["smeksh_conversation_status"]
            | null
          whatsapp_quality_rating?: string | null
          workspace_id: string
        }
        Update: {
          ai_intent_detected?: string | null
          assigned_team_id?: string | null
          assigned_to?: string | null
          blocked_by_user?: boolean
          campaign_source?: string | null
          closed?: boolean
          closed_reason?: string | null
          closure_time?: string | null
          contact_name?: string | null
          country_code?: string | null
          created_at?: string
          data_deletion_requested?: boolean
          data_deletion_requested_at?: string | null
          deal_stage?: Database["public"]["Enums"]["smeksh_deal_stage"]
          email?: string | null
          entry_point?: string | null
          first_message?: string | null
          first_message_at?: string | null
          first_name?: string | null
          followup_due?: string | null
          id?: string
          intervened?: boolean
          intervened_at?: string | null
          intervened_by?: string | null
          intervention_reason?: string | null
          language?: string | null
          last_active_date?: string | null
          last_inbound_at?: string | null
          last_message_at?: string | null
          last_name?: string | null
          last_outbound_at?: string | null
          lead_status?: Database["public"]["Enums"]["smeksh_lead_status"]
          mau_status?: Database["public"]["Enums"]["smeksh_mau_status"]
          next_best_action?: string | null
          notes?: string | null
          opt_in_source?:
            | Database["public"]["Enums"]["smeksh_optin_source"]
            | null
          opt_in_status?: boolean
          opt_in_timestamp?: string | null
          opt_out?: boolean
          opt_out_timestamp?: string | null
          phone_e164?: string
          pricing_category?: string | null
          profile_picture_url?: string | null
          referrer_url?: string | null
          request_time?: string | null
          request_type?: string | null
          requested?: boolean
          sentiment_score?: string | null
          sla_timer_seconds?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["smeksh_contact_status"]
          timezone?: string | null
          updated_at?: string
          wa_id?: string | null
          whatsapp_conversation_status?:
            | Database["public"]["Enums"]["smeksh_conversation_status"]
            | null
          whatsapp_quality_rating?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_contacts_assigned_team_id_fkey"
            columns: ["assigned_team_id"]
            isOneToOne: false
            referencedRelation: "smeksh_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_contacts_assigned_team_id_fkey"
            columns: ["assigned_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_contacts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_contacts_intervened_by_fkey"
            columns: ["intervened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_contacts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_contacts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_conversation_events: {
        Row: {
          actor_profile_id: string | null
          actor_type: string
          automation_workflow_id: string | null
          campaign_id: string | null
          contact_id: string | null
          conversation_id: string
          created_at: string
          ctwa_lead_id: string | null
          details: Json
          event_type: Database["public"]["Enums"]["smeksh_conversation_event_type"]
          from_assigned_to: string | null
          id: string
          message_id: string | null
          new_value: string | null
          old_value: string | null
          tag_id: string | null
          tag_name: string | null
          tag_reason: string | null
          team_id: string | null
          tenant_id: string
          to_assigned_to: string | null
        }
        Insert: {
          actor_profile_id?: string | null
          actor_type?: string
          automation_workflow_id?: string | null
          campaign_id?: string | null
          contact_id?: string | null
          conversation_id: string
          created_at?: string
          ctwa_lead_id?: string | null
          details?: Json
          event_type: Database["public"]["Enums"]["smeksh_conversation_event_type"]
          from_assigned_to?: string | null
          id?: string
          message_id?: string | null
          new_value?: string | null
          old_value?: string | null
          tag_id?: string | null
          tag_name?: string | null
          tag_reason?: string | null
          team_id?: string | null
          tenant_id: string
          to_assigned_to?: string | null
        }
        Update: {
          actor_profile_id?: string | null
          actor_type?: string
          automation_workflow_id?: string | null
          campaign_id?: string | null
          contact_id?: string | null
          conversation_id?: string
          created_at?: string
          ctwa_lead_id?: string | null
          details?: Json
          event_type?: Database["public"]["Enums"]["smeksh_conversation_event_type"]
          from_assigned_to?: string | null
          id?: string
          message_id?: string | null
          new_value?: string | null
          old_value?: string | null
          tag_id?: string | null
          tag_name?: string | null
          tag_reason?: string | null
          team_id?: string | null
          tenant_id?: string
          to_assigned_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_conversation_events_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_conversation_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_conversation_events_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_conversation_events_from_assigned_to_fkey"
            columns: ["from_assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_conversation_events_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "smeksh_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_conversation_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_conversation_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_conversation_events_to_assigned_to_fkey"
            columns: ["to_assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_conversation_reads: {
        Row: {
          conversation_id: string
          last_read_at: string
          last_read_message_id: string | null
          profile_id: string
          tenant_id: string
        }
        Insert: {
          conversation_id: string
          last_read_at?: string
          last_read_message_id?: string | null
          profile_id: string
          tenant_id: string
        }
        Update: {
          conversation_id?: string
          last_read_at?: string
          last_read_message_id?: string | null
          profile_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_conversation_reads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_conversation_reads_last_read_message_id_fkey"
            columns: ["last_read_message_id"]
            isOneToOne: false
            referencedRelation: "smeksh_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_conversation_reads_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_conversation_reads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_conversation_reads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_conversation_snoozes: {
        Row: {
          contact_id: string | null
          conversation_id: string
          created_at: string
          id: string
          reason: string | null
          snooze_until: string
          snoozed_by_profile_id: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          contact_id?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          reason?: string | null
          snooze_until: string
          snoozed_by_profile_id?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          contact_id?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          snooze_until?: string
          snoozed_by_profile_id?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_conversation_snoozes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_conversation_snoozes_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_conversation_snoozes_snoozed_by_profile_id_fkey"
            columns: ["snoozed_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_conversation_snoozes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_conversation_snoozes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_data_requests: {
        Row: {
          contact_id: string | null
          created_at: string
          id: string
          notes: string | null
          phone_e164: string | null
          processed_at: string | null
          processed_by: string | null
          request_type: string
          requested_at: string
          status: string
          updated_at: string
          wa_id: string | null
          workspace_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          phone_e164?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_type: string
          requested_at?: string
          status?: string
          updated_at?: string
          wa_id?: string | null
          workspace_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          phone_e164?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_type?: string
          requested_at?: string
          status?: string
          updated_at?: string
          wa_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_data_requests_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "smeksh_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_data_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_data_requests_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_data_requests_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_import_job_errors: {
        Row: {
          created_at: string
          error: string
          id: string
          import_job_id: string
          raw_row: Json | null
          row_number: number
          workspace_id: string
        }
        Insert: {
          created_at?: string
          error: string
          id?: string
          import_job_id: string
          raw_row?: Json | null
          row_number: number
          workspace_id: string
        }
        Update: {
          created_at?: string
          error?: string
          id?: string
          import_job_id?: string
          raw_row?: Json | null
          row_number?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_import_job_errors_import_job_id_fkey"
            columns: ["import_job_id"]
            isOneToOne: false
            referencedRelation: "smeksh_import_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_import_job_errors_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_import_job_errors_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_import_jobs: {
        Row: {
          column_mapping: Json
          created_at: string
          created_by: string | null
          created_count: number
          dedupe_key: string
          dedupe_mode: string
          default_source: string | null
          default_tags: string[] | null
          details: Json
          error_count: number
          error_report_path: string | null
          finished_at: string | null
          id: string
          last_error: string | null
          original_filename: string | null
          processed_rows: number
          skipped_count: number
          started_at: string | null
          status: Database["public"]["Enums"]["smeksh_import_status"]
          storage_bucket: string
          storage_path: string
          total_rows: number
          updated_at: string
          updated_count: number
          workspace_id: string
        }
        Insert: {
          column_mapping?: Json
          created_at?: string
          created_by?: string | null
          created_count?: number
          dedupe_key?: string
          dedupe_mode?: string
          default_source?: string | null
          default_tags?: string[] | null
          details?: Json
          error_count?: number
          error_report_path?: string | null
          finished_at?: string | null
          id?: string
          last_error?: string | null
          original_filename?: string | null
          processed_rows?: number
          skipped_count?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["smeksh_import_status"]
          storage_bucket?: string
          storage_path: string
          total_rows?: number
          updated_at?: string
          updated_count?: number
          workspace_id: string
        }
        Update: {
          column_mapping?: Json
          created_at?: string
          created_by?: string | null
          created_count?: number
          dedupe_key?: string
          dedupe_mode?: string
          default_source?: string | null
          default_tags?: string[] | null
          details?: Json
          error_count?: number
          error_report_path?: string | null
          finished_at?: string | null
          id?: string
          last_error?: string | null
          original_filename?: string | null
          processed_rows?: number
          skipped_count?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["smeksh_import_status"]
          storage_bucket?: string
          storage_path?: string
          total_rows?: number
          updated_at?: string
          updated_count?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_import_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_import_jobs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_import_jobs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_internal_notes: {
        Row: {
          attachments: Json
          author_profile_id: string | null
          body: string
          contact_id: string | null
          conversation_id: string
          created_at: string
          id: string
          mentions_profile_ids: string[] | null
          tenant_id: string
          updated_at: string
          visibility: Database["public"]["Enums"]["smeksh_note_visibility"]
        }
        Insert: {
          attachments?: Json
          author_profile_id?: string | null
          body: string
          contact_id?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          mentions_profile_ids?: string[] | null
          tenant_id: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["smeksh_note_visibility"]
        }
        Update: {
          attachments?: Json
          author_profile_id?: string | null
          body?: string
          contact_id?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          mentions_profile_ids?: string[] | null
          tenant_id?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["smeksh_note_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_internal_notes_author_profile_id_fkey"
            columns: ["author_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_internal_notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_internal_notes_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_internal_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_internal_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_message_status_events: {
        Row: {
          created_at: string
          error_code: string | null
          error_message: string | null
          id: string
          message_id: string | null
          phone_number_id: string | null
          raw: Json
          recipient_wa_id: string | null
          status: Database["public"]["Enums"]["smeksh_wa_status"]
          status_at: string
          tenant_id: string
          wa_message_id: string | null
          waba_id: string | null
        }
        Insert: {
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          message_id?: string | null
          phone_number_id?: string | null
          raw?: Json
          recipient_wa_id?: string | null
          status: Database["public"]["Enums"]["smeksh_wa_status"]
          status_at?: string
          tenant_id: string
          wa_message_id?: string | null
          waba_id?: string | null
        }
        Update: {
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          message_id?: string | null
          phone_number_id?: string | null
          raw?: Json
          recipient_wa_id?: string | null
          status?: Database["public"]["Enums"]["smeksh_wa_status"]
          status_at?: string
          tenant_id?: string
          wa_message_id?: string | null
          waba_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_message_status_events_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "smeksh_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_message_status_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_message_status_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_messages: {
        Row: {
          body_text: string | null
          contact_id: string | null
          conversation_id: string
          created_at: string
          direction: Database["public"]["Enums"]["smeksh_message_direction"]
          error_code: string | null
          error_message: string | null
          id: string
          is_failed: boolean
          latest_status: Database["public"]["Enums"]["smeksh_wa_status"] | null
          latest_status_at: string | null
          media_bucket: string | null
          media_mime_type: string | null
          media_path: string | null
          media_size_bytes: number | null
          media_url: string | null
          message_type: Database["public"]["Enums"]["smeksh_message_type"]
          payload: Json
          sent_by_profile_id: string | null
          template_category: string | null
          template_language: string | null
          template_name: string | null
          template_variables: Json | null
          tenant_id: string
          updated_at: string
          wa_context_id: string | null
          wa_message_id: string | null
        }
        Insert: {
          body_text?: string | null
          contact_id?: string | null
          conversation_id: string
          created_at?: string
          direction: Database["public"]["Enums"]["smeksh_message_direction"]
          error_code?: string | null
          error_message?: string | null
          id?: string
          is_failed?: boolean
          latest_status?: Database["public"]["Enums"]["smeksh_wa_status"] | null
          latest_status_at?: string | null
          media_bucket?: string | null
          media_mime_type?: string | null
          media_path?: string | null
          media_size_bytes?: number | null
          media_url?: string | null
          message_type?: Database["public"]["Enums"]["smeksh_message_type"]
          payload?: Json
          sent_by_profile_id?: string | null
          template_category?: string | null
          template_language?: string | null
          template_name?: string | null
          template_variables?: Json | null
          tenant_id: string
          updated_at?: string
          wa_context_id?: string | null
          wa_message_id?: string | null
        }
        Update: {
          body_text?: string | null
          contact_id?: string | null
          conversation_id?: string
          created_at?: string
          direction?: Database["public"]["Enums"]["smeksh_message_direction"]
          error_code?: string | null
          error_message?: string | null
          id?: string
          is_failed?: boolean
          latest_status?: Database["public"]["Enums"]["smeksh_wa_status"] | null
          latest_status_at?: string | null
          media_bucket?: string | null
          media_mime_type?: string | null
          media_path?: string | null
          media_size_bytes?: number | null
          media_url?: string | null
          message_type?: Database["public"]["Enums"]["smeksh_message_type"]
          payload?: Json
          sent_by_profile_id?: string | null
          template_category?: string | null
          template_language?: string | null
          template_name?: string | null
          template_variables?: Json | null
          tenant_id?: string
          updated_at?: string
          wa_context_id?: string | null
          wa_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_messages_sent_by_profile_id_fkey"
            columns: ["sent_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_meta_ad_accounts: {
        Row: {
          access_token_encrypted: string | null
          connected_by: string | null
          created_at: string
          facebook_page_id: string | null
          facebook_page_name: string | null
          id: string
          is_active: boolean
          last_synced_at: string | null
          meta_access_token: string | null
          meta_account_id: string
          meta_account_name: string | null
          meta_user_id: string | null
          meta_user_name: string | null
          setup_data: Json | null
          status: Database["public"]["Enums"]["smeksh_meta_connection_status"]
          sync_error: string | null
          token_expires_at: string | null
          updated_at: string
          whatsapp_display_number: string | null
          whatsapp_phone_number_id: string | null
          workspace_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          connected_by?: string | null
          created_at?: string
          facebook_page_id?: string | null
          facebook_page_name?: string | null
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          meta_access_token?: string | null
          meta_account_id: string
          meta_account_name?: string | null
          meta_user_id?: string | null
          meta_user_name?: string | null
          setup_data?: Json | null
          status?: Database["public"]["Enums"]["smeksh_meta_connection_status"]
          sync_error?: string | null
          token_expires_at?: string | null
          updated_at?: string
          whatsapp_display_number?: string | null
          whatsapp_phone_number_id?: string | null
          workspace_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          connected_by?: string | null
          created_at?: string
          facebook_page_id?: string | null
          facebook_page_name?: string | null
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          meta_access_token?: string | null
          meta_account_id?: string
          meta_account_name?: string | null
          meta_user_id?: string | null
          meta_user_name?: string | null
          setup_data?: Json | null
          status?: Database["public"]["Enums"]["smeksh_meta_connection_status"]
          sync_error?: string | null
          token_expires_at?: string | null
          updated_at?: string
          whatsapp_display_number?: string | null
          whatsapp_phone_number_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_meta_ad_accounts_connected_by_fkey"
            columns: ["connected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_meta_ad_accounts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_meta_ad_accounts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_meta_ad_automations: {
        Row: {
          actions: Json
          created_at: string
          created_by: string | null
          description: string | null
          executions_count: number | null
          id: string
          is_active: boolean
          last_executed_at: string | null
          name: string
          trigger_ad_account_id: string | null
          trigger_campaign_ids: string[] | null
          trigger_conditions: Json | null
          trigger_type: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          actions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          executions_count?: number | null
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          name: string
          trigger_ad_account_id?: string | null
          trigger_campaign_ids?: string[] | null
          trigger_conditions?: Json | null
          trigger_type: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          actions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          executions_count?: number | null
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          name?: string
          trigger_ad_account_id?: string | null
          trigger_campaign_ids?: string[] | null
          trigger_conditions?: Json | null
          trigger_type?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_meta_ad_automations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_meta_ad_automations_trigger_ad_account_id_fkey"
            columns: ["trigger_ad_account_id"]
            isOneToOne: false
            referencedRelation: "smeksh_meta_ad_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_meta_ad_automations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_meta_ad_automations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_meta_ad_campaigns: {
        Row: {
          ad_account_id: string
          ad_creative_id: string | null
          ad_creative_preview_url: string | null
          ad_name: string | null
          adset_name: string | null
          campaign_name: string
          campaign_objective: string | null
          clicks: number | null
          conversations_started: number | null
          cpc: number | null
          cpl: number | null
          created_at: string
          ctr: number | null
          end_date: string | null
          id: string
          impressions: number | null
          last_synced_at: string | null
          leads_count: number | null
          meta_ad_id: string | null
          meta_adset_id: string | null
          meta_campaign_id: string
          raw_meta_data: Json | null
          spend_amount: number | null
          spend_currency: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["smeksh_ad_status"]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          ad_account_id: string
          ad_creative_id?: string | null
          ad_creative_preview_url?: string | null
          ad_name?: string | null
          adset_name?: string | null
          campaign_name: string
          campaign_objective?: string | null
          clicks?: number | null
          conversations_started?: number | null
          cpc?: number | null
          cpl?: number | null
          created_at?: string
          ctr?: number | null
          end_date?: string | null
          id?: string
          impressions?: number | null
          last_synced_at?: string | null
          leads_count?: number | null
          meta_ad_id?: string | null
          meta_adset_id?: string | null
          meta_campaign_id: string
          raw_meta_data?: Json | null
          spend_amount?: number | null
          spend_currency?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["smeksh_ad_status"]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          ad_account_id?: string
          ad_creative_id?: string | null
          ad_creative_preview_url?: string | null
          ad_name?: string | null
          adset_name?: string | null
          campaign_name?: string
          campaign_objective?: string | null
          clicks?: number | null
          conversations_started?: number | null
          cpc?: number | null
          cpl?: number | null
          created_at?: string
          ctr?: number | null
          end_date?: string | null
          id?: string
          impressions?: number | null
          last_synced_at?: string | null
          leads_count?: number | null
          meta_ad_id?: string | null
          meta_adset_id?: string | null
          meta_campaign_id?: string
          raw_meta_data?: Json | null
          spend_amount?: number | null
          spend_currency?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["smeksh_ad_status"]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_meta_ad_campaigns_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "smeksh_meta_ad_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_meta_ad_campaigns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_meta_ad_campaigns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_meta_ad_leads: {
        Row: {
          ad_account_id: string | null
          ad_clicked_at: string | null
          attribution_source: string | null
          attribution_window:
            | Database["public"]["Enums"]["smeksh_attribution_window"]
            | null
          automation_triggered: boolean | null
          automation_workflow_id: string | null
          campaign_id: string | null
          contact_id: string | null
          conversion_currency: string | null
          conversion_value: number | null
          converted_at: string | null
          created_at: string
          first_message_at: string | null
          first_response_at: string | null
          id: string
          is_converted: boolean
          meta_ad_id: string | null
          meta_ad_name: string | null
          meta_adset_id: string | null
          meta_adset_name: string | null
          meta_campaign_id: string | null
          meta_campaign_name: string | null
          meta_lead_id: string | null
          phone_e164: string | null
          raw_meta_data: Json | null
          smeksh_contact_id: string | null
          time_to_first_message_seconds: number | null
          time_to_first_response_seconds: number | null
          updated_at: string
          wa_id: string | null
          workspace_id: string
        }
        Insert: {
          ad_account_id?: string | null
          ad_clicked_at?: string | null
          attribution_source?: string | null
          attribution_window?:
            | Database["public"]["Enums"]["smeksh_attribution_window"]
            | null
          automation_triggered?: boolean | null
          automation_workflow_id?: string | null
          campaign_id?: string | null
          contact_id?: string | null
          conversion_currency?: string | null
          conversion_value?: number | null
          converted_at?: string | null
          created_at?: string
          first_message_at?: string | null
          first_response_at?: string | null
          id?: string
          is_converted?: boolean
          meta_ad_id?: string | null
          meta_ad_name?: string | null
          meta_adset_id?: string | null
          meta_adset_name?: string | null
          meta_campaign_id?: string | null
          meta_campaign_name?: string | null
          meta_lead_id?: string | null
          phone_e164?: string | null
          raw_meta_data?: Json | null
          smeksh_contact_id?: string | null
          time_to_first_message_seconds?: number | null
          time_to_first_response_seconds?: number | null
          updated_at?: string
          wa_id?: string | null
          workspace_id: string
        }
        Update: {
          ad_account_id?: string | null
          ad_clicked_at?: string | null
          attribution_source?: string | null
          attribution_window?:
            | Database["public"]["Enums"]["smeksh_attribution_window"]
            | null
          automation_triggered?: boolean | null
          automation_workflow_id?: string | null
          campaign_id?: string | null
          contact_id?: string | null
          conversion_currency?: string | null
          conversion_value?: number | null
          converted_at?: string | null
          created_at?: string
          first_message_at?: string | null
          first_response_at?: string | null
          id?: string
          is_converted?: boolean
          meta_ad_id?: string | null
          meta_ad_name?: string | null
          meta_adset_id?: string | null
          meta_adset_name?: string | null
          meta_campaign_id?: string | null
          meta_campaign_name?: string | null
          meta_lead_id?: string | null
          phone_e164?: string | null
          raw_meta_data?: Json | null
          smeksh_contact_id?: string | null
          time_to_first_message_seconds?: number | null
          time_to_first_response_seconds?: number | null
          updated_at?: string
          wa_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_meta_ad_leads_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "smeksh_meta_ad_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_meta_ad_leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "smeksh_meta_ad_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_meta_ad_leads_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_meta_ad_leads_smeksh_contact_id_fkey"
            columns: ["smeksh_contact_id"]
            isOneToOne: false
            referencedRelation: "smeksh_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_meta_ad_leads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_meta_ad_leads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_meta_ads_settings: {
        Row: {
          attribution_priority: Json | null
          auto_sync_enabled: boolean
          created_at: string
          default_assigned_agent_id: string | null
          default_assigned_team_id: string | null
          default_attribution_window:
            | Database["public"]["Enums"]["smeksh_attribution_window"]
            | null
          default_tags: string[] | null
          enforce_opt_in: boolean
          id: string
          last_full_sync_at: string | null
          marketing_consent_required: boolean
          sync_interval_minutes: number | null
          tracking_enabled: boolean
          updated_at: string
          workspace_id: string
        }
        Insert: {
          attribution_priority?: Json | null
          auto_sync_enabled?: boolean
          created_at?: string
          default_assigned_agent_id?: string | null
          default_assigned_team_id?: string | null
          default_attribution_window?:
            | Database["public"]["Enums"]["smeksh_attribution_window"]
            | null
          default_tags?: string[] | null
          enforce_opt_in?: boolean
          id?: string
          last_full_sync_at?: string | null
          marketing_consent_required?: boolean
          sync_interval_minutes?: number | null
          tracking_enabled?: boolean
          updated_at?: string
          workspace_id: string
        }
        Update: {
          attribution_priority?: Json | null
          auto_sync_enabled?: boolean
          created_at?: string
          default_assigned_agent_id?: string | null
          default_assigned_team_id?: string | null
          default_attribution_window?:
            | Database["public"]["Enums"]["smeksh_attribution_window"]
            | null
          default_tags?: string[] | null
          enforce_opt_in?: boolean
          id?: string
          last_full_sync_at?: string | null
          marketing_consent_required?: boolean
          sync_interval_minutes?: number | null
          tracking_enabled?: boolean
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_meta_ads_settings_default_assigned_agent_id_fkey"
            columns: ["default_assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_meta_ads_settings_default_assigned_team_id_fkey"
            columns: ["default_assigned_team_id"]
            isOneToOne: false
            referencedRelation: "smeksh_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_meta_ads_settings_default_assigned_team_id_fkey"
            columns: ["default_assigned_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_meta_ads_settings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_meta_ads_settings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_meta_attribution_rules: {
        Row: {
          attribution_window: Database["public"]["Enums"]["smeksh_attribution_window"]
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          match_conditions: Json | null
          name: string
          priority: number
          set_campaign_source: string | null
          set_priority: string | null
          set_source: string | null
          set_tags: string[] | null
          source_type: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          attribution_window?: Database["public"]["Enums"]["smeksh_attribution_window"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          match_conditions?: Json | null
          name: string
          priority?: number
          set_campaign_source?: string | null
          set_priority?: string | null
          set_source?: string | null
          set_tags?: string[] | null
          source_type: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          attribution_window?: Database["public"]["Enums"]["smeksh_attribution_window"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          match_conditions?: Json | null
          name?: string
          priority?: number
          set_campaign_source?: string | null
          set_priority?: string | null
          set_source?: string | null
          set_tags?: string[] | null
          source_type?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_meta_attribution_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_meta_attribution_rules_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_meta_attribution_rules_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_phone_number_access: {
        Row: {
          created_at: string
          id: string
          member_id: string | null
          phone_number_uuid: string
          team_id: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_id?: string | null
          phone_number_uuid: string
          team_id?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: string | null
          phone_number_uuid?: string
          team_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_phone_number_access_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "tenant_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_phone_number_access_phone_number_uuid_fkey"
            columns: ["phone_number_uuid"]
            isOneToOne: false
            referencedRelation: "smeksh_phone_numbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_phone_number_access_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "smeksh_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_phone_number_access_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_phone_number_access_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_phone_number_access_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_phone_numbers: {
        Row: {
          block_marketing_without_optin: boolean
          business_hours: Json | null
          certificate: string | null
          created_at: string
          default_assignment_strategy: string | null
          default_team_id: string | null
          display_name: string | null
          enforce_opt_in: boolean
          id: string
          is_default: boolean
          last_error: string | null
          last_message_at: string | null
          last_webhook_at: string | null
          max_open_conversations_per_agent: number | null
          messaging_limit: Database["public"]["Enums"]["smeksh_limit_tier"]
          only_online: boolean
          phone_e164: string
          phone_number_id: string
          quality_rating: Database["public"]["Enums"]["smeksh_quality_rating"]
          quiet_hours: Json | null
          raw: Json
          status: Database["public"]["Enums"]["smeksh_number_status"]
          tenant_id: string
          updated_at: string
          verified_name: string | null
          waba_id: string | null
          waba_uuid: string | null
          webhook_health: Database["public"]["Enums"]["smeksh_webhook_health"]
        }
        Insert: {
          block_marketing_without_optin?: boolean
          business_hours?: Json | null
          certificate?: string | null
          created_at?: string
          default_assignment_strategy?: string | null
          default_team_id?: string | null
          display_name?: string | null
          enforce_opt_in?: boolean
          id?: string
          is_default?: boolean
          last_error?: string | null
          last_message_at?: string | null
          last_webhook_at?: string | null
          max_open_conversations_per_agent?: number | null
          messaging_limit?: Database["public"]["Enums"]["smeksh_limit_tier"]
          only_online?: boolean
          phone_e164: string
          phone_number_id: string
          quality_rating?: Database["public"]["Enums"]["smeksh_quality_rating"]
          quiet_hours?: Json | null
          raw?: Json
          status?: Database["public"]["Enums"]["smeksh_number_status"]
          tenant_id: string
          updated_at?: string
          verified_name?: string | null
          waba_id?: string | null
          waba_uuid?: string | null
          webhook_health?: Database["public"]["Enums"]["smeksh_webhook_health"]
        }
        Update: {
          block_marketing_without_optin?: boolean
          business_hours?: Json | null
          certificate?: string | null
          created_at?: string
          default_assignment_strategy?: string | null
          default_team_id?: string | null
          display_name?: string | null
          enforce_opt_in?: boolean
          id?: string
          is_default?: boolean
          last_error?: string | null
          last_message_at?: string | null
          last_webhook_at?: string | null
          max_open_conversations_per_agent?: number | null
          messaging_limit?: Database["public"]["Enums"]["smeksh_limit_tier"]
          only_online?: boolean
          phone_e164?: string
          phone_number_id?: string
          quality_rating?: Database["public"]["Enums"]["smeksh_quality_rating"]
          quiet_hours?: Json | null
          raw?: Json
          status?: Database["public"]["Enums"]["smeksh_number_status"]
          tenant_id?: string
          updated_at?: string
          verified_name?: string | null
          waba_id?: string | null
          waba_uuid?: string | null
          webhook_health?: Database["public"]["Enums"]["smeksh_webhook_health"]
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_phone_numbers_default_team_id_fkey"
            columns: ["default_team_id"]
            isOneToOne: false
            referencedRelation: "smeksh_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_phone_numbers_default_team_id_fkey"
            columns: ["default_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_phone_numbers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_phone_numbers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_phone_numbers_waba_uuid_fkey"
            columns: ["waba_uuid"]
            isOneToOne: false
            referencedRelation: "smeksh_wabas"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_quality_history: {
        Row: {
          id: string
          messaging_limit: Database["public"]["Enums"]["smeksh_limit_tier"]
          phone_number_uuid: string
          quality_rating: Database["public"]["Enums"]["smeksh_quality_rating"]
          reason: string | null
          recorded_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          messaging_limit: Database["public"]["Enums"]["smeksh_limit_tier"]
          phone_number_uuid: string
          quality_rating: Database["public"]["Enums"]["smeksh_quality_rating"]
          reason?: string | null
          recorded_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          messaging_limit?: Database["public"]["Enums"]["smeksh_limit_tier"]
          phone_number_uuid?: string
          quality_rating?: Database["public"]["Enums"]["smeksh_quality_rating"]
          reason?: string | null
          recorded_at?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_quality_history_phone_number_uuid_fkey"
            columns: ["phone_number_uuid"]
            isOneToOne: false
            referencedRelation: "smeksh_phone_numbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_quality_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_quality_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_segment_filters: {
        Row: {
          created_at: string
          field_path: string
          group_key: string | null
          id: string
          join_type: Database["public"]["Enums"]["smeksh_filter_join"]
          negate: boolean
          operator: string
          segment_id: string
          sort_order: number
          value: Json | null
          value_type: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          field_path: string
          group_key?: string | null
          id?: string
          join_type?: Database["public"]["Enums"]["smeksh_filter_join"]
          negate?: boolean
          operator: string
          segment_id: string
          sort_order?: number
          value?: Json | null
          value_type: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          field_path?: string
          group_key?: string | null
          id?: string
          join_type?: Database["public"]["Enums"]["smeksh_filter_join"]
          negate?: boolean
          operator?: string
          segment_id?: string
          sort_order?: number
          value?: Json | null
          value_type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_segment_filters_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "smeksh_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_segment_filters_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_segment_filters_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_segments: {
        Row: {
          color: string | null
          contact_count: number
          created_at: string
          created_by: string | null
          description: string | null
          filter_tree: Json
          icon: string | null
          id: string
          is_smart: boolean
          is_system: boolean
          name: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          color?: string | null
          contact_count?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          filter_tree?: Json
          icon?: string | null
          id?: string
          is_smart?: boolean
          is_system?: boolean
          name: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          color?: string | null
          contact_count?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          filter_tree?: Json
          icon?: string | null
          id?: string
          is_smart?: boolean
          is_system?: boolean
          name?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_segments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_segments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_segments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_typing_state: {
        Row: {
          conversation_id: string
          expires_at: string
          profile_id: string
          status: Database["public"]["Enums"]["smeksh_typing_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          conversation_id: string
          expires_at: string
          profile_id: string
          status?: Database["public"]["Enums"]["smeksh_typing_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          conversation_id?: string
          expires_at?: string
          profile_id?: string
          status?: Database["public"]["Enums"]["smeksh_typing_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_typing_state_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_typing_state_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smeksh_typing_state_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_typing_state_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_wabas: {
        Row: {
          business_id: string | null
          business_name: string | null
          created_at: string
          id: string
          is_default: boolean
          name: string | null
          tenant_id: string
          updated_at: string
          waba_id: string
        }
        Insert: {
          business_id?: string | null
          business_name?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string | null
          tenant_id: string
          updated_at?: string
          waba_id: string
        }
        Update: {
          business_id?: string | null
          business_name?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string | null
          tenant_id?: string
          updated_at?: string
          waba_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_wabas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_wabas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_webhook_configs: {
        Row: {
          callback_url: string
          created_at: string
          id: string
          is_active: boolean
          phone_number_id: string
          secret: string | null
          subscribed_fields: string[] | null
          tenant_id: string
          updated_at: string
          verify_token: string | null
        }
        Insert: {
          callback_url: string
          created_at?: string
          id?: string
          is_active?: boolean
          phone_number_id: string
          secret?: string | null
          subscribed_fields?: string[] | null
          tenant_id: string
          updated_at?: string
          verify_token?: string | null
        }
        Update: {
          callback_url?: string
          created_at?: string
          id?: string
          is_active?: boolean
          phone_number_id?: string
          secret?: string | null
          subscribed_fields?: string[] | null
          tenant_id?: string
          updated_at?: string
          verify_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_webhook_configs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_webhook_configs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_webhook_delivery_logs: {
        Row: {
          direction: string
          error: string | null
          event_type: string | null
          id: string
          latency_ms: number | null
          phone_number_id: string | null
          processed_at: string | null
          raw: Json
          received_at: string
          status_code: number | null
          success: boolean
          tenant_id: string
        }
        Insert: {
          direction?: string
          error?: string | null
          event_type?: string | null
          id?: string
          latency_ms?: number | null
          phone_number_id?: string | null
          processed_at?: string | null
          raw?: Json
          received_at?: string
          status_code?: number | null
          success?: boolean
          tenant_id: string
        }
        Update: {
          direction?: string
          error?: string | null
          event_type?: string | null
          id?: string
          latency_ms?: number | null
          phone_number_id?: string | null
          processed_at?: string | null
          raw?: Json
          received_at?: string
          status_code?: number | null
          success?: boolean
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smeksh_webhook_delivery_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "smeksh_webhook_delivery_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          billing_cycle?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          billing_cycle?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tag_history: {
        Row: {
          action: string
          applied_by: string | null
          applied_by_rule: string | null
          contact_id: string | null
          conversation_id: string | null
          created_at: string
          id: string
          source: string | null
          tag_id: string
          tenant_id: string
        }
        Insert: {
          action: string
          applied_by?: string | null
          applied_by_rule?: string | null
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          source?: string | null
          tag_id: string
          tenant_id: string
        }
        Update: {
          action?: string
          applied_by?: string | null
          applied_by_rule?: string | null
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          source?: string | null
          tag_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tag_history_applied_by_fkey"
            columns: ["applied_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tag_history_applied_by_rule_fkey"
            columns: ["applied_by_rule"]
            isOneToOne: false
            referencedRelation: "tag_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tag_history_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tag_history_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tag_history_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tag_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "tag_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tag_rules: {
        Row: {
          action_config: Json
          action_type: string
          created_at: string
          created_by: string | null
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean
          last_executed_at: string | null
          name: string
          priority: number | null
          tag_id: string
          tenant_id: string
          trigger_config: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          action_config?: Json
          action_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          name: string
          priority?: number | null
          tag_id: string
          tenant_id: string
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
        }
        Update: {
          action_config?: Json
          action_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          name?: string
          priority?: number | null
          tag_id?: string
          tenant_id?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tag_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tag_rules_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tag_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "tag_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          apply_to: Database["public"]["Enums"]["tag_apply_to"] | null
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          emoji: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["tag_status"] | null
          tag_group: string | null
          tag_type: Database["public"]["Enums"]["tag_type"] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          apply_to?: Database["public"]["Enums"]["tag_apply_to"] | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["tag_status"] | null
          tag_group?: string | null
          tag_type?: Database["public"]["Enums"]["tag_type"] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          apply_to?: Database["public"]["Enums"]["tag_apply_to"] | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["tag_status"] | null
          tag_group?: string | null
          tag_type?: Database["public"]["Enums"]["tag_type"] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "tags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          is_active: boolean
          team_id: string
          tenant_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          team_id: string
          tenant_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          team_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "smeksh_presence"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "team_members_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "smeksh_workspace_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "smeksh_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "team_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          color: string | null
          created_at: string
          default_routing_strategy: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          team_lead_id: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          default_routing_strategy?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          team_lead_id?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          default_routing_strategy?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          team_lead_id?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "teams_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      template_approvals: {
        Row: {
          comments: string | null
          created_at: string
          id: string
          requested_at: string
          requested_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          template_id: string
          tenant_id: string
          version_id: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          id?: string
          requested_at?: string
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          template_id: string
          tenant_id: string
          version_id: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          id?: string
          requested_at?: string
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          template_id?: string
          tenant_id?: string
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_approvals_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_approvals_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_approvals_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_approvals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "template_approvals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_approvals_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "template_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      template_lint_results: {
        Row: {
          created_at: string
          field: string | null
          id: string
          message: string
          rule_code: string
          severity: string
          suggestion: string | null
          template_id: string
          tenant_id: string
          version_id: string
        }
        Insert: {
          created_at?: string
          field?: string | null
          id?: string
          message: string
          rule_code: string
          severity: string
          suggestion?: string | null
          template_id: string
          tenant_id: string
          version_id: string
        }
        Update: {
          created_at?: string
          field?: string | null
          id?: string
          message?: string
          rule_code?: string
          severity?: string
          suggestion?: string | null
          template_id?: string
          tenant_id?: string
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_lint_results_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_lint_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "template_lint_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_lint_results_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "template_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      template_submission_logs: {
        Row: {
          created_at: string
          id: string
          meta_status: string | null
          meta_template_id: string | null
          rejection_reason: string | null
          request_payload: Json | null
          response_payload: Json | null
          submitted_by: string | null
          template_id: string
          tenant_id: string
          updated_at: string
          version_id: string
          waba_account_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meta_status?: string | null
          meta_template_id?: string | null
          rejection_reason?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          submitted_by?: string | null
          template_id: string
          tenant_id: string
          updated_at?: string
          version_id: string
          waba_account_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meta_status?: string | null
          meta_template_id?: string | null
          rejection_reason?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          submitted_by?: string | null
          template_id?: string
          tenant_id?: string
          updated_at?: string
          version_id?: string
          waba_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_submission_logs_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_submission_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_submission_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "template_submission_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_submission_logs_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "template_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_submission_logs_waba_account_id_fkey"
            columns: ["waba_account_id"]
            isOneToOne: false
            referencedRelation: "waba_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_submission_logs_waba_account_id_fkey"
            columns: ["waba_account_id"]
            isOneToOne: false
            referencedRelation: "waba_accounts_public"
            referencedColumns: ["id"]
          },
        ]
      }
      template_versions: {
        Row: {
          body: string
          buttons: Json | null
          content_hash: string | null
          created_at: string
          created_by: string | null
          footer: string | null
          header_content: string | null
          header_type: string | null
          id: string
          template_id: string
          variable_samples: Json | null
          version_number: number
        }
        Insert: {
          body: string
          buttons?: Json | null
          content_hash?: string | null
          created_at?: string
          created_by?: string | null
          footer?: string | null
          header_content?: string | null
          header_type?: string | null
          id?: string
          template_id: string
          variable_samples?: Json | null
          version_number?: number
        }
        Update: {
          body?: string
          buttons?: Json | null
          content_hash?: string | null
          created_at?: string
          created_by?: string | null
          footer?: string | null
          header_content?: string | null
          header_type?: string | null
          id?: string
          template_id?: string
          variable_samples?: Json | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "template_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          category: Database["public"]["Enums"]["template_category"]
          components_json: Json
          created_at: string
          created_by: string | null
          current_version_id: string | null
          id: string
          internal_status: string | null
          language: string
          last_synced_at: string | null
          meta_template_id: string
          name: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["template_status"]
          template_score: number | null
          tenant_id: string
          updated_at: string
          waba_account_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["template_category"]
          components_json?: Json
          created_at?: string
          created_by?: string | null
          current_version_id?: string | null
          id?: string
          internal_status?: string | null
          language?: string
          last_synced_at?: string | null
          meta_template_id: string
          name: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["template_status"]
          template_score?: number | null
          tenant_id: string
          updated_at?: string
          waba_account_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["template_category"]
          components_json?: Json
          created_at?: string
          created_by?: string | null
          current_version_id?: string | null
          id?: string
          internal_status?: string | null
          language?: string
          last_synced_at?: string | null
          meta_template_id?: string
          name?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["template_status"]
          template_score?: number | null
          tenant_id?: string
          updated_at?: string
          waba_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "templates_current_version_id_fkey"
            columns: ["current_version_id"]
            isOneToOne: false
            referencedRelation: "template_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "templates_waba_account_id_fkey"
            columns: ["waba_account_id"]
            isOneToOne: false
            referencedRelation: "waba_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "templates_waba_account_id_fkey"
            columns: ["waba_account_id"]
            isOneToOne: false
            referencedRelation: "waba_accounts_public"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_features: {
        Row: {
          created_at: string
          expires_at: string | null
          feature_key: string
          id: string
          is_enabled: boolean
          tenant_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          feature_key: string
          id?: string
          is_enabled?: boolean
          tenant_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          feature_key?: string
          id?: string
          is_enabled?: boolean
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_features_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "tenant_features_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_integrations: {
        Row: {
          config: Json | null
          connected_at: string | null
          connected_by: string | null
          created_at: string | null
          credentials: Json | null
          error_count: number | null
          health_status: string | null
          id: string
          integration_key: string
          last_error: string | null
          last_event_at: string | null
          status: string
          tenant_id: string
          updated_at: string | null
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          config?: Json | null
          connected_at?: string | null
          connected_by?: string | null
          created_at?: string | null
          credentials?: Json | null
          error_count?: number | null
          health_status?: string | null
          id?: string
          integration_key: string
          last_error?: string | null
          last_event_at?: string | null
          status?: string
          tenant_id: string
          updated_at?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          config?: Json | null
          connected_at?: string | null
          connected_by?: string | null
          created_at?: string | null
          credentials?: Json | null
          error_count?: number | null
          health_status?: string | null
          id?: string
          integration_key?: string
          last_error?: string | null
          last_event_at?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_integrations_connected_by_fkey"
            columns: ["connected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_integrations_integration_key_fkey"
            columns: ["integration_key"]
            isOneToOne: false
            referencedRelation: "integration_catalog"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "tenant_integrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "tenant_integrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_members: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["tenant_role"]
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["tenant_role"]
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["tenant_role"]
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          is_suspended: boolean | null
          logo_url: string | null
          name: string
          onboarding_status: string | null
          slug: string
          suspended_at: string | null
          suspended_reason: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_suspended?: boolean | null
          logo_url?: string | null
          name: string
          onboarding_status?: string | null
          slug: string
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_suspended?: boolean | null
          logo_url?: string | null
          name?: string
          onboarding_status?: string | null
          slug?: string
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      usage_counters: {
        Row: {
          campaigns_created: number | null
          contacts_added: number | null
          created_at: string
          id: string
          messages_received: number | null
          messages_sent: number | null
          phone_numbers_used: number | null
          tenant_id: string
          updated_at: string
          year_month: string
        }
        Insert: {
          campaigns_created?: number | null
          contacts_added?: number | null
          created_at?: string
          id?: string
          messages_received?: number | null
          messages_sent?: number | null
          phone_numbers_used?: number | null
          tenant_id: string
          updated_at?: string
          year_month: string
        }
        Update: {
          campaigns_created?: number | null
          contacts_added?: number | null
          created_at?: string
          id?: string
          messages_received?: number | null
          messages_sent?: number | null
          phone_numbers_used?: number | null
          tenant_id?: string
          updated_at?: string
          year_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_counters_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "usage_counters_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_attributes: {
        Row: {
          action_name: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          action_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          action_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_attributes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_attributes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "user_attributes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role_id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role_id: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role_id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_template_events: {
        Row: {
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["wa_event_kind"]
          message: string | null
          payload: Json
          status: Database["public"]["Enums"]["wa_template_status"] | null
          template_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["wa_event_kind"]
          message?: string | null
          payload?: Json
          status?: Database["public"]["Enums"]["wa_template_status"] | null
          template_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["wa_event_kind"]
          message?: string | null
          payload?: Json
          status?: Database["public"]["Enums"]["wa_template_status"] | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wa_template_events_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "wa_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_template_fallback_policies: {
        Row: {
          backup_template_id: string | null
          fallback_message: string | null
          id: string
          updated_at: string
          updated_by: string | null
          use_session_message: boolean
          workspace_id: string
        }
        Insert: {
          backup_template_id?: string | null
          fallback_message?: string | null
          id?: string
          updated_at?: string
          updated_by?: string | null
          use_session_message?: boolean
          workspace_id: string
        }
        Update: {
          backup_template_id?: string | null
          fallback_message?: string | null
          id?: string
          updated_at?: string
          updated_by?: string | null
          use_session_message?: boolean
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wa_template_fallback_policies_backup_template_id_fkey"
            columns: ["backup_template_id"]
            isOneToOne: false
            referencedRelation: "wa_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wa_template_fallback_policies_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wa_template_fallback_policies_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "wa_template_fallback_policies_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_template_submissions: {
        Row: {
          id: string
          last_polled_at: string | null
          meta_phone_number_id: string | null
          meta_rejection_reason: string | null
          meta_request_id: string | null
          meta_response: Json | null
          meta_status: Database["public"]["Enums"]["wa_template_status"]
          meta_waba_id: string
          next_poll_at: string | null
          poll_attempts: number
          submitted_at: string
          template_version_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          last_polled_at?: string | null
          meta_phone_number_id?: string | null
          meta_rejection_reason?: string | null
          meta_request_id?: string | null
          meta_response?: Json | null
          meta_status?: Database["public"]["Enums"]["wa_template_status"]
          meta_waba_id: string
          next_poll_at?: string | null
          poll_attempts?: number
          submitted_at?: string
          template_version_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          last_polled_at?: string | null
          meta_phone_number_id?: string | null
          meta_rejection_reason?: string | null
          meta_request_id?: string | null
          meta_response?: Json | null
          meta_status?: Database["public"]["Enums"]["wa_template_status"]
          meta_waba_id?: string
          next_poll_at?: string | null
          poll_attempts?: number
          submitted_at?: string
          template_version_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wa_template_submissions_template_version_id_fkey"
            columns: ["template_version_id"]
            isOneToOne: false
            referencedRelation: "wa_template_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wa_template_submissions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "wa_template_submissions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_template_validation_logs: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          issues: Json
          model_info: Json
          predicted_category:
            | Database["public"]["Enums"]["wa_template_category"]
            | null
          risk: Database["public"]["Enums"]["wa_validation_risk"]
          score: number
          selected_category:
            | Database["public"]["Enums"]["wa_template_category"]
            | null
          suggestions: Json
          template_version_id: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          issues?: Json
          model_info?: Json
          predicted_category?:
            | Database["public"]["Enums"]["wa_template_category"]
            | null
          risk: Database["public"]["Enums"]["wa_validation_risk"]
          score: number
          selected_category?:
            | Database["public"]["Enums"]["wa_template_category"]
            | null
          suggestions?: Json
          template_version_id?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          issues?: Json
          model_info?: Json
          predicted_category?:
            | Database["public"]["Enums"]["wa_template_category"]
            | null
          risk?: Database["public"]["Enums"]["wa_validation_risk"]
          score?: number
          selected_category?:
            | Database["public"]["Enums"]["wa_template_category"]
            | null
          suggestions?: Json
          template_version_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wa_template_validation_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wa_template_validation_logs_template_version_id_fkey"
            columns: ["template_version_id"]
            isOneToOne: false
            referencedRelation: "wa_template_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wa_template_validation_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "wa_template_validation_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_template_versions: {
        Row: {
          body: string
          buttons: Json
          content_hash: string
          created_at: string
          created_by: string | null
          example_values: Json
          footer: string | null
          header: Json
          id: string
          template_id: string
          variables: Json
          version: number
        }
        Insert: {
          body: string
          buttons?: Json
          content_hash: string
          created_at?: string
          created_by?: string | null
          example_values?: Json
          footer?: string | null
          header?: Json
          id?: string
          template_id: string
          variables?: Json
          version: number
        }
        Update: {
          body?: string
          buttons?: Json
          content_hash?: string
          created_at?: string
          created_by?: string | null
          example_values?: Json
          footer?: string | null
          header?: Json
          id?: string
          template_id?: string
          variables?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "wa_template_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wa_template_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "wa_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_templates: {
        Row: {
          category: Database["public"]["Enums"]["wa_template_category"]
          created_at: string
          created_by: string | null
          id: string
          is_archived: boolean
          is_backup: boolean
          language: string
          meta_last_status_at: string | null
          meta_template_id: string | null
          meta_template_name: string | null
          meta_waba_id: string | null
          name: string
          status: Database["public"]["Enums"]["wa_template_status"]
          updated_at: string
          updated_by: string | null
          workspace_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["wa_template_category"]
          created_at?: string
          created_by?: string | null
          id?: string
          is_archived?: boolean
          is_backup?: boolean
          language?: string
          meta_last_status_at?: string | null
          meta_template_id?: string | null
          meta_template_name?: string | null
          meta_waba_id?: string | null
          name: string
          status?: Database["public"]["Enums"]["wa_template_status"]
          updated_at?: string
          updated_by?: string | null
          workspace_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["wa_template_category"]
          created_at?: string
          created_by?: string | null
          id?: string
          is_archived?: boolean
          is_backup?: boolean
          language?: string
          meta_last_status_at?: string | null
          meta_template_id?: string | null
          meta_template_name?: string | null
          meta_waba_id?: string | null
          name?: string
          status?: Database["public"]["Enums"]["wa_template_status"]
          updated_at?: string
          updated_by?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wa_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wa_templates_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wa_templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "wa_templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      waba_accounts: {
        Row: {
          business_id: string
          created_at: string
          encrypted_access_token: string | null
          id: string
          name: string | null
          status: Database["public"]["Enums"]["waba_status"]
          tenant_id: string
          token_source: string | null
          updated_at: string
          waba_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          encrypted_access_token?: string | null
          id?: string
          name?: string | null
          status?: Database["public"]["Enums"]["waba_status"]
          tenant_id: string
          token_source?: string | null
          updated_at?: string
          waba_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          encrypted_access_token?: string | null
          id?: string
          name?: string | null
          status?: Database["public"]["Enums"]["waba_status"]
          tenant_id?: string
          token_source?: string | null
          updated_at?: string
          waba_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waba_accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "waba_accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          created_at: string
          error: string | null
          event_type: string
          id: string
          id_key: string | null
          payload: Json
          processed: boolean
          processed_at: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          event_type: string
          id?: string
          id_key?: string | null
          payload: Json
          processed?: boolean
          processed_at?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          event_type?: string
          id?: string
          id_key?: string | null
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "webhook_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      working_hours: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          start_time: string
          team_id: string | null
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
          team_id?: string | null
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
          team_id?: string | null
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "working_hours_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "smeksh_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "working_hours_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "working_hours_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "working_hours_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "working_hours_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_addons: {
        Row: {
          addon_key: string
          created_at: string | null
          id: string
          price_per_unit: number
          quantity: number
          status: string
          workspace_id: string
        }
        Insert: {
          addon_key: string
          created_at?: string | null
          id?: string
          price_per_unit?: number
          quantity?: number
          status?: string
          workspace_id: string
        }
        Update: {
          addon_key?: string
          created_at?: string | null
          id?: string
          price_per_unit?: number
          quantity?: number
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_addons_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "workspace_addons_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_appearance: {
        Row: {
          accent_color: string | null
          border_radius: string
          created_at: string
          density: string
          id: string
          mode: string
          reduce_motion: boolean
          sidebar_color: string | null
          theme: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          accent_color?: string | null
          border_radius?: string
          created_at?: string
          density?: string
          id?: string
          mode?: string
          reduce_motion?: boolean
          sidebar_color?: string | null
          theme?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          accent_color?: string | null
          border_radius?: string
          created_at?: string
          density?: string
          id?: string
          mode?: string
          reduce_motion?: boolean
          sidebar_color?: string | null
          theme?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_appearance_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "workspace_appearance_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_credits: {
        Row: {
          balance: number
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          balance?: number
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          balance?: number
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_credits_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "workspace_credits_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_entitlements: {
        Row: {
          enable_ads: boolean
          enable_ai: boolean
          enable_autoforms: boolean
          enable_integrations: boolean
          id: string
          monthly_broadcast_limit: number | null
          monthly_conversation_limit: number | null
          monthly_flow_limit: number | null
          monthly_template_limit: number | null
          plan: string
          sending_paused: boolean
          status: string
          updated_at: string
          updated_by: string | null
          workspace_id: string
        }
        Insert: {
          enable_ads?: boolean
          enable_ai?: boolean
          enable_autoforms?: boolean
          enable_integrations?: boolean
          id?: string
          monthly_broadcast_limit?: number | null
          monthly_conversation_limit?: number | null
          monthly_flow_limit?: number | null
          monthly_template_limit?: number | null
          plan?: string
          sending_paused?: boolean
          status?: string
          updated_at?: string
          updated_by?: string | null
          workspace_id: string
        }
        Update: {
          enable_ads?: boolean
          enable_ai?: boolean
          enable_autoforms?: boolean
          enable_integrations?: boolean
          id?: string
          monthly_broadcast_limit?: number | null
          monthly_conversation_limit?: number | null
          monthly_flow_limit?: number | null
          monthly_template_limit?: number | null
          plan?: string
          sending_paused?: boolean
          status?: string
          updated_at?: string
          updated_by?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_entitlements_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "workspace_entitlements_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_phone_numbers: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_primary: boolean
          messaging_limit: number | null
          phone_e164: string
          phone_number_id: string | null
          provider: string
          quality_rating: string | null
          status: string
          updated_at: string
          waba_id: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_primary?: boolean
          messaging_limit?: number | null
          phone_e164: string
          phone_number_id?: string | null
          provider?: string
          quality_rating?: string | null
          status?: string
          updated_at?: string
          waba_id?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_primary?: boolean
          messaging_limit?: number | null
          phone_e164?: string
          phone_number_id?: string | null
          provider?: string
          quality_rating?: string | null
          status?: string
          updated_at?: string
          waba_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_phone_numbers_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "workspace_phone_numbers_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      platform_kpi_overview: {
        Row: {
          active_workspaces: number | null
          connected_phone_numbers: number | null
          suspended_workspaces: number | null
          total_contacts: number | null
          total_conversations: number | null
          total_phone_numbers: number | null
          total_users: number | null
          total_workspaces: number | null
        }
        Relationships: []
      }
      platform_phone_numbers_view: {
        Row: {
          created_at: string | null
          id: string | null
          is_primary: boolean | null
          messaging_limit: number | null
          phone_e164: string | null
          provider: string | null
          quality_rating: string | null
          status: string | null
          updated_at: string | null
          workspace_id: string | null
          workspace_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_phone_numbers_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "workspace_phone_numbers_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_revenue_daily: {
        Row: {
          currency: string | null
          day: string | null
          gross: number | null
          net: number | null
          payments_count: number | null
          refunds: number | null
        }
        Relationships: []
      }
      platform_workspace_directory: {
        Row: {
          contacts_count: number | null
          conversations_count: number | null
          created_at: string | null
          entitlement_status: string | null
          is_suspended: boolean | null
          members_count: number | null
          phone_numbers_count: number | null
          plan: string | null
          plan_name: string | null
          sending_paused: boolean | null
          slug: string | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          suspended_reason: string | null
          workspace_id: string | null
          workspace_name: string | null
        }
        Relationships: []
      }
      smeksh_audit_logs: {
        Row: {
          action: string | null
          actor_user_id: string | null
          created_at: string | null
          details: Json | null
          id: string | null
          ip_address: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          workspace_id: string | null
        }
        Insert: {
          action?: string | null
          actor_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string | null
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          workspace_id?: string | null
        }
        Update: {
          action?: string | null
          actor_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string | null
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_presence: {
        Row: {
          last_active_at: string | null
          member_id: string | null
          profile_id: string | null
          status: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          last_active_at?: string | null
          member_id?: string | null
          profile_id?: string | null
          status?: never
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          last_active_at?: string | null
          member_id?: string | null
          profile_id?: string | null
          status?: never
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_tenant_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "agents_tenant_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_user_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_round_robin_state: {
        Row: {
          cursor: number | null
          team_id: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          cursor?: number | null
          team_id?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          cursor?: number | null
          team_id?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "round_robin_state_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "smeksh_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round_robin_state_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round_robin_state_tenant_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "round_robin_state_tenant_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_routing_rules: {
        Row: {
          created_at: string | null
          description: string | null
          fallback_strategy: string | null
          id: string | null
          is_active: boolean | null
          match_conditions: Json | null
          name: string | null
          priority: number | null
          status: string | null
          strategy: string | null
          target_member_id: string | null
          target_team_id: string | null
          trigger_event: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          fallback_strategy?: string | null
          id?: string | null
          is_active?: boolean | null
          match_conditions?: Json | null
          name?: string | null
          priority?: number | null
          status?: never
          strategy?: string | null
          target_member_id?: string | null
          target_team_id?: string | null
          trigger_event?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          fallback_strategy?: string | null
          id?: string | null
          is_active?: boolean | null
          match_conditions?: Json | null
          name?: string | null
          priority?: number | null
          status?: never
          strategy?: string | null
          target_member_id?: string | null
          target_team_id?: string | null
          trigger_event?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routing_rules_assign_to_team_id_fkey"
            columns: ["target_team_id"]
            isOneToOne: false
            referencedRelation: "smeksh_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routing_rules_assign_to_team_id_fkey"
            columns: ["target_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routing_rules_assign_to_user_id_fkey"
            columns: ["target_member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routing_rules_tenant_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "routing_rules_tenant_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_team_members: {
        Row: {
          created_at: string | null
          id: string | null
          is_active: boolean | null
          member_id: string | null
          profile_id: string | null
          team_id: string | null
          workspace_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_user_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_agent_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_agent_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "smeksh_presence"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "team_members_agent_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "smeksh_workspace_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "smeksh_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_tenant_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "team_members_tenant_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_teams: {
        Row: {
          color: string | null
          created_at: string | null
          default_routing_strategy: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          team_lead_id: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          default_routing_strategy?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          team_lead_id?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          default_routing_strategy?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          team_lead_id?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_tenant_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "teams_tenant_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smeksh_workspace_members: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string | null
          is_active: boolean | null
          is_online: boolean | null
          languages: string[] | null
          last_active_at: string | null
          max_open_chats: number | null
          notes: string | null
          presence: string | null
          profile_id: string | null
          role: string | null
          skills: string[] | null
          status: string | null
          timezone: string | null
          updated_at: string | null
          weight: number | null
          workspace_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_tenant_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "agents_tenant_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_user_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waba_accounts_public: {
        Row: {
          business_id: string | null
          created_at: string | null
          id: string | null
          name: string | null
          status: Database["public"]["Enums"]["waba_status"] | null
          tenant_id: string | null
          updated_at: string | null
          waba_id: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          status?: Database["public"]["Enums"]["waba_status"] | null
          tenant_id?: string | null
          updated_at?: string | null
          waba_id?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          status?: Database["public"]["Enums"]["waba_status"] | null
          tenant_id?: string | null
          updated_at?: string | null
          waba_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waba_accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "platform_workspace_directory"
            referencedColumns: ["workspace_id"]
          },
          {
            foreignKeyName: "waba_accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      assign_conversation: {
        Args: {
          p_assigned_to: string
          p_conversation_id: string
          p_tenant_id: string
        }
        Returns: Json
      }
      auto_route_conversation: {
        Args: {
          p_conversation_id: string
          p_only_if_unassigned?: boolean
          p_tenant_id: string
        }
        Returns: Json
      }
      cancel_conversation_jobs: {
        Args: {
          p_conversation_id: string
          p_only_stop_on_reply?: boolean
          p_tenant_id: string
        }
        Returns: number
      }
      cancel_smeksh_campaign: {
        Args: { p_campaign_id: string; p_tenant_id: string }
        Returns: undefined
      }
      cancel_workflow_jobs: {
        Args: { p_tenant_id: string; p_workflow_id: string }
        Returns: number
      }
      check_automation_cooldown: {
        Args: { p_cooldown_key: string; p_tenant_id: string }
        Returns: boolean
      }
      check_automation_loop: {
        Args: {
          p_contact_id: string
          p_max_depth?: number
          p_source_workflow_id: string
          p_target_workflow_id: string
          p_tenant_id: string
        }
        Returns: boolean
      }
      check_automation_rate_limit: {
        Args: {
          p_contact_id: string
          p_scope?: Database["public"]["Enums"]["rate_limit_scope"]
          p_tenant_id: string
          p_workflow_id: string
        }
        Returns: boolean
      }
      check_payment_attempt_allowed: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_tenant_limit: {
        Args: { p_limit_key: string; p_tenant_id: string }
        Returns: boolean
      }
      check_workspace_creation_allowed: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      claim_conversation: {
        Args: { p_conversation_id: string; p_tenant_id: string }
        Returns: Json
      }
      claim_on_reply: {
        Args: {
          p_actor_id: string
          p_conversation_id: string
          p_takeover?: boolean
          p_tenant_id: string
        }
        Returns: Json
      }
      cleanup_automation_expired_records: { Args: never; Returns: undefined }
      cleanup_expired_typing: { Args: never; Returns: undefined }
      cleanup_rate_limit_logs: { Args: never; Returns: undefined }
      complete_automation_job: {
        Args: {
          p_error?: string
          p_job_id: string
          p_status: Database["public"]["Enums"]["scheduled_job_status"]
        }
        Returns: undefined
      }
      complete_automation_job_v2: {
        Args: {
          p_error?: string
          p_job_id: string
          p_retry_delay_seconds?: number
          p_status: Database["public"]["Enums"]["scheduled_job_status"]
        }
        Returns: undefined
      }
      complete_campaign_job: {
        Args: {
          p_error_code?: string
          p_error_message?: string
          p_job_id: string
          p_status: Database["public"]["Enums"]["smeksh_job_status"]
          p_wamid?: string
        }
        Returns: undefined
      }
      complete_smeksh_campaign_job: {
        Args: {
          p_error_code?: string
          p_error_message?: string
          p_job_id: string
          p_status: Database["public"]["Enums"]["smeksh_job_status"]
          p_wa_message_id?: string
        }
        Returns: undefined
      }
      compute_workspace_entitlements: {
        Args: { p_workspace_id: string }
        Returns: undefined
      }
      contacts_crm_search: {
        Args: {
          p_assigned_to?: string
          p_attributes?: Json
          p_claimed_by?: string
          p_date_from?: string
          p_date_to?: string
          p_is_unreplied?: boolean
          p_last_replied_by?: string
          p_lead_states?: string[]
          p_limit?: number
          p_offset?: number
          p_phone_number_id?: string
          p_search?: string
          p_tag_ids?: string[]
          p_tag_match_all?: boolean
          p_tenant_id: string
        }
        Returns: {
          assigned_at: string
          assigned_to: string
          attributes: Json
          claimed_at: string
          claimed_by: string
          contact_id: string
          contact_name: string
          first_name: string
          is_unreplied: boolean
          last_inbound_at: string
          last_message_at: string
          last_outbound_at: string
          last_replied_at: string
          last_replied_by: string
          lead_state: string
          open_conversation_id: string
          phone_number_id: string
          profile_picture_url: string
          tags: Json
          tenant_id: string
          wa_id: string
        }[]
      }
      create_tenant_with_owner: {
        Args: { _name: string; _slug: string }
        Returns: {
          created_at: string
          id: string
          is_suspended: boolean | null
          logo_url: string | null
          name: string
          onboarding_status: string | null
          slug: string
          suspended_at: string | null
          suspended_reason: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tenants"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_platform_role: { Args: { _user_id: string }; Returns: string }
      get_team_workload: {
        Args: { p_team_id: string; p_tenant_id: string }
        Returns: {
          availability_pct: number
          display_name: string
          is_online: boolean
          max_open_chats: number
          open_count: number
          profile_id: string
        }[]
      }
      get_tenant_usage: {
        Args: { p_tenant_id: string }
        Returns: {
          contacts_count: number
          monthly_messages: number
          phone_numbers_count: number
          team_members_count: number
        }[]
      }
      get_user_role_name: {
        Args: { p_tenant_id: string; p_user_id: string }
        Returns: string
      }
      has_permission: {
        Args: { p_permission_key: string; p_user_id: string }
        Returns: boolean
      }
      has_tenant_role: {
        Args: {
          _roles: Database["public"]["Enums"]["tenant_role"][]
          _tenant_id: string
          _user_id: string
        }
        Returns: boolean
      }
      increment_automation_rate_limit: {
        Args: {
          p_contact_id: string
          p_limit?: number
          p_scope?: Database["public"]["Enums"]["rate_limit_scope"]
          p_tenant_id: string
          p_workflow_id: string
        }
        Returns: boolean
      }
      increment_usage: {
        Args: { p_amount?: number; p_counter: string; p_tenant_id: string }
        Returns: undefined
      }
      intervene_conversation: {
        Args: { p_conversation_id: string; p_tenant_id: string }
        Returns: Json
      }
      is_platform_admin: { Args: { _user_id: string }; Returns: boolean }
      is_platform_user: { Args: { allowed_roles: string[] }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      is_support_or_admin: { Args: never; Returns: boolean }
      is_tenant_admin: { Args: { _tenant_id: string }; Returns: boolean }
      is_tenant_member:
        | { Args: { _tenant_id: string }; Returns: boolean }
        | { Args: { _tenant_id: string; _user_id: string }; Returns: boolean }
      is_tenant_owner: { Args: { _tenant_id: string }; Returns: boolean }
      lock_campaign_jobs: {
        Args: { p_limit?: number; p_locked_by?: string }
        Returns: {
          attempts: number | null
          campaign_id: string
          contact_id: string
          created_at: string
          delivered_at: string | null
          error_code: string | null
          error_message: string | null
          failed_at: string | null
          header_media_url: string | null
          id: string
          locked_at: string | null
          locked_by: string | null
          max_attempts: number | null
          phone_number_id: string
          priority: number | null
          read_at: string | null
          recipient_name: string | null
          recipient_phone: string
          replied_at: string | null
          scheduled_at: string
          sent_at: string | null
          skip_reason: string | null
          status: Database["public"]["Enums"]["smeksh_job_status"]
          template_language: string
          template_name: string
          template_variables: Json | null
          tenant_id: string
          updated_at: string
          wamid: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "campaign_jobs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      lock_due_automation_jobs: {
        Args: { p_limit?: number; p_locked_by?: string }
        Returns: {
          attempts: number
          contact_id: string | null
          conversation_id: string | null
          created_at: string
          execute_at: string
          id: string
          last_error: string | null
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          node_id: string | null
          payload: Json
          run_id: string | null
          status: Database["public"]["Enums"]["scheduled_job_status"]
          tenant_id: string
          updated_at: string
          workflow_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "automation_scheduled_jobs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      lock_smeksh_campaign_jobs: {
        Args: { p_limit?: number; p_worker_id: string }
        Returns: {
          ab_variant: string | null
          attempts: number
          campaign_id: string
          contact_id: string | null
          created_at: string
          error_code: string | null
          error_message: string | null
          execute_at: string
          id: string
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          next_retry_at: string | null
          phone_e164: string
          rendered_payload: Json
          status: Database["public"]["Enums"]["smeksh_job_status"]
          tenant_id: string
          updated_at: string
          wa_message_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "smeksh_campaign_jobs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      mark_conversation_read: {
        Args: {
          p_conversation_id: string
          p_profile_id: string
          p_tenant_id: string
        }
        Returns: undefined
      }
      next_invoice_number: { Args: never; Returns: string }
      open_conversation: {
        Args: {
          p_auto_claim?: boolean
          p_conversation_id: string
          p_tenant_id: string
        }
        Returns: Json
      }
      owner_workspace_count: { Args: { p_owner: string }; Returns: number }
      pause_campaign: { Args: { p_campaign_id: string }; Returns: number }
      pause_smeksh_campaign: {
        Args: { p_campaign_id: string; p_tenant_id: string }
        Returns: undefined
      }
      pick_agent_round_robin: {
        Args: { p_team_id: string; p_tenant_id: string }
        Returns: string
      }
      pick_profile_least_busy: {
        Args: {
          p_max_open?: number
          p_only_online?: boolean
          p_team_id: string
          p_tenant_id: string
        }
        Returns: string
      }
      pick_profile_round_robin: {
        Args: {
          p_only_online?: boolean
          p_team_id: string
          p_tenant_id: string
        }
        Returns: string
      }
      platform_revenue_daily: {
        Args: { p_days?: number }
        Returns: {
          day: string
          gross: number
          net: number
          payments_count: number
          refunds: number
        }[]
      }
      platform_revenue_summary: {
        Args: { p_days?: number }
        Returns: {
          active_subscriptions: number
          gross: number
          net: number
          payments_count: number
          refunds: number
        }[]
      }
      schedule_automation_job: {
        Args: {
          p_contact_id: string
          p_conversation_id: string
          p_execute_at: string
          p_node_id: string
          p_payload?: Json
          p_run_id: string
          p_tenant_id: string
          p_workflow_id: string
        }
        Returns: string
      }
      set_automation_cooldown: {
        Args: {
          p_contact_id?: string
          p_cooldown_key: string
          p_scope?: Database["public"]["Enums"]["cooldown_scope"]
          p_seconds: number
          p_tenant_id: string
          p_workflow_id?: string
        }
        Returns: undefined
      }
      set_conversation_intervene: {
        Args: {
          p_conversation_id: string
          p_intervene: boolean
          p_profile_id: string
          p_tenant_id: string
        }
        Returns: undefined
      }
      set_default_phone_number: {
        Args: { p_number_id: string; p_tenant_id: string }
        Returns: undefined
      }
      smeksh_assign_conversation: {
        Args: {
          p_conversation_id: string
          p_only_if_unassigned?: boolean
          p_profile_id: string
          p_workspace_id: string
        }
        Returns: boolean
      }
      smeksh_auto_route_conversation: {
        Args: {
          p_conversation_id: string
          p_only_if_unassigned?: boolean
          p_trigger_event?: string
          p_workspace_id: string
        }
        Returns: Json
      }
      smeksh_get_team_workload: {
        Args: { p_team_id: string; p_workspace_id: string }
        Returns: {
          availability_pct: number
          display_name: string
          is_online: boolean
          max_open_chats: number
          open_count: number
          profile_id: string
        }[]
      }
      smeksh_pick_profile_least_busy: {
        Args: {
          p_max_open?: number
          p_only_online?: boolean
          p_team_id: string
          p_workspace_id: string
        }
        Returns: string
      }
      smeksh_pick_profile_round_robin: {
        Args: {
          p_only_online?: boolean
          p_team_id: string
          p_workspace_id: string
        }
        Returns: string
      }
      snooze_conversation: {
        Args: {
          p_conversation_id: string
          p_profile_id: string
          p_reason?: string
          p_snooze_until: string
          p_tenant_id: string
        }
        Returns: string
      }
      transfer_conversation: {
        Args: {
          p_conversation_id: string
          p_new_assigned_to: string
          p_reset_claim?: boolean
          p_tenant_id: string
        }
        Returns: Json
      }
      update_campaign_progress: {
        Args: { p_campaign_id: string }
        Returns: undefined
      }
      upsert_contact_inbox_summary:
        | {
            Args: {
              p_contact_id: string
              p_conversation_id?: string
              p_phone_number_id: string
              p_tenant_id: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_contact_id: string
              p_conversation_id?: string
              p_phone_number_id: string
              p_tenant_id: string
            }
            Returns: undefined
          }
      users_share_tenant: {
        Args: { user_a: string; user_b: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "owner"
        | "admin"
        | "manager"
        | "agent"
        | "analyst"
        | "billing"
        | "custom"
      audit_action:
        | "login"
        | "logout"
        | "invite_sent"
        | "invite_accepted"
        | "role_changed"
        | "permission_changed"
        | "member_disabled"
        | "member_enabled"
        | "team_created"
        | "team_updated"
        | "team_deleted"
        | "routing_changed"
        | "sla_changed"
        | "template_submitted"
        | "template_approved"
        | "template_rejected"
        | "automation_activated"
        | "automation_paused"
        | "automation_deleted"
        | "tag_added"
        | "tag_removed"
        | "assignment_changed"
        | "conversation_closed"
        | "conversation_reopened"
        | "waba_connected"
        | "settings_changed"
      automation_action:
        | "send_template"
        | "add_tag"
        | "remove_tag"
        | "assign_agent"
        | "webhook"
      automation_node_type:
        | "trigger"
        | "condition"
        | "action"
        | "delay"
        | "branch"
        | "stop"
      automation_trigger:
        | "new_contact"
        | "tag_added"
        | "keyword_received"
        | "inactivity"
        | "scheduled"
      campaign_status:
        | "draft"
        | "scheduled"
        | "running"
        | "paused"
        | "completed"
        | "cancelled"
      conversation_status: "open" | "closed" | "expired"
      cooldown_scope: "workflow" | "node" | "action"
      extended_action_type:
        | "send_template"
        | "send_interactive"
        | "add_tag"
        | "remove_tag"
        | "assign_agent"
        | "set_priority"
        | "set_status"
        | "update_contact_attr"
        | "add_internal_note"
        | "create_task"
        | "call_webhook"
        | "stop_workflow"
      extended_condition_type:
        | "contact_has_tag"
        | "contact_not_has_tag"
        | "contact_attr_eq"
        | "contact_attr_contains"
        | "contact_source_in"
        | "opt_in_required"
        | "time_window"
        | "conversation_status_in"
        | "assigned_agent_exists"
        | "last_message_direction"
        | "mau_status"
        | "regex_match"
      extended_trigger_type:
        | "new_contact_created"
        | "first_inbound_message"
        | "inbound_message"
        | "outbound_message"
        | "keyword_received"
        | "tag_added"
        | "tag_removed"
        | "scheduled_time"
        | "inactivity_no_reply"
        | "conversation_opened"
        | "conversation_closed"
        | "agent_intervened"
        | "button_clicked"
        | "template_delivered"
        | "template_read"
        | "contact_updated"
      flow_status: "draft" | "active" | "inactive" | "archived"
      flow_trigger_type:
        | "keyword"
        | "regex"
        | "qr"
        | "meta_ad"
        | "api"
        | "manual"
        | "fallback"
      flow_version_status: "draft" | "published" | "archived"
      member_status: "active" | "invited" | "suspended" | "disabled"
      message_direction: "inbound" | "outbound"
      message_status: "pending" | "sent" | "delivered" | "read" | "failed"
      message_type:
        | "text"
        | "image"
        | "video"
        | "audio"
        | "document"
        | "sticker"
        | "location"
        | "contact"
        | "template"
        | "interactive"
        | "reaction"
        | "unknown"
      permission_category:
        | "messaging"
        | "contacts"
        | "templates"
        | "campaigns"
        | "automation"
        | "integrations"
        | "billing"
        | "security"
        | "phone_numbers"
        | "team"
      phone_status: "pending" | "connected" | "disconnected" | "banned"
      platform_role: "super_admin" | "support"
      presence_status: "online" | "offline" | "away" | "busy"
      quality_rating: "GREEN" | "YELLOW" | "RED" | "UNKNOWN"
      rate_limit_scope:
        | "workflow_per_contact"
        | "workflow_per_workspace"
        | "action_per_contact"
        | "action_per_workspace"
        | "global_per_contact"
      routing_strategy:
        | "round_robin"
        | "least_busy"
        | "skill_based"
        | "vip_routing"
        | "manual"
        | "overflow"
      scheduled_job_status:
        | "queued"
        | "running"
        | "done"
        | "failed"
        | "cancelled"
      smeksh_ab_status:
        | "draft"
        | "running"
        | "completed"
        | "winner_selected"
        | "stopped"
      smeksh_ad_status: "active" | "paused" | "deleted" | "archived"
      smeksh_attribute_type:
        | "TEXT"
        | "NUMBER"
        | "BOOLEAN"
        | "DATE"
        | "DATETIME"
        | "SELECT"
        | "MULTISELECT"
        | "JSON"
      smeksh_attribution_window: "1_day" | "7_days" | "28_days"
      smeksh_audience_source: "segment" | "tags" | "csv" | "manual" | "ctwa"
      smeksh_campaign_goal:
        | "announcement"
        | "promotion"
        | "followup"
        | "education"
        | "reminder"
        | "engagement"
      smeksh_campaign_status:
        | "draft"
        | "scheduled"
        | "sending"
        | "paused"
        | "completed"
        | "failed"
        | "cancelled"
      smeksh_campaign_type:
        | "broadcast"
        | "drip"
        | "retarget"
        | "ctwa_followup"
        | "ab_test"
      smeksh_contact_status: "ACTIVE" | "ARCHIVED" | "BLOCKED"
      smeksh_conversation_event_type:
        | "conversation_created"
        | "status_changed"
        | "assigned"
        | "unassigned"
        | "tag_added"
        | "tag_removed"
        | "note_added"
        | "automation_ran"
        | "campaign_sent"
        | "ctwa_attributed"
        | "snoozed"
        | "unsnoozed"
        | "priority_changed"
        | "intervened"
        | "bot_resumed"
      smeksh_conversation_status: "OPEN" | "PENDING" | "CLOSED"
      smeksh_deal_stage: "OPEN" | "WON" | "LOST"
      smeksh_event_type:
        | "queued"
        | "sent"
        | "delivered"
        | "read"
        | "replied"
        | "failed"
        | "skipped"
        | "cancelled"
      smeksh_filter_join: "AND" | "OR"
      smeksh_import_status:
        | "PENDING"
        | "PROCESSING"
        | "COMPLETED"
        | "FAILED"
        | "CANCELLED"
      smeksh_job_status:
        | "queued"
        | "processing"
        | "sent"
        | "delivered"
        | "read"
        | "replied"
        | "failed"
        | "cancelled"
        | "skipped"
      smeksh_lead_status:
        | "NEW"
        | "CONTACTED"
        | "QUALIFIED"
        | "CONVERTED"
        | "LOST"
      smeksh_limit_tier:
        | "tier_1k"
        | "tier_10k"
        | "tier_100k"
        | "tier_unlimited"
        | "unknown"
      smeksh_mau_status: "ACTIVE" | "INACTIVE"
      smeksh_message_direction: "inbound" | "outbound"
      smeksh_message_type:
        | "text"
        | "image"
        | "video"
        | "audio"
        | "document"
        | "sticker"
        | "location"
        | "contact"
        | "interactive"
        | "template"
        | "system"
      smeksh_meta_connection_status:
        | "pending"
        | "connected"
        | "disconnected"
        | "error"
      smeksh_note_visibility: "internal" | "private"
      smeksh_number_status:
        | "connected"
        | "pending"
        | "verification_required"
        | "disconnected"
        | "disabled"
        | "error"
      smeksh_optin_source:
        | "WEBSITE"
        | "FORM"
        | "WHATSAPP"
        | "QR"
        | "CRM"
        | "IMPORT"
        | "API"
        | "OTHER"
      smeksh_quality_rating: "green" | "yellow" | "red" | "unknown"
      smeksh_report_status: "generating" | "ready" | "failed"
      smeksh_typing_status: "typing" | "stopped"
      smeksh_wa_status: "sent" | "delivered" | "read" | "failed"
      smeksh_webhook_health: "healthy" | "degraded" | "down" | "unknown"
      smeksh_winner_metric: "reply_rate" | "read_rate" | "conversion_rate"
      subscription_status:
        | "active"
        | "past_due"
        | "canceled"
        | "incomplete"
        | "trialing"
        | "paused"
      tag_apply_to: "contacts" | "conversations" | "both"
      tag_status: "active" | "archived"
      tag_type:
        | "first_message"
        | "lifecycle"
        | "intent"
        | "priority"
        | "automation"
        | "compliance"
        | "custom"
      template_category: "MARKETING" | "UTILITY" | "AUTHENTICATION"
      template_status:
        | "PENDING"
        | "APPROVED"
        | "REJECTED"
        | "PAUSED"
        | "DISABLED"
      tenant_role: "owner" | "admin" | "agent"
      wa_event_kind:
        | "STATUS_CHANGE"
        | "SUBMITTED"
        | "APPROVED"
        | "REJECTED"
        | "ERROR"
        | "NOTE"
      wa_template_category: "UTILITY" | "MARKETING" | "AUTHENTICATION"
      wa_template_status:
        | "DRAFT"
        | "SUBMITTED"
        | "UNDER_REVIEW"
        | "APPROVED"
        | "REJECTED"
        | "PAUSED"
      wa_validation_risk: "LOW" | "MEDIUM" | "HIGH"
      waba_status: "pending" | "active" | "suspended" | "disconnected"
      workflow_run_status:
        | "running"
        | "success"
        | "failed"
        | "skipped"
        | "cancelled"
      workflow_status: "draft" | "active" | "paused" | "archived"
      workflow_step_status: "started" | "success" | "failed" | "skipped"
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
        "owner",
        "admin",
        "manager",
        "agent",
        "analyst",
        "billing",
        "custom",
      ],
      audit_action: [
        "login",
        "logout",
        "invite_sent",
        "invite_accepted",
        "role_changed",
        "permission_changed",
        "member_disabled",
        "member_enabled",
        "team_created",
        "team_updated",
        "team_deleted",
        "routing_changed",
        "sla_changed",
        "template_submitted",
        "template_approved",
        "template_rejected",
        "automation_activated",
        "automation_paused",
        "automation_deleted",
        "tag_added",
        "tag_removed",
        "assignment_changed",
        "conversation_closed",
        "conversation_reopened",
        "waba_connected",
        "settings_changed",
      ],
      automation_action: [
        "send_template",
        "add_tag",
        "remove_tag",
        "assign_agent",
        "webhook",
      ],
      automation_node_type: [
        "trigger",
        "condition",
        "action",
        "delay",
        "branch",
        "stop",
      ],
      automation_trigger: [
        "new_contact",
        "tag_added",
        "keyword_received",
        "inactivity",
        "scheduled",
      ],
      campaign_status: [
        "draft",
        "scheduled",
        "running",
        "paused",
        "completed",
        "cancelled",
      ],
      conversation_status: ["open", "closed", "expired"],
      cooldown_scope: ["workflow", "node", "action"],
      extended_action_type: [
        "send_template",
        "send_interactive",
        "add_tag",
        "remove_tag",
        "assign_agent",
        "set_priority",
        "set_status",
        "update_contact_attr",
        "add_internal_note",
        "create_task",
        "call_webhook",
        "stop_workflow",
      ],
      extended_condition_type: [
        "contact_has_tag",
        "contact_not_has_tag",
        "contact_attr_eq",
        "contact_attr_contains",
        "contact_source_in",
        "opt_in_required",
        "time_window",
        "conversation_status_in",
        "assigned_agent_exists",
        "last_message_direction",
        "mau_status",
        "regex_match",
      ],
      extended_trigger_type: [
        "new_contact_created",
        "first_inbound_message",
        "inbound_message",
        "outbound_message",
        "keyword_received",
        "tag_added",
        "tag_removed",
        "scheduled_time",
        "inactivity_no_reply",
        "conversation_opened",
        "conversation_closed",
        "agent_intervened",
        "button_clicked",
        "template_delivered",
        "template_read",
        "contact_updated",
      ],
      flow_status: ["draft", "active", "inactive", "archived"],
      flow_trigger_type: [
        "keyword",
        "regex",
        "qr",
        "meta_ad",
        "api",
        "manual",
        "fallback",
      ],
      flow_version_status: ["draft", "published", "archived"],
      member_status: ["active", "invited", "suspended", "disabled"],
      message_direction: ["inbound", "outbound"],
      message_status: ["pending", "sent", "delivered", "read", "failed"],
      message_type: [
        "text",
        "image",
        "video",
        "audio",
        "document",
        "sticker",
        "location",
        "contact",
        "template",
        "interactive",
        "reaction",
        "unknown",
      ],
      permission_category: [
        "messaging",
        "contacts",
        "templates",
        "campaigns",
        "automation",
        "integrations",
        "billing",
        "security",
        "phone_numbers",
        "team",
      ],
      phone_status: ["pending", "connected", "disconnected", "banned"],
      platform_role: ["super_admin", "support"],
      presence_status: ["online", "offline", "away", "busy"],
      quality_rating: ["GREEN", "YELLOW", "RED", "UNKNOWN"],
      rate_limit_scope: [
        "workflow_per_contact",
        "workflow_per_workspace",
        "action_per_contact",
        "action_per_workspace",
        "global_per_contact",
      ],
      routing_strategy: [
        "round_robin",
        "least_busy",
        "skill_based",
        "vip_routing",
        "manual",
        "overflow",
      ],
      scheduled_job_status: [
        "queued",
        "running",
        "done",
        "failed",
        "cancelled",
      ],
      smeksh_ab_status: [
        "draft",
        "running",
        "completed",
        "winner_selected",
        "stopped",
      ],
      smeksh_ad_status: ["active", "paused", "deleted", "archived"],
      smeksh_attribute_type: [
        "TEXT",
        "NUMBER",
        "BOOLEAN",
        "DATE",
        "DATETIME",
        "SELECT",
        "MULTISELECT",
        "JSON",
      ],
      smeksh_attribution_window: ["1_day", "7_days", "28_days"],
      smeksh_audience_source: ["segment", "tags", "csv", "manual", "ctwa"],
      smeksh_campaign_goal: [
        "announcement",
        "promotion",
        "followup",
        "education",
        "reminder",
        "engagement",
      ],
      smeksh_campaign_status: [
        "draft",
        "scheduled",
        "sending",
        "paused",
        "completed",
        "failed",
        "cancelled",
      ],
      smeksh_campaign_type: [
        "broadcast",
        "drip",
        "retarget",
        "ctwa_followup",
        "ab_test",
      ],
      smeksh_contact_status: ["ACTIVE", "ARCHIVED", "BLOCKED"],
      smeksh_conversation_event_type: [
        "conversation_created",
        "status_changed",
        "assigned",
        "unassigned",
        "tag_added",
        "tag_removed",
        "note_added",
        "automation_ran",
        "campaign_sent",
        "ctwa_attributed",
        "snoozed",
        "unsnoozed",
        "priority_changed",
        "intervened",
        "bot_resumed",
      ],
      smeksh_conversation_status: ["OPEN", "PENDING", "CLOSED"],
      smeksh_deal_stage: ["OPEN", "WON", "LOST"],
      smeksh_event_type: [
        "queued",
        "sent",
        "delivered",
        "read",
        "replied",
        "failed",
        "skipped",
        "cancelled",
      ],
      smeksh_filter_join: ["AND", "OR"],
      smeksh_import_status: [
        "PENDING",
        "PROCESSING",
        "COMPLETED",
        "FAILED",
        "CANCELLED",
      ],
      smeksh_job_status: [
        "queued",
        "processing",
        "sent",
        "delivered",
        "read",
        "replied",
        "failed",
        "cancelled",
        "skipped",
      ],
      smeksh_lead_status: [
        "NEW",
        "CONTACTED",
        "QUALIFIED",
        "CONVERTED",
        "LOST",
      ],
      smeksh_limit_tier: [
        "tier_1k",
        "tier_10k",
        "tier_100k",
        "tier_unlimited",
        "unknown",
      ],
      smeksh_mau_status: ["ACTIVE", "INACTIVE"],
      smeksh_message_direction: ["inbound", "outbound"],
      smeksh_message_type: [
        "text",
        "image",
        "video",
        "audio",
        "document",
        "sticker",
        "location",
        "contact",
        "interactive",
        "template",
        "system",
      ],
      smeksh_meta_connection_status: [
        "pending",
        "connected",
        "disconnected",
        "error",
      ],
      smeksh_note_visibility: ["internal", "private"],
      smeksh_number_status: [
        "connected",
        "pending",
        "verification_required",
        "disconnected",
        "disabled",
        "error",
      ],
      smeksh_optin_source: [
        "WEBSITE",
        "FORM",
        "WHATSAPP",
        "QR",
        "CRM",
        "IMPORT",
        "API",
        "OTHER",
      ],
      smeksh_quality_rating: ["green", "yellow", "red", "unknown"],
      smeksh_report_status: ["generating", "ready", "failed"],
      smeksh_typing_status: ["typing", "stopped"],
      smeksh_wa_status: ["sent", "delivered", "read", "failed"],
      smeksh_webhook_health: ["healthy", "degraded", "down", "unknown"],
      smeksh_winner_metric: ["reply_rate", "read_rate", "conversion_rate"],
      subscription_status: [
        "active",
        "past_due",
        "canceled",
        "incomplete",
        "trialing",
        "paused",
      ],
      tag_apply_to: ["contacts", "conversations", "both"],
      tag_status: ["active", "archived"],
      tag_type: [
        "first_message",
        "lifecycle",
        "intent",
        "priority",
        "automation",
        "compliance",
        "custom",
      ],
      template_category: ["MARKETING", "UTILITY", "AUTHENTICATION"],
      template_status: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "PAUSED",
        "DISABLED",
      ],
      tenant_role: ["owner", "admin", "agent"],
      wa_event_kind: [
        "STATUS_CHANGE",
        "SUBMITTED",
        "APPROVED",
        "REJECTED",
        "ERROR",
        "NOTE",
      ],
      wa_template_category: ["UTILITY", "MARKETING", "AUTHENTICATION"],
      wa_template_status: [
        "DRAFT",
        "SUBMITTED",
        "UNDER_REVIEW",
        "APPROVED",
        "REJECTED",
        "PAUSED",
      ],
      wa_validation_risk: ["LOW", "MEDIUM", "HIGH"],
      waba_status: ["pending", "active", "suspended", "disconnected"],
      workflow_run_status: [
        "running",
        "success",
        "failed",
        "skipped",
        "cancelled",
      ],
      workflow_status: ["draft", "active", "paused", "archived"],
      workflow_step_status: ["started", "success", "failed", "skipped"],
    },
  },
} as const
