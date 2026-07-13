
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../env';

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase credentials not found in env.tsx. Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are correctly set.");
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      branches: {
        Row: {
          id: string
          name: string
          code: string
          manager_id: string | null
          address: string | null
          contact_details: string | null
          phone: string | null
          email: string | null
          is_active: boolean
          city_id: string | null
          city_name: string | null
          logo_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          code: string
          manager_id?: string | null
          address?: string | null
          contact_details?: string | null
          phone?: string | null
          email?: string | null
          is_active?: boolean
          city_id?: string | null
          city_name?: string | null
          logo_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          code?: string
          manager_id?: string | null
          address?: string | null
          contact_details?: string | null
          phone?: string | null
          email?: string | null
          is_active?: boolean
          city_id?: string | null
          city_name?: string | null
          logo_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      
      cities: {
        Row: {
          id: string
          city_name: string
          city_code: string
          state: string | null
          status: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          city_name: string
          city_code: string
          state?: string | null
          status?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          city_name?: string
          city_code?: string
          state?: string | null
          status?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
      }
      business_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      industry_types: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          content: string
          created_at: string | null
          id: string
          lead_id: string
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          lead_id: string
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          lead_id?: string
          type?: Database["public"]["Enums"]["activity_type"]
          user_id?: string
        }
      }
      lead_sources: {
        Row: {
          id: string
          source_name: string
          source_code: string
          description: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          source_name: string
          source_code: string
          description?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          source_name?: string
          source_code?: string
          description?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      customers: {
        Row: {
          assigned_to: string | null
          avatar_url: string | null
          business_address: string | null
          business_name: string
          business_category_id: string | null
          industry_type_id: string | null
          lead_source_id: string | null
          referred_by_customer_id: string | null
          referred_by_employee_id: string | null
          created_at: string | null
          created_by: string | null
          date_of_completion: string
          date_of_enroll: string
          email: string
          gender: string | null
          id: string
          lead_id: string
          lead_source: string
          name: string
          payment_details: Json | null
          phone: string
          alternate_mobile: string | null
          alternate_is_whatsapp: boolean | null
          residential_address: string | null
          personal_flat_no: string | null
          personal_street: string | null
          personal_city: string | null
          personal_state: string | null
          personal_country: string | null
          personal_zip_code: string | null
          business_flat_no: string | null
          business_street: string | null
          business_city: string | null
          business_state: string | null
          business_country: string | null
          business_zip_code: string | null
          service_name: string
          sub_service: string | null
          updated_at: string | null
          whatsapp_number: string | null
          pan_number: string | null
          aadhar_number: string | null
          service_amount: number | null
          tax_amount: number | null
          total_amount: number | null
          paid_amount: number | null
          due_amount: number | null
          feedback: string | null
          branch_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          avatar_url?: string | null
          business_address?: string | null
          business_name: string
          business_category_id?: string | null
          industry_type_id?: string | null
          lead_source_id?: string | null
          referred_by_customer_id?: string | null
          referred_by_employee_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date_of_completion: string
          date_of_enroll: string
          email: string
          gender?: string | null
          id?: string
          lead_id: string
          lead_source: string
          name: string
          payment_details?: Json | null
          phone: string
          alternate_mobile?: string | null
          alternate_is_whatsapp?: boolean | null
          residential_address?: string | null
          personal_flat_no?: string | null
          personal_street?: string | null
          personal_city?: string | null
          personal_state?: string | null
          personal_country?: string | null
          personal_zip_code?: string | null
          business_flat_no?: string | null
          business_street?: string | null
          business_city?: string | null
          business_state?: string | null
          business_country?: string | null
          business_zip_code?: string | null
          service_name: string
          sub_service?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
          pan_number?: string | null
          aadhar_number?: string | null
          service_amount?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          paid_amount?: number | null
          due_amount?: number | null
          feedback?: string | null
          branch_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          avatar_url?: string | null
          business_address?: string | null
          business_name?: string
          business_category_id?: string | null
          industry_type_id?: string | null
          lead_source_id?: string | null
          referred_by_customer_id?: string | null
          referred_by_employee_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date_of_completion?: string
          date_of_enroll?: string
          email?: string
          gender?: string | null
          id?: string
          lead_id?: string
          lead_source?: string
          name?: string
          payment_details?: Json | null
          phone?: string
          alternate_mobile?: string | null
          alternate_is_whatsapp?: boolean | null
          residential_address?: string | null
          personal_flat_no?: string | null
          personal_street?: string | null
          personal_city?: string | null
          personal_state?: string | null
          personal_country?: string | null
          personal_zip_code?: string | null
          business_flat_no?: string | null
          business_street?: string | null
          business_city?: string | null
          business_state?: string | null
          business_country?: string | null
          business_zip_code?: string | null
          service_name?: string
          sub_service?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
          pan_number?: string | null
          aadhar_number?: string | null
          service_amount?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          paid_amount?: number | null
          due_amount?: number | null
          feedback?: string | null
          branch_id?: string | null
        }
      }
      documents: {
        Row: {
          id: string
          lead_id: string
          name: string
          status: Database["public"]["Enums"]["document_status"] | null
          city_id: string | null
          city_name: string | null
          type: string
          uploaded_at: string | null
          url: string
          verification_notes: string | null
        }
        Insert: {
          id?: string
          lead_id: string
          name: string
          status?: Database["public"]["Enums"]["document_status"] | null
          city_id?: string | null
          city_name?: string | null
          type: string
          uploaded_at?: string | null
          url: string
          verification_notes?: string | null
        }
        Update: {
          id?: string
          lead_id?: string
          name?: string
          status?: Database["public"]["Enums"]["document_status"] | null
          type?: string
          uploaded_at?: string | null
          url?: string
          verification_notes?: string | null
        }
      }
      leads: {
        Row: {
          assigned_to: string | null
          avatar_url: string | null
          business_address: string | null
          business_name: string
          business_category_id: string | null
          industry_type_id: string | null
          lead_source_id: string | null
          referred_by_customer_id: string | null
          referred_by_employee_id: string | null
          created_at: string | null
          email: string
          first_name: string
          gender: string | null
          id: string
          last_contacted: string | null
          last_name: string
          next_follow_up: string | null
          notes: string | null
          payments: Json | null
          phone_number: string
          priority: Database["public"]["Enums"]["lead_priority"]
          residential_address: string | null
          personal_flat_no: string | null
          personal_street: string | null
          personal_city: string | null
          personal_state: string | null
          personal_country: string | null
          personal_zip_code: string | null
          business_flat_no: string | null
          business_street: string | null
          business_city: string | null
          business_state: string | null
          business_country: string | null
          business_zip_code: string | null
          score: number | null
          service_requested: string
          service_sets: Json | null
          source: string
          status: Database["public"]["Enums"]["lead_status"]
          city_id: string | null
          city_name: string | null
          total_payment: number | null
          advance_amount: number | null
          remaining_amount: number | null
          whatsapp_number: string | null
          alternate_mobile: string | null
          alternate_is_whatsapp: boolean | null
          branch_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          avatar_url?: string | null
          business_address?: string | null
          business_name: string
          business_category_id?: string | null
          industry_type_id?: string | null
          lead_source_id?: string | null
          referred_by_customer_id?: string | null
          referred_by_employee_id?: string | null
          created_at?: string | null
          email: string
          first_name: string
          gender?: string | null
          id?: string
          last_contacted?: string | null
          last_name: string
          next_follow_up?: string | null
          notes?: string | null
          payments?: Json | null
          phone_number: string
          priority: Database["public"]["Enums"]["lead_priority"]
          residential_address?: string | null
          personal_flat_no?: string | null
          personal_street?: string | null
          personal_city?: string | null
          personal_state?: string | null
          personal_country?: string | null
          personal_zip_code?: string | null
          business_flat_no?: string | null
          business_street?: string | null
          business_city?: string | null
          business_state?: string | null
          business_country?: string | null
          business_zip_code?: string | null
          score?: number | null
          service_requested: string
          service_sets?: Json | null
          source: string
          status: Database["public"]["Enums"]["lead_status"]
          total_payment?: number | null
          advance_amount?: number | null
          remaining_amount?: number | null
          whatsapp_number?: string | null
          alternate_mobile?: string | null
          alternate_is_whatsapp?: boolean | null
          branch_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          avatar_url?: string | null
          business_address?: string | null
          business_name?: string
          business_category_id?: string | null
          industry_type_id?: string | null
          lead_source_id?: string | null
          referred_by_customer_id?: string | null
          referred_by_employee_id?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          gender?: string | null
          id?: string
          last_contacted?: string | null
          last_name?: string
          next_follow_up?: string | null
          notes?: string | null
          payments?: Json | null
          phone_number?: string
          priority?: Database["public"]["Enums"]["lead_priority"]
          residential_address?: string | null
          personal_flat_no?: string | null
          personal_street?: string | null
          personal_city?: string | null
          personal_state?: string | null
          personal_country?: string | null
          personal_zip_code?: string | null
          business_flat_no?: string | null
          business_street?: string | null
          business_city?: string | null
          business_state?: string | null
          business_country?: string | null
          business_zip_code?: string | null
          score?: number | null
          service_requested?: string
          service_sets?: Json | null
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          city_id?: string | null
          city_name?: string | null
          total_payment?: number | null
          advance_amount?: number | null
          remaining_amount?: number | null
          whatsapp_number?: string | null
          alternate_mobile?: string | null
          alternate_is_whatsapp?: boolean | null
          branch_id?: string | null
        }
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: Json | null
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: Json | null
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: Json | null
          message?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          branch_name: string | null
          created_at: string | null
          department: string | null
          email: string
          id: string
          is_active: boolean
          city_id: string | null
          city_name: string | null
          last_updated: string | null
          name: string
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"]
          skills: string[] | null
          branch_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          branch_name?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          id: string
          is_active?: boolean
          city_id?: string | null
          city_name?: string | null
          last_updated?: string | null
          name: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          skills?: string[] | null
          branch_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          branch_name?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          id?: string
          is_active?: boolean
          city_id?: string | null
          city_name?: string | null
          last_updated?: string | null
          name?: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          skills?: string[] | null
          branch_id?: string | null
        }
      }
      tasks: {
        Row: {
          completed_at: string | null
          content: string
          created_at: string | null
          created_by: string
          depends_on_task_id: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          lead_id: string
          priority: Database["public"]["Enums"]["task_priority"] | null
          branch_id: string | null
        }
        Insert: {
          completed_at?: string | null
          content: string
          created_at?: string | null
          created_by: string
          depends_on_task_id?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          lead_id: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          branch_id?: string | null
        }
        Update: {
          completed_at?: string | null
          content?: string
          created_at?: string | null
          created_by?: string
          depends_on_task_id?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          lead_id?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          branch_id?: string | null
        }
      }
      user_activities: {
        Row: {
          action: string
          details: string | null
          id: string
          timestamp: string | null
          user_id: string
          branch_id: string | null
        }
        Insert: {
          action: string
          details?: string | null
          id?: string
          timestamp?: string | null
          user_id: string
          branch_id?: string | null
        }
        Update: {
          action?: string
          details?: string | null
          id?: string
          timestamp?: string | null
          user_id?: string
          branch_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_claim: {
        Args: {
          claim: string
        }
        Returns: string
      }
    }
    Enums: {
      activity_type:
      | "Note"
      | "Status Change"
      | "Document Upload"
      | "Call"
      | "Email"
      document_status: "Pending" | "Approved" | "Rejected"
      lead_priority: "Hot" | "Warm" | "Cold"
      lead_status:
      | "New Lead"
      | "Lead Confirmed"
      | "Documents & Payments"
      | "In-Progress"
      | "Success"
      | "Lost"
      notification_type:
      | "Lead Assigned"
      | "Status Updated"
      | "Note Added"
      | "Document Uploaded"
      payment_method: "Cash" | "Card" | "UPI" | "Bank Transfer"
      task_priority: "High" | "Medium" | "Low"
      user_role: "Super Admin" | "Admin" | "Sales Executive" | "Branch Manager" | "Receptionist" | "Team Leader" | "Service Executive" | "Accounts Team"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// IMPORTANT: The initial Super Admin sign-up is now handled by a server-side function,
// so running this script is NO LONGER REQUIRED to get started.
// This script is for setting up the correct, non-recursive security policies for Admins
// and Sales Executives to ensure they can only access the data they are permitted to see.
export const SETUP_SQL_SCRIPT = `
BEGIN;

-- 1. CLEANUP (Drop Policies and Triggers first to ensure clean slate)
DO $$ 
DECLARE pol record; 
BEGIN 
    -- Drop all policies on public tables
    FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename); 
    END LOOP;
END $$;

-- Drop Triggers to prevent side-effects during setup
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_lead_created_meta ON public.leads;
DROP TRIGGER IF EXISTS on_customer_created_meta ON public.customers;

-- Add structured address columns to public.leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS personal_flat_no TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS personal_street TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS personal_city TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS personal_state TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS personal_country TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS personal_zip_code TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS business_flat_no TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS business_street TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS business_city TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS business_state TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS business_country TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS business_zip_code TEXT;

-- Add structured address columns to public.customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS personal_flat_no TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS personal_street TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS personal_city TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS personal_state TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS personal_country TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS personal_zip_code TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS business_flat_no TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS business_street TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS business_city TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS business_state TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS business_country TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS business_zip_code TEXT;

-- 2. HELPER FUNCTIONS
-- Standardize get_my_claim to avoid recursion
CREATE OR REPLACE FUNCTION get_my_claim(claim TEXT)
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> claim,
    current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> claim,
    current_setting('request.jwt.claims', true)::jsonb ->> claim
  );
$$ LANGUAGE sql STABLE;

-- Sync Profile -> Auth Metadata
CREATE OR REPLACE FUNCTION on_profile_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || 
    jsonb_build_object(
        'user_role', NEW.role, 
        'user_branch', COALESCE(NEW.branch_name, ''),
        'user_branch_id', COALESCE(NEW.branch_id, NEW.branch_name)
    )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-populating lead fields
CREATE OR REPLACE FUNCTION public.handle_lead_creation_metadata()
RETURNS TRIGGER AS $$
DECLARE
  creator_role public.user_role;
  creator_branch text;
  creator_branch_id text;
  creator_id uuid;
BEGIN
  SELECT role, branch_name, branch_id, id INTO creator_role, creator_branch, creator_branch_id, creator_id 
  FROM public.profiles 
  WHERE id = auth.uid();

  IF creator_role = 'Admin' THEN
     NEW.branch_id := COALESCE(NEW.branch_id, creator_branch_id, creator_branch);
     NEW.admin_id := creator_id;
  ELSIF creator_role = 'Sales Executive' THEN
     NEW.branch_id := COALESCE(NEW.branch_id, creator_branch_id, creator_branch);
     IF NEW.admin_id IS NULL THEN
        SELECT id INTO NEW.admin_id 
        FROM public.profiles 
        WHERE (branch_id = NEW.branch_id OR branch_name = NEW.branch_id) 
        AND role = 'Admin' 
        LIMIT 1;
     END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Handle New User (Signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, is_active, branch_name, branch_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'Sales Executive'::public.user_role),
    true,
    NEW.raw_user_meta_data->>'branch_name',
    NEW.raw_user_meta_data->>'branch_id'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2b. FIX FOREIGN KEYS (Ensure CASCADE DELETE)
DELETE FROM public.customers WHERE lead_id NOT IN (SELECT id FROM public.leads);

ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_lead_id_fkey;
ALTER TABLE public.customers
    ADD CONSTRAINT customers_lead_id_fkey
    FOREIGN KEY (lead_id)
    REFERENCES public.leads(id)
    ON DELETE CASCADE;

-- 3. ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. RE-CREATE POLICIES (Explicit & Non-Recursive)

-- Profiles
CREATE POLICY "Super Admin View All Profiles" ON public.profiles FOR SELECT USING (
  (COALESCE(get_my_claim('user_role'), '')::text = 'Super Admin'::text)
);
CREATE POLICY "View Own Profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin View Branch Profiles" ON public.profiles FOR SELECT USING (
  (COALESCE(get_my_claim('user_role'), '')::text = 'Admin'::text) AND
  (branch_id = get_my_claim('user_branch_id') OR branch_name = get_my_claim('user_branch'))
);
CREATE POLICY "Manage Own Profile" ON public.profiles FOR ALL USING (auth.uid() = id);

-- Leads
CREATE POLICY "Super Admin Full Access Leads" ON public.leads FOR ALL USING (
  (COALESCE(get_my_claim('user_role'), '')::text = 'Super Admin'::text)
);
CREATE POLICY "Admin Branch Access Leads" ON public.leads FOR ALL USING (
  (COALESCE(get_my_claim('user_role'), '')::text = 'Admin'::text) AND
  (branch_id = get_my_claim('user_branch_id') OR branch_id = get_my_claim('user_branch'))
);
CREATE POLICY "Sales Exec Assigned Leads" ON public.leads FOR ALL USING (
  assigned_to = auth.uid()
);

-- Customers
CREATE POLICY "Super Admin Full Access Customers" ON public.customers FOR ALL USING (
  (COALESCE(get_my_claim('user_role'), '')::text = 'Super Admin'::text)
);
CREATE POLICY "Admin Branch Access Customers" ON public.customers FOR ALL USING (
  (COALESCE(get_my_claim('user_role'), '')::text = 'Admin'::text) AND
  (branch_id = get_my_claim('user_branch_id') OR branch_id = get_my_claim('user_branch'))
);
CREATE POLICY "Sales Exec Assigned Customers" ON public.customers FOR ALL USING (
  assigned_to = auth.uid()
);

-- Notifications
CREATE POLICY "User Own Notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Documents (Simplified)
CREATE POLICY "Authenticated Access Documents" ON public.documents FOR ALL USING (auth.role() = 'authenticated');

-- Offers
CREATE POLICY "Offers Permissive Access" ON public.offers FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 5. RE-APPLY TRIGGERS
CREATE TRIGGER on_profile_updated
AFTER INSERT OR UPDATE OF role, branch_name, branch_id ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION on_profile_change();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_lead_created_meta
BEFORE INSERT ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.handle_lead_creation_metadata();

CREATE TRIGGER on_customer_created_meta
BEFORE INSERT ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.handle_lead_creation_metadata();

UPDATE public.profiles SET branch_id = branch_name WHERE branch_id IS NULL AND branch_name IS NOT NULL;

COMMIT;
`;

