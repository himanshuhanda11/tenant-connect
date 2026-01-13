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
      campaigns: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          delivered_count: number | null
          description: string | null
          failed_count: number | null
          id: string
          name: string
          phone_number_id: string
          read_count: number | null
          scheduled_at: string | null
          sent_count: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          target_tags: string[] | null
          template_id: string
          tenant_id: string
          total_recipients: number | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          delivered_count?: number | null
          description?: string | null
          failed_count?: number | null
          id?: string
          name: string
          phone_number_id: string
          read_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_tags?: string[] | null
          template_id: string
          tenant_id: string
          total_recipients?: number | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          delivered_count?: number | null
          description?: string | null
          failed_count?: number | null
          id?: string
          name?: string
          phone_number_id?: string
          read_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_tags?: string[] | null
          template_id?: string
          tenant_id?: string
          total_recipients?: number | null
          updated_at?: string
        }
        Relationships: [
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
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assigned_to: string | null
          contact_id: string
          created_at: string
          id: string
          last_inbound_at: string | null
          last_message_at: string | null
          phone_number_id: string
          status: Database["public"]["Enums"]["conversation_status"]
          tenant_id: string
          unread_count: number
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          contact_id: string
          created_at?: string
          id?: string
          last_inbound_at?: string | null
          last_message_at?: string | null
          phone_number_id: string
          status?: Database["public"]["Enums"]["conversation_status"]
          tenant_id: string
          unread_count?: number
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          contact_id?: string
          created_at?: string
          id?: string
          last_inbound_at?: string | null
          last_message_at?: string | null
          phone_number_id?: string
          status?: Database["public"]["Enums"]["conversation_status"]
          tenant_id?: string
          unread_count?: number
          updated_at?: string
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
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
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
          media_mime_type: string | null
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
          media_mime_type?: string | null
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
          media_mime_type?: string | null
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
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_numbers: {
        Row: {
          created_at: string
          display_number: string
          id: string
          phone_number_id: string
          quality_rating: Database["public"]["Enums"]["quality_rating"]
          status: Database["public"]["Enums"]["phone_status"]
          tenant_id: string
          updated_at: string
          verified_name: string | null
          waba_account_id: string
        }
        Insert: {
          created_at?: string
          display_number: string
          id?: string
          phone_number_id: string
          quality_rating?: Database["public"]["Enums"]["quality_rating"]
          status?: Database["public"]["Enums"]["phone_status"]
          tenant_id: string
          updated_at?: string
          verified_name?: string | null
          waba_account_id: string
        }
        Update: {
          created_at?: string
          display_number?: string
          id?: string
          phone_number_id?: string
          quality_rating?: Database["public"]["Enums"]["quality_rating"]
          status?: Database["public"]["Enums"]["phone_status"]
          tenant_id?: string
          updated_at?: string
          verified_name?: string | null
          waba_account_id?: string
        }
        Relationships: [
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
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
          name: string
          slug: string
          suspended_at: string | null
          suspended_reason: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_suspended?: boolean | null
          name: string
          slug: string
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_suspended?: boolean | null
          name?: string
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
          updated_at?: string
          waba_id?: string
        }
        Relationships: [
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
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
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
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
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
      check_tenant_limit: {
        Args: { p_limit_key: string; p_tenant_id: string }
        Returns: boolean
      }
      cleanup_automation_expired_records: { Args: never; Returns: undefined }
      cleanup_rate_limit_logs: { Args: never; Returns: undefined }
      create_tenant_with_owner: {
        Args: { _name: string; _slug: string }
        Returns: {
          created_at: string
          id: string
          is_suspended: boolean | null
          name: string
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
      get_tenant_usage: {
        Args: { p_tenant_id: string }
        Returns: {
          contacts_count: number
          monthly_messages: number
          phone_numbers_count: number
          team_members_count: number
        }[]
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
      is_tenant_admin: { Args: { _tenant_id: string }; Returns: boolean }
      is_tenant_member:
        | { Args: { _tenant_id: string }; Returns: boolean }
        | { Args: { _tenant_id: string; _user_id: string }; Returns: boolean }
      is_tenant_owner: { Args: { _tenant_id: string }; Returns: boolean }
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
      users_share_tenant: {
        Args: { user_a: string; user_b: string }
        Returns: boolean
      }
    }
    Enums: {
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
      phone_status: "pending" | "connected" | "disconnected" | "banned"
      quality_rating: "GREEN" | "YELLOW" | "RED" | "UNKNOWN"
      rate_limit_scope:
        | "workflow_per_contact"
        | "workflow_per_workspace"
        | "action_per_contact"
        | "action_per_workspace"
        | "global_per_contact"
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
      phone_status: ["pending", "connected", "disconnected", "banned"],
      quality_rating: ["GREEN", "YELLOW", "RED", "UNKNOWN"],
      rate_limit_scope: [
        "workflow_per_contact",
        "workflow_per_workspace",
        "action_per_contact",
        "action_per_workspace",
        "global_per_contact",
      ],
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
