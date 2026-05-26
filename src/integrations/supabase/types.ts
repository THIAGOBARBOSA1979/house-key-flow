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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          category: string | null
          company_id: string | null
          correlation_id: string | null
          created_at: string | null
          device_id: string | null
          entity_id: string | null
          entity_type: string
          environment: string | null
          event_hash: string | null
          id: string
          ip_address: string | null
          is_system_event: boolean | null
          location: Json | null
          module_name: string | null
          origin: string | null
          payload: Json | null
          previous_values: Json | null
          service_name: string | null
          severity: string | null
          tenant_id: string | null
          trace_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          category?: string | null
          company_id?: string | null
          correlation_id?: string | null
          created_at?: string | null
          device_id?: string | null
          entity_id?: string | null
          entity_type: string
          environment?: string | null
          event_hash?: string | null
          id?: string
          ip_address?: string | null
          is_system_event?: boolean | null
          location?: Json | null
          module_name?: string | null
          origin?: string | null
          payload?: Json | null
          previous_values?: Json | null
          service_name?: string | null
          severity?: string | null
          tenant_id?: string | null
          trace_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          category?: string | null
          company_id?: string | null
          correlation_id?: string | null
          created_at?: string | null
          device_id?: string | null
          entity_id?: string | null
          entity_type?: string
          environment?: string | null
          event_hash?: string | null
          id?: string
          ip_address?: string | null
          is_system_event?: boolean | null
          location?: Json | null
          module_name?: string | null
          origin?: string | null
          payload?: Json | null
          previous_values?: Json | null
          service_name?: string | null
          severity?: string | null
          tenant_id?: string | null
          trace_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          abnt_reference: string | null
          company_id: string | null
          description: string | null
          group_name: string
          id: string
          name: string
          required: boolean | null
          sort_order: number | null
          template_id: string
        }
        Insert: {
          abnt_reference?: string | null
          company_id?: string | null
          description?: string | null
          group_name: string
          id?: string
          name: string
          required?: boolean | null
          sort_order?: number | null
          template_id: string
        }
        Update: {
          abnt_reference?: string | null
          company_id?: string | null
          description?: string | null
          group_name?: string
          id?: string
          name?: string
          required?: boolean | null
          sort_order?: number | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          category: string | null
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          title: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      client_events: {
        Row: {
          client_id: string
          company_id: string | null
          created_at: string | null
          description: string | null
          event_type: string
          id: string
          metadata: Json | null
          title: string
        }
        Insert: {
          client_id: string
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          title: string
        }
        Update: {
          client_id?: string
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          block: string | null
          company_id: string | null
          created_at: string | null
          current_stage: string
          email: string
          floor: string | null
          governance_metadata: Json | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          property_id: string | null
          property_name: string | null
          stage_history: Json | null
          unit_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          block?: string | null
          company_id?: string | null
          created_at?: string | null
          current_stage?: string
          email: string
          floor?: string | null
          governance_metadata?: Json | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          property_id?: string | null
          property_name?: string | null
          stage_history?: Json | null
          unit_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          block?: string | null
          company_id?: string | null
          created_at?: string | null
          current_stage?: string
          email?: string
          floor?: string | null
          governance_metadata?: Json | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          property_id?: string | null
          property_name?: string | null
          stage_history?: Json | null
          unit_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_profiles_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          brand_name: string | null
          created_at: string
          custom_domain: string | null
          favicon_url: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          plan_id: string | null
          slug: string
          status: string
          subdomain: string | null
          subscription_expires_at: string | null
          subscription_plan: string
          subscription_status: string | null
          theme_settings: Json | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          brand_name?: string | null
          created_at?: string
          custom_domain?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          plan_id?: string | null
          slug: string
          status?: string
          subdomain?: string | null
          subscription_expires_at?: string | null
          subscription_plan?: string
          subscription_status?: string | null
          theme_settings?: Json | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          brand_name?: string | null
          created_at?: string
          custom_domain?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          plan_id?: string | null
          slug?: string
          status?: string
          subdomain?: string | null
          subscription_expires_at?: string | null
          subscription_plan?: string
          subscription_status?: string | null
          theme_settings?: Json | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      company_subscriptions: {
        Row: {
          billing_cycle: string | null
          cancel_at_period_end: boolean | null
          company_id: string
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string | null
          cancel_at_period_end?: boolean | null
          company_id: string
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          plan_id: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string | null
          cancel_at_period_end?: boolean | null
          company_id?: string
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      construction_updates: {
        Row: {
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_global: boolean | null
          progress_data: Json | null
          property_id: string | null
          status: string
          title: string
          update_type: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_global?: boolean | null
          progress_data?: Json | null
          property_id?: string | null
          status?: string
          title: string
          update_type: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_global?: boolean | null
          progress_data?: Json | null
          property_id?: string | null
          status?: string
          title?: string
          update_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "construction_updates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "construction_updates_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          client_id: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          file_name: string | null
          file_size: string | null
          file_url: string | null
          id: string
          property_id: string | null
          status: string
          title: string
          unit_number: string | null
          updated_at: string | null
          version: number | null
          visible_to_client: boolean | null
        }
        Insert: {
          category: string
          client_id?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          file_name?: string | null
          file_size?: string | null
          file_url?: string | null
          id?: string
          property_id?: string | null
          status?: string
          title: string
          unit_number?: string | null
          updated_at?: string | null
          version?: number | null
          visible_to_client?: boolean | null
        }
        Update: {
          category?: string
          client_id?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          file_name?: string | null
          file_size?: string | null
          file_url?: string | null
          id?: string
          property_id?: string | null
          status?: string
          title?: string
          unit_number?: string | null
          updated_at?: string | null
          version?: number | null
          visible_to_client?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_drafts: {
        Row: {
          company_id: string | null
          created_at: string | null
          data: Json
          id: string
          inspection_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          data?: Json
          id?: string
          inspection_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          data?: Json
          id?: string
          inspection_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_drafts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_drafts_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          checklist_id: string | null
          client_id: string | null
          company_id: string
          conformity_score: number | null
          created_at: string
          date: string | null
          id: string
          notes: string | null
          priority: string | null
          property_id: string | null
          status: string | null
          technician_id: string | null
          type: string | null
          unit_number: string | null
          updated_at: string | null
        }
        Insert: {
          checklist_id?: string | null
          client_id?: string | null
          company_id: string
          conformity_score?: number | null
          created_at?: string
          date?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          property_id?: string | null
          status?: string | null
          technician_id?: string | null
          type?: string | null
          unit_number?: string | null
          updated_at?: string | null
        }
        Update: {
          checklist_id?: string | null
          client_id?: string | null
          company_id?: string
          conformity_score?: number | null
          created_at?: string
          date?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          property_id?: string | null
          status?: string | null
          technician_id?: string | null
          type?: string | null
          unit_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspections_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          company_id: string
          content: string | null
          created_at: string | null
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          module: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          module: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          module?: string
          name?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_properties: number
          max_storage_mb: number
          max_users: number
          name: string
          price_monthly: number
          price_yearly: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_properties?: number
          max_storage_mb?: number
          max_users?: number
          name: string
          price_monthly: number
          price_yearly: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_properties?: number
          max_storage_mb?: number
          max_users?: number
          name?: string
          price_monthly?: number
          price_yearly?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string
          full_name: string | null
          id: string
          is_super_admin: boolean | null
          last_login: string | null
          notes: string | null
          phone: string | null
          role: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_super_admin?: boolean | null
          last_login?: string | null
          notes?: string | null
          phone?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_super_admin?: boolean | null
          last_login?: string | null
          notes?: string | null
          phone?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          company_id: string
          created_at: string
          delivery_date: string | null
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          manager_id: string | null
          milestones: Json | null
          name: string
          status: string | null
          total_area: number | null
          units_completed: number | null
          units_list: Json | null
          units_total: number | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          delivery_date?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          manager_id?: string | null
          milestones?: Json | null
          name: string
          status?: string | null
          total_area?: number | null
          units_completed?: number | null
          units_list?: Json | null
          units_total?: number | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          delivery_date?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          manager_id?: string | null
          milestones?: Json | null
          name?: string
          status?: string | null
          total_area?: number | null
          units_completed?: number | null
          units_list?: Json | null
          units_total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          id: string
          permission_id: string | null
          role: string
        }
        Insert: {
          id?: string
          permission_id?: string | null
          role: string
        }
        Update: {
          id?: string
          permission_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      roles_permissions: {
        Row: {
          company_id: string | null
          created_at: string | null
          enabled: boolean | null
          id: string
          permission: string
          role: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          permission: string
          role: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          permission?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_permissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          company_id: string
          content: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_internal: boolean | null
          receiver_id: string | null
          sender_id: string
        }
        Insert: {
          company_id: string
          content: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_internal?: boolean | null
          receiver_id?: string | null
          sender_id: string
        }
        Update: {
          company_id?: string
          content?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_internal?: boolean | null
          receiver_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          priority: string | null
          property_id: string | null
          protocol: string
          status: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          property_id?: string | null
          protocol: string
          status?: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          property_id?: string | null
          protocol?: string
          status?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          settings: Json
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          settings?: Json
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          settings?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      technicians: {
        Row: {
          company_id: string
          created_at: string | null
          email: string | null
          experience_level: string | null
          id: string
          name: string
          phone: string | null
          rating: number | null
          specialties: string[] | null
          status: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          email?: string | null
          experience_level?: string | null
          id?: string
          name: string
          phone?: string | null
          rating?: number | null
          specialties?: string[] | null
          status?: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          email?: string | null
          experience_level?: string | null
          id?: string
          name?: string
          phone?: string | null
          rating?: number | null
          specialties?: string[] | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "technicians_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          company_id: string | null
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          sender_id: string | null
          sender_type: string
          ticket_id: string
          whatsapp_message_id: string | null
        }
        Insert: {
          company_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          sender_id?: string | null
          sender_type: string
          ticket_id: string
          whatsapp_message_id?: string | null
        }
        Update: {
          company_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          sender_id?: string | null
          sender_type?: string
          ticket_id?: string
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          preferences: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          preferences?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          preferences?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      warranty_history: {
        Row: {
          changed_by: string | null
          company_id: string | null
          created_at: string | null
          from_status: string | null
          id: string
          notes: string | null
          request_id: string
          to_status: string
        }
        Insert: {
          changed_by?: string | null
          company_id?: string | null
          created_at?: string | null
          from_status?: string | null
          id?: string
          notes?: string | null
          request_id: string
          to_status: string
        }
        Update: {
          changed_by?: string | null
          company_id?: string | null
          created_at?: string | null
          from_status?: string | null
          id?: string
          notes?: string | null
          request_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "warranty_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "warranty_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      warranty_items: {
        Row: {
          category: string
          client_id: string | null
          company_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          property_id: string | null
          property_name: string | null
          status: string
          unit_number: string | null
          updated_at: string | null
          warranty_end_date: string
          warranty_start_date: string
          warranty_years: number | null
        }
        Insert: {
          category: string
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          property_id?: string | null
          property_name?: string | null
          status?: string
          unit_number?: string | null
          updated_at?: string | null
          warranty_end_date: string
          warranty_start_date: string
          warranty_years?: number | null
        }
        Update: {
          category?: string
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          property_id?: string | null
          property_name?: string | null
          status?: string
          unit_number?: string | null
          updated_at?: string | null
          warranty_end_date?: string
          warranty_start_date?: string
          warranty_years?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "warranty_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      warranty_problem_breakdown: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          location: string | null
          photos: string[] | null
          request_id: string | null
          severity: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          photos?: string[] | null
          request_id?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          photos?: string[] | null
          request_id?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warranty_problem_breakdown_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "warranty_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      warranty_requests: {
        Row: {
          actual_cost: number | null
          assigned_technician_id: string | null
          category: string
          client_id: string
          company_id: string
          created_at: string | null
          description: string | null
          estimated_cost: number | null
          history: Json | null
          id: string
          internal_notes: string | null
          is_paused: boolean | null
          materials: Json | null
          pause_reason: string | null
          paused_at: string | null
          priority: string
          problems: Json | null
          property_id: string
          sla_deadline: string | null
          sla_status: string | null
          stage_started_at: string | null
          status: string
          title: string
          unit_number: string
          updated_at: string | null
          updates: Json | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_technician_id?: string | null
          category: string
          client_id: string
          company_id: string
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          history?: Json | null
          id?: string
          internal_notes?: string | null
          is_paused?: boolean | null
          materials?: Json | null
          pause_reason?: string | null
          paused_at?: string | null
          priority?: string
          problems?: Json | null
          property_id: string
          sla_deadline?: string | null
          sla_status?: string | null
          stage_started_at?: string | null
          status?: string
          title: string
          unit_number: string
          updated_at?: string | null
          updates?: Json | null
        }
        Update: {
          actual_cost?: number | null
          assigned_technician_id?: string | null
          category?: string
          client_id?: string
          company_id?: string
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          history?: Json | null
          id?: string
          internal_notes?: string | null
          is_paused?: boolean | null
          materials?: Json | null
          pause_reason?: string | null
          paused_at?: string | null
          priority?: string
          problems?: Json | null
          property_id?: string
          sla_deadline?: string | null
          sla_status?: string | null
          stage_started_at?: string | null
          status?: string
          title?: string
          unit_number?: string
          updated_at?: string | null
          updates?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "warranty_requests_assigned_technician_id_fkey"
            columns: ["assigned_technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      warranty_sla_configs: {
        Row: {
          analysis_hours: number
          company_id: string | null
          created_at: string | null
          decision_hours: number
          execution_hours: number
          id: string
          inspection_hours: number
          total_hours: number
          updated_at: string | null
          warranty_type: string
        }
        Insert: {
          analysis_hours?: number
          company_id?: string | null
          created_at?: string | null
          decision_hours?: number
          execution_hours?: number
          id?: string
          inspection_hours?: number
          total_hours?: number
          updated_at?: string | null
          warranty_type: string
        }
        Update: {
          analysis_hours?: number
          company_id?: string | null
          created_at?: string | null
          decision_hours?: number
          execution_hours?: number
          id?: string
          inspection_hours?: number
          total_hours?: number
          updated_at?: string | null
          warranty_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "warranty_sla_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      warranty_status_history: {
        Row: {
          changed_by: string | null
          company_id: string | null
          created_at: string | null
          from_status: string | null
          id: string
          is_automatic: boolean | null
          notes: string | null
          request_id: string | null
          to_status: string
        }
        Insert: {
          changed_by?: string | null
          company_id?: string | null
          created_at?: string | null
          from_status?: string | null
          id?: string
          is_automatic?: boolean | null
          notes?: string | null
          request_id?: string | null
          to_status: string
        }
        Update: {
          changed_by?: string | null
          company_id?: string | null
          created_at?: string | null
          from_status?: string | null
          id?: string
          is_automatic?: boolean | null
          notes?: string | null
          request_id?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "warranty_status_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_status_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "warranty_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          company_id: string
          created_at: string | null
          events: string[] | null
          id: string
          is_active: boolean | null
          secret: string | null
          url: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          events?: string[] | null
          id?: string
          is_active?: boolean | null
          secret?: string | null
          url: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          events?: string[] | null
          id?: string
          is_active?: boolean | null
          secret?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_endpoints_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_configs: {
        Row: {
          api_key: string | null
          api_url: string | null
          company_id: string
          created_at: string | null
          id: string
          instance_name: string | null
          is_active: boolean | null
          phone_number_id: string | null
          provider: string
          updated_at: string | null
          verify_token: string | null
        }
        Insert: {
          api_key?: string | null
          api_url?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          instance_name?: string | null
          is_active?: boolean | null
          phone_number_id?: string | null
          provider: string
          updated_at?: string | null
          verify_token?: string | null
        }
        Update: {
          api_key?: string | null
          api_url?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          instance_name?: string | null
          is_active?: boolean | null
          phone_number_id?: string | null
          provider?: string
          updated_at?: string | null
          verify_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth_company_id: { Args: never; Returns: string }
      get_auth_user_role: { Args: never; Returns: string }
      is_super_admin: { Args: never; Returns: boolean }
      log_audit_action:
        | {
            Args: {
              p_action: string
              p_category?: string
              p_correlation_id?: string
              p_entity_id?: string
              p_entity_type: string
              p_module_name?: string
              p_origin?: string
              p_payload?: Json
              p_previous_values?: Json
              p_severity?: string
              p_trace_id?: string
            }
            Returns: string
          }
        | {
            Args: {
              p_action: string
              p_entity_id: string
              p_entity_type: string
              p_payload?: Json
              p_previous_values?: Json
            }
            Returns: undefined
          }
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
  public: {
    Enums: {},
  },
} as const
