-- Create audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    payload JSONB,
    previous_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create roles and permissions mapping table
CREATE TABLE IF NOT EXISTS public.roles_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    permission TEXT NOT NULL,
    company_id UUID REFERENCES public.companies(id),
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(role, permission, company_id)
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles_permissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Super admins can manage all companies" ON public.companies;
    DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
    DROP POLICY IF EXISTS "Admins can view their own company" ON public.companies;
    
    DROP POLICY IF EXISTS "Super admins can manage all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view profiles in their company" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    
    DROP POLICY IF EXISTS "Super admins can manage all properties" ON public.properties;
    DROP POLICY IF EXISTS "Users can manage properties in their company" ON public.properties;
    DROP POLICY IF EXISTS "Users can only access their own company's data" ON public.properties;
    DROP POLICY IF EXISTS "Tenant isolation for properties" ON public.properties;
    
    DROP POLICY IF EXISTS "Super admins can manage all inspections" ON public.inspections;
    DROP POLICY IF EXISTS "Users can manage inspections in their company" ON public.inspections;
    DROP POLICY IF EXISTS "Users can only access their own company's data" ON public.inspections;
    DROP POLICY IF EXISTS "Tenant isolation for inspections" ON public.inspections;
END $$;

-- RE-CREATE POLICIES WITH CONSISTENT LOGIC

-- COMPANIES
CREATE POLICY "Super admins access all companies" ON public.companies FOR ALL USING ((SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Users view own company" ON public.companies FOR SELECT USING (id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- PROFILES
CREATE POLICY "Super admins access all profiles" ON public.profiles FOR ALL USING ((SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Users view company profiles" ON public.profiles FOR SELECT USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- PROPERTIES
CREATE POLICY "Tenant isolation properties" ON public.properties FOR ALL USING (
  (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
  OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- INSPECTIONS
CREATE POLICY "Tenant isolation inspections" ON public.inspections FOR ALL USING (
  (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
  OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- AUDIT LOGS
CREATE POLICY "Super admins view all audit logs" ON public.audit_logs FOR SELECT USING ((SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Admins view tenant audit logs" ON public.audit_logs FOR SELECT USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Public insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Function for audit logging
CREATE OR REPLACE FUNCTION public.log_audit_action(
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id TEXT,
    p_payload JSONB DEFAULT NULL,
    p_previous_values JSONB DEFAULT NULL
) RETURNS void AS $$
DECLARE
    v_company_id UUID;
BEGIN
    SELECT company_id INTO v_company_id FROM public.profiles WHERE id = auth.uid();
    INSERT INTO public.audit_logs (company_id, user_id, action, entity_type, entity_id, payload, previous_values)
    VALUES (v_company_id, auth.uid(), p_action, p_entity_type, p_entity_id, p_payload, p_previous_values);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
