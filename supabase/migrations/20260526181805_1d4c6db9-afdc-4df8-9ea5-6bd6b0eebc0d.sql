-- Standardize profiles table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.profiles ADD COLUMN tenant_id UUID REFERENCES public.companies(id);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'company_id') THEN
            UPDATE public.profiles SET tenant_id = company_id;
        END IF;
    END IF;
END $$;

-- Update get_auth_tenant() to use tenant_id
CREATE OR REPLACE FUNCTION public.get_auth_tenant()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Standardize all operational tables
DO $$ 
DECLARE
    t_name TEXT;
    tables_to_fix TEXT[] := ARRAY[
        'properties', 'inspections', 'non_conformities', 'quality_indicators', 
        'client_profiles', 'checklist_templates', 'documents', 'notifications', 
        'warranty_requests', 'audit_logs', 'client_events', 'construction_updates', 
        'announcements', 'calendar_events', 'support_tickets', 'support_messages',
        'checklist_items', 'inspection_answers', 'maintenance_orders'
    ];
BEGIN 
    FOR t_name IN SELECT unnest(tables_to_fix) LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t_name AND table_schema = 'public') THEN
            -- Add tenant_id if missing
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t_name AND column_name = 'tenant_id') THEN
                EXECUTE format('ALTER TABLE public.%I ADD COLUMN tenant_id UUID REFERENCES public.companies(id)', t_name);
            END IF;
            
            -- Migrate company_id to tenant_id if company_id exists and tenant_id is null
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t_name AND column_name = 'company_id') THEN
                EXECUTE format('UPDATE public.%I SET tenant_id = company_id WHERE tenant_id IS NULL', t_name);
            END IF;
        END IF;
    END LOOP;
END $$;

-- Update the Isolation Policy helper
CREATE OR REPLACE FUNCTION public.apply_tenant_isolation(p_table_name TEXT)
RETURNS VOID AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = p_table_name AND table_schema = 'public') THEN
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', p_table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation Policy" ON public.%I', p_table_name);
        EXECUTE format('CREATE POLICY "Tenant Isolation Policy" ON public.%I FOR ALL USING (
            public.is_super_admin() OR 
            tenant_id = public.get_auth_tenant()
        )', p_table_name);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
DO $$ 
DECLARE
    t_name TEXT;
    tables_to_isolate TEXT[] := ARRAY[
        'properties', 'inspections', 'non_conformities', 'quality_indicators', 
        'client_profiles', 'checklist_templates', 'documents', 'notifications', 
        'warranty_requests', 'audit_logs', 'client_events', 'construction_updates', 
        'announcements', 'calendar_events', 'support_tickets', 'support_messages',
        'checklist_items', 'inspection_answers', 'maintenance_orders'
    ];
BEGIN 
    FOR t_name IN SELECT unnest(tables_to_isolate) LOOP
        PERFORM public.apply_tenant_isolation(t_name);
    END LOOP;
END $$;